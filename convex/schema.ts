import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Your app's tables go here — add them as you build the schema.
export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    story: v.string(),
    sourceText: v.string(),
    status: v.union(v.literal("draft"), v.literal("approved")),
    emoji: v.string(),
    cookTimeMinutes: v.union(v.number(), v.null()),
    createdAt: v.number(),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_title", ["title"]),
  ingredients: defineTable({
    recipeId: v.id("recipes"),
    name: v.string(),
    amount: v.union(v.string(), v.null()),
    sortOrder: v.number(),
  }).index("by_recipe_id_and_sort_order", ["recipeId", "sortOrder"]),
  steps: defineTable({
    recipeId: v.id("recipes"),
    body: v.string(),
    minutes: v.union(v.number(), v.null()),
    sortOrder: v.number(),
  }).index("by_recipe_id_and_sort_order", ["recipeId", "sortOrder"]),
  questions: defineTable({
    recipeId: v.id("recipes"),
    prompt: v.string(),
    answer: v.union(v.string(), v.null()),
    resolved: v.boolean(),
  }).index("by_recipe_id_and_resolved", ["recipeId", "resolved"]),
});
