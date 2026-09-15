import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

declare global {
  interface ImportMeta {
    glob(pattern: string): Record<string, () => Promise<unknown>>;
  }
}

const modules = import.meta.glob("./**/*.*s");

async function createRecipeWithQuestion() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const recipeId = await ctx.db.insert("recipes", {
      title: "Grandma's Chess Squares",
      story: "The version the family remembers.",
      sourceText: "Bake it until the top looks right.",
      status: "draft",
      extractionStatus: "complete",
      emoji: "🍫",
      cookTimeMinutes: null,
      createdAt: Date.now(),
    });
    const questionId = await ctx.db.insert("questions", {
      recipeId,
      prompt: "What temperature and bake time do you use?",
      answer: null,
      resolved: false,
    });
    await ctx.db.insert("steps", {
      recipeId,
      body: "Bake it until the top looks right.",
      minutes: null,
      sortOrder: 0,
    });
    return { questionId, recipeId };
  });
  return { ids, t };
}

describe("family clarification review", () => {
  it("blocks approval until extraction finishes and creates its questions", async () => {
    const t = convexTest(schema, modules);
    const recipeId = await t.run((ctx) =>
      ctx.db.insert("recipes", {
        title: "Grandma's Biscuits",
        story: "Captured while cooking together.",
        sourceText: "Mix it until it feels right, then bake it.",
        status: "draft",
        extractionStatus: "pending",
        emoji: "🍞",
        cookTimeMinutes: null,
        createdAt: Date.now(),
      }),
    );

    await expect(t.mutation(api.recipes.approve, { recipeId })).rejects.toThrow(
      "finishes reviewing",
    );

    await t.mutation(internal.recipes.applyExtraction, {
      recipeId,
      ingredients: [],
      steps: [{ body: "Mix it until it feels right, then bake it." }],
      questions: [{ prompt: "How hot is the oven?" }],
    });

    await expect(t.mutation(api.recipes.approve, { recipeId })).rejects.toThrow(
      "Answer every family question",
    );

    const { question, recipe } = await t.run(async (ctx) => ({
      question: await ctx.db
        .query("questions")
        .withIndex("by_recipe_id_and_resolved", (q) =>
          q.eq("recipeId", recipeId).eq("resolved", false),
        )
        .first(),
      recipe: await ctx.db.get(recipeId),
    }));
    expect(recipe).toMatchObject({
      extractionStatus: "complete",
      status: "draft",
    });
    expect(question?.prompt).toBe("How hot is the oven?");
  });

  it("blocks approval while a question is unresolved", async () => {
    const { ids, t } = await createRecipeWithQuestion();

    await expect(
      t.mutation(api.recipes.approve, { recipeId: ids.recipeId }),
    ).rejects.toThrow("Answer every family question");

    const recipe = await t.run((ctx) => ctx.db.get(ids.recipeId));
    expect(recipe?.status).toBe("draft");
  });

  it("blocks approval when extraction produced no cooking steps", async () => {
    const t = convexTest(schema, modules);
    const recipeId = await t.run((ctx) =>
      ctx.db.insert("recipes", {
        title: "Grandma's Tea",
        story: "The family version.",
        sourceText: "Make it the way Grandma likes it.",
        status: "draft",
        extractionStatus: "complete",
        emoji: "🫖",
        cookTimeMinutes: null,
        createdAt: Date.now(),
      }),
    );

    await expect(t.mutation(api.recipes.approve, { recipeId })).rejects.toThrow(
      "at least one cooking step",
    );
  });

  it("seeds Cook Mode steps for Grandma's Chess Squares", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.recipes.seedDemo, {});

    const seededRecipe = await t.run(async (ctx) => {
      const recipe = await ctx.db
        .query("recipes")
        .withIndex("by_title", (q) => q.eq("title", "Grandma's Chess Squares"))
        .first();
      if (!recipe) return null;
      const steps = await ctx.db
        .query("steps")
        .withIndex("by_recipe_id_and_sort_order", (q) =>
          q.eq("recipeId", recipe._id),
        )
        .collect();
      return { recipe, steps };
    });

    expect(seededRecipe?.recipe.extractionStatus).toBe("complete");
    expect(seededRecipe?.steps.map((step) => step.body)).toEqual([
      "Mix the top until it comes together.",
      "Bake until the chocolate layer stays soft.",
    ]);
  });

  it("preserves the family answer and then allows approval", async () => {
    const { ids, t } = await createRecipeWithQuestion();

    await t.mutation(api.recipes.answerQuestion, {
      questionId: ids.questionId,
      answer: " 350 degrees for about 30 minutes. ",
    });
    await t.mutation(api.recipes.approve, { recipeId: ids.recipeId });

    const { question, recipe } = await t.run(async (ctx) => ({
      question: await ctx.db.get(ids.questionId),
      recipe: await ctx.db.get(ids.recipeId),
    }));
    expect(question).toMatchObject({
      answer: "350 degrees for about 30 minutes.",
      resolved: true,
    });
    expect(recipe?.status).toBe("approved");
  });

  it("rejects empty family answers", async () => {
    const { ids, t } = await createRecipeWithQuestion();

    await expect(
      t.mutation(api.recipes.answerQuestion, {
        questionId: ids.questionId,
        answer: "   ",
      }),
    ).rejects.toThrow("Add the family answer");
  });

  it("does not overwrite an answer that was already resolved", async () => {
    const { ids, t } = await createRecipeWithQuestion();

    await t.mutation(api.recipes.answerQuestion, {
      questionId: ids.questionId,
      answer: "350 degrees for about 30 minutes.",
    });
    await expect(
      t.mutation(api.recipes.answerQuestion, {
        questionId: ids.questionId,
        answer: "Actually, make it 400 degrees.",
      }),
    ).rejects.toThrow("already has an answer");

    const question = await t.run((ctx) => ctx.db.get(ids.questionId));
    expect(question?.answer).toBe("350 degrees for about 30 minutes.");
  });

  it("does not accept answers after the recipe is approved", async () => {
    const t = convexTest(schema, modules);
    const questionId = await t.run(async (ctx) => {
      const recipeId = await ctx.db.insert("recipes", {
        title: "Grandma's Cornbread",
        story: "The family version.",
        sourceText: "Bake it until the edges look right.",
        status: "approved",
        extractionStatus: "complete",
        emoji: "🌽",
        cookTimeMinutes: null,
        createdAt: Date.now(),
      });
      return await ctx.db.insert("questions", {
        recipeId,
        prompt: "What do the edges look like?",
        answer: null,
        resolved: false,
      });
    });

    await expect(
      t.mutation(api.recipes.answerQuestion, {
        questionId,
        answer: "Deep golden brown.",
      }),
    ).rejects.toThrow("Approved recipes cannot accept");
  });
});
