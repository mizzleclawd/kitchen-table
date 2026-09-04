# Kitchen Table — Convex All Gas Hackathon

## What it is

Kitchen Table is a cookbook prototype for preserving the *words behind a
recipe*, not merely normalizing ingredients into a card. Each recipe keeps a
verbatim source-text record beside a cookable structure, with unresolved family
questions visible instead of silently invented.

## Why Convex

The app uses Convex as its live recipe store and mutation layer. The web client
subscribes to `recipes:list` for its collection view and reads each recipe with
`recipes:get`. Draft capture, approval, and demo seeding are Convex mutations.
The production deployment owns the schema, indexes, and demo data.

## Evidence of the working prototype

- Production Convex deployment: `abundant-roadrunner-968.convex.cloud`
- Production functions: `recipes:list`, `recipes:get`, `recipes:createDraft`,
  `recipes:approve`, and `recipes:seedDemo`
- Seeded demo data: *Grandma's Chess Squares* and *Cubed Steak, Gravy & Rice*
- Public web demo: see the repository homepage / README once the deployment URL
  is recorded.

## Reproduce locally

```bash
pnpm install
pnpm exec convex dev
pnpm dev
```

See [README.md](README.md) for setup and data-handling boundaries. The public
demo contains fictional data only; it is not yet safe for real family material.
