# Kitchen Table

**A family cookbook prototype that keeps the recipe and the voice behind it.**

Kitchen Table preserves a relative's original words alongside a structured,
cookable recipe. It is designed for the stories, pinches, and unresolved details
that make a family recipe worth keeping.

## Current status

**Public demo — demo data only.**

Kitchen Table is a public hackathon prototype. It deliberately contains only
fictional/demo recipe text and has no authentication or household privacy model.
Do **not** enter real family recordings, recipes, names, or other private data.

What works locally:

- Browse and seed demo recipes
- Capture source words with a recipe draft
- Preserve source words on the recipe detail page
- Track unresolved questions
- Mark a draft family-approved
- Cook Mode for step-by-step use

## Roadmap

1. **Phase 2 — capture and review:** source-linked written recollections,
   clarification answers, and structured drafts without inventing details.
2. **Phase 3 — private sharing:** authentication, household ownership, and
   private media storage.
3. **Private sharing:** deploy real family material only after Phase 3 provides
   appropriate access controls.

Progress and implementation notes live in
[`docs/build/kitchen-table/`](docs/build/kitchen-table/).

## Local development

### Requirements

- Node.js 20+
- pnpm
- A Convex deployment (development or production)

### Run it

```bash
pnpm install
pnpm exec convex dev
```

In a second terminal:

```bash
pnpm dev
```

Then open the local URL printed by Next.js (normally `http://localhost:3000`).

Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local`; do not commit that file. For a
production build, use the URL from `pnpm exec convex function-spec --prod`.

## Safety and data handling

- The original source words are the record; structured fields must not replace
  or silently rewrite them.
- Do not invent measurements, timings, ingredients, or family attribution.
- Do not publish, enable third-party transcription/AI, or add real family data
  without the owner's explicit approval.

For autonomous implementation boundaries, see [`agent.md`](agent.md).
