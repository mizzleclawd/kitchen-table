"use node";

import { convexGateway } from "@convex-dev/ai-sdk-provider";
import { generateText } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

type Structure = {
  ingredients: { name: string }[];
  steps: { body: string }[];
  questions: { prompt: string }[];
};

const GENERIC_DETAILS_QUESTION =
  "What amounts, heat levels, temperatures, or timings should we preserve from the original recipe?";

const clean = (value: unknown, maxLength: number) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";

function fallbackStructure(sourceText: string): Structure {
  const steps = sourceText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((body) => clean(body, 500))
    .filter(Boolean)
    .slice(0, 20)
    .map((body) => ({ body }));
  return {
    ingredients: [],
    steps: steps.length ? steps : [{ body: clean(sourceText, 500) }],
    questions: [{ prompt: GENERIC_DETAILS_QUESTION }],
  };
}

function parseGatewayStructure(
  sourceText: string,
  text: string,
): Structure | null {
  const json = text.match(/\{[\s\S]*\}/)?.[0];
  if (!json) return null;

  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const source = clean(sourceText, 5_000).toLocaleLowerCase();
    const unique = (values: string[]) => [
      ...new Set(values.map((value) => clean(value, 500)).filter(Boolean)),
    ];
    // A model may select only exact wording from the source. This rejects a
    // plausible-sounding paraphrase before it can introduce an invented value.
    const sourcePhrases = (
      key: "ingredients" | "steps",
      field: "name" | "body",
    ) => {
      const rows = Array.isArray(parsed[key]) ? parsed[key] : [];
      return unique(
        rows.flatMap((row) => {
          if (!row || typeof row !== "object") return [];
          const value = clean((row as Record<string, unknown>)[field], 500);
          return value && source.includes(value.toLocaleLowerCase())
            ? [value]
            : [];
        }),
      );
    };
    const steps = sourcePhrases("steps", "body")
      .slice(0, 20)
      .map((body) => ({ body }));
    if (!steps.length) return null;
    const questionRows = Array.isArray(parsed.questions)
      ? parsed.questions
      : [];
    const questions = unique(
      questionRows.flatMap((row) => {
        if (!row || typeof row !== "object") return [];
        const prompt = clean((row as Record<string, unknown>).prompt, 300);
        return prompt ? [prompt] : [];
      }),
    )
      .slice(0, 8)
      .map((prompt) => ({ prompt }));
    return {
      ingredients: sourcePhrases("ingredients", "name")
        .slice(0, 20)
        .map((name) => ({ name })),
      steps,
      questions: questions.length
        ? questions
        : [{ prompt: GENERIC_DETAILS_QUESTION }],
    };
  } catch {
    return null;
  }
}

async function extract(sourceText: string): Promise<Structure | null> {
  const { text } = await generateText({
    model: convexGateway("anthropic/claude-sonnet-4.5"),
    maxOutputTokens: 1_000,
    prompt: `Turn these family recipe words into a conservative JSON outline.

Return exactly one JSON object with this shape:
{"ingredients":[{"name":"exact phrase from source"}],"steps":[{"body":"exact sentence or phrase copied from source"}],"questions":[{"prompt":"a clarification question"}]}

Rules: Copy steps and ingredients only from the source; do not paraphrase. Never add a measurement, temperature, cook time, quantity, ingredient, or technique not explicitly written. Ask a question for missing amounts, heat, temperature, or timing. Do not include markdown.

SOURCE:\n${sourceText}`,
  });
  return parseGatewayStructure(sourceText, text);
}

export const structure = internalAction({
  args: { recipeId: v.id("recipes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const recipe = await ctx.runQuery(internal.recipes.getSourceForExtraction, {
      recipeId: args.recipeId,
    });
    if (!recipe) return null;

    let structure: Structure | null = null;
    try {
      structure = await extract(recipe.sourceText);
    } catch (error) {
      console.warn(
        "Recipe extraction gateway unavailable; using source-text fallback",
        error,
      );
    }
    await ctx.runMutation(internal.recipes.applyExtraction, {
      recipeId: args.recipeId,
      ...(structure ?? fallbackStructure(recipe.sourceText)),
    });
    return null;
  },
});
