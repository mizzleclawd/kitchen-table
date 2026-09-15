import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
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
    return { questionId, recipeId };
  });
  return { ids, t };
}

describe("family clarification review", () => {
  it("blocks approval while a question is unresolved", async () => {
    const { ids, t } = await createRecipeWithQuestion();

    await expect(
      t.mutation(api.recipes.approve, { recipeId: ids.recipeId }),
    ).rejects.toThrow("Answer every family question");

    const recipe = await t.run((ctx) => ctx.db.get(ids.recipeId));
    expect(recipe?.status).toBe("draft");
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
});
