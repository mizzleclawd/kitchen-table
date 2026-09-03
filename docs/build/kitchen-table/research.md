# Kitchen Table research

## Product

Kitchen Table preserves recipes that live in a relative's memory. A recording or
written recollection is the primary source; the app creates a usable draft while
showing unanswered details for a family member to confirm. It is not a meal
planner or a public recipe site.

## Existing-solutions preflight

Paprika and AnyList are strong personal recipe organizers; their main input is
a complete recipe. Family cookbook products preserve cards and photos. Neither
solves the important capture moment well: someone is explaining a dish from
memory while cooking, measurements are incomplete, and the original words need
to remain available after AI structures the draft. Kitchen Table is scoped to
that gap.

## Technical approach

Use Next.js for the mobile-first interface and Convex as the single source of
truth for recipes, ingredients, steps, and open clarification questions. Store
media in Convex file storage in the capture phase. An action will transcribe and
structure an uploaded recording only after an approved model key is configured;
the original transcript is retained and the model must mark ambiguity as a
question, never invent a measurement.

## Privacy boundary

The first local demo has no authentication because the generated quickstart is
local-only. Before any public or real-family deployment, add authentication and
server-side household membership checks. Do not upload personal family media to
a public deployment without that phase.

## Recommended first release

Ship capture/review/cook before AI transcription. The user can verify the
central value with the chess squares and cubed-steak recipes now; later model
work improves the input path without changing the recipe ownership model.
