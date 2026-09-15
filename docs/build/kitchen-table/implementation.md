# Kitchen Table implementation

## Phase 1 — Family cookbook core

**Objective:** Browse source-preserving recipe drafts and cook a recipe one
step at a time.

**Files:** `convex/schema.ts`, `convex/recipes.ts`, `app/page.tsx`,
`app/layout.tsx`, `app/globals.css`.

**Verify:** Open the local app. See Chess Squares and Cubed Steak, Gravy & Rice,
open either card, switch to Cook Mode, and move through steps.

## Phase 2 — Capture and review

**Objective:** Add written/recorded source capture, an AI draft workflow, and
explicit clarification questions.

**Verify:** Paste or record a recollection, review its source beside the draft,
and answer a question before approving it.

## Phase 3 — Private family sharing

**Objective:** Add authentication, household membership, and safe media access.

**Verify:** A signed-in household member can see their cookbook; a different
account cannot read it by guessing an ID.

## Phase 2a — Close the family clarification loop

**Objective:** Let a family member answer every open clarification and prevent
approval until the recipe has no unresolved questions.

**Files:** `convex/recipes.ts`, `app/page.tsx`,
`components/QuestionAnswerForm.tsx`, and the Kitchen Table build notes.

**Verify:** Open Grandma's Chess Squares, enter an answer to the missing
temperature/time question, save it, and see the answer preserved. Before that
answer is saved, the approval control explains why approval is blocked; after
the final answer, the recipe can be marked family-approved.
