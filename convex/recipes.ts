import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_created_at")
      .order("desc")
      .take(50);
  },
});

export const get = query({
  args: { recipeId: v.id("recipes") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) return null;

    const [ingredients, steps, questions] = await Promise.all([
      ctx.db
        .query("ingredients")
        .withIndex("by_recipe_id_and_sort_order", (q) => q.eq("recipeId", args.recipeId))
        .take(100),
      ctx.db
        .query("steps")
        .withIndex("by_recipe_id_and_sort_order", (q) => q.eq("recipeId", args.recipeId))
        .take(100),
      ctx.db
        .query("questions")
        .withIndex("by_recipe_id_and_resolved", (q) => q.eq("recipeId", args.recipeId))
        .take(50),
    ]);

    return {
      recipe,
      ingredients: ingredients.sort((a, b) => a.sortOrder - b.sortOrder),
      steps: steps.sort((a, b) => a.sortOrder - b.sortOrder),
      questions: questions.sort((a, b) => Number(a.resolved) - Number(b.resolved)),
    };
  },
});

export const createDraft = mutation({
  args: {
    title: v.string(),
    story: v.string(),
    sourceText: v.string(),
  },
  returns: v.id("recipes"),
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (!title || title.length > 120) throw new Error("Give this recipe a short title.");
    if (!args.sourceText.trim()) throw new Error("Keep the original words with the recipe.");
    return await ctx.db.insert("recipes", {
      title,
      story: args.story.trim(),
      sourceText: args.sourceText.trim(),
      status: "draft",
      emoji: "🍽️",
      cookTimeMinutes: null,
      createdAt: Date.now(),
    });
  },
});

export const approve = mutation({
  args: { recipeId: v.id("recipes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found.");
    await ctx.db.patch(args.recipeId, { status: "approved" });
    return null;
  },
});

export const seedDemo = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("recipes")
      .withIndex("by_title", (q) => q.eq("title", "Grandma's Chess Squares"))
      .unique();
    if (existing) return null;

    const chessSquaresId = await ctx.db.insert("recipes", {
      title: "Grandma's Chess Squares",
      story: "A family favorite worth getting in her own words.",
      sourceText:
        "Grandma explained that the chocolate layer should stay soft and the top should be mixed until it comes together. Confirm the exact oven temperature and how long she bakes it.",
      status: "draft",
      emoji: "🍫",
      cookTimeMinutes: 45,
      createdAt: Date.now(),
    });
    const steakId = await ctx.db.insert("recipes", {
      title: "Cubed Steak, Gravy & Rice",
      story: "Tonight's supper — the kind you learn by standing beside the stove.",
      sourceText:
        "Season and flour the cubed steak, brown it in a skillet, then make gravy from the pan. Serve it over rice. The key details are in the way the gravy looks, not a perfect measuring cup.",
      status: "approved",
      emoji: "🍲",
      cookTimeMinutes: 35,
      createdAt: Date.now() - 1,
    });

    for (const [recipeId, items] of [
      [chessSquaresId, ["Butter", "Cocoa", "Sugar", "Eggs", "Flour"]],
      [steakId, ["Cubed steak", "Flour", "Seasoning", "Oil", "Broth or milk", "Rice"]],
    ] as const) {
      for (const [sortOrder, name] of items.entries()) {
        await ctx.db.insert("ingredients", { recipeId, name, amount: null, sortOrder });
      }
    }
    const steps = [
      "Season the cubed steak and dust both sides lightly with flour.",
      "Brown the steak in a hot skillet. Work in batches so it sears instead of steams.",
      "Build gravy from the browned bits in the pan, stirring until it looks smooth.",
      "Return the steak to the gravy and simmer gently until tender. Serve over rice.",
    ];
    for (const [sortOrder, body] of steps.entries()) {
      await ctx.db.insert("steps", { recipeId: steakId, body, minutes: sortOrder === 3 ? 15 : null, sortOrder });
    }
    await ctx.db.insert("questions", {
      recipeId: chessSquaresId,
      prompt: "Grandma, what oven temperature and bake time do you use for Chess Squares?",
      answer: null,
      resolved: false,
    });
    return null;
  },
});
