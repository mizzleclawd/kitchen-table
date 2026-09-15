# Progress

## Phase 1 — 2026-08-30

Built the local Kitchen Table cookbook core: recipes retain their original
source words; drafts can be created and marked family-approved; recipe detail
shows ingredients and unresolved questions; Cubed Steak has large-step Cook
Mode. Seeded the initial demo with Grandma's Chess Squares and Cubed Steak,
Gravy & Rice.

The prototype has no authentication. It is suitable only for seeded demo data
on a local development deployment; it must not be hosted publicly or contain
real family material. Phase 2 adds written capture and source-grounded review.
Phase 3 adds authentication and household ownership before any hosted or
real-family use. Audio capture, transcription, and AI assistance require a
separate approved design after that.

## Phase 2a — 2026-09-15

Closed the family clarification loop. A family member can answer each open
question, the answer remains visible beside the original question, and Convex
now rejects recipe approval while any question remains unresolved. The rule is
enforced in the backend as well as the interface, so approval cannot bypass the
review step through a stale client.

Added focused Convex regression coverage for premature approval, answer
preservation, successful approval after resolution, and empty-answer
rejection. Verification receipt: 3/3 tests, TypeScript, ESLint, production
Next.js build, and `git diff --check` all passed.

The public demo still contains fictional data only and has no authentication.
The next hackathon phase should improve the scripted demo/presentation or add
private household boundaries; real family material remains out of scope until
authentication exists.
