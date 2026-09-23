# 04 — Worked examples, from simple to very extensive

Status: done
Type: task

Blocked by: 03
Spec: "Solution", "Testing Decisions"

## Scope

The demo is where a developer learns the package, and three pages of five
examples are too few. Many concrete examples, ordered from the simplest to a
very extensive one - each a real figure from a plant or an office, never
`a + b`. A proposal to start from; the ladder matters more than the exact list:

**First steps** - two givens and a sum; a quotient as a percentage with a
target; a difference of three; a product with units.
**What can go wrong** - a missing given carried to the result; a division by
zero; rounded figures that do not add up (≈); a limit violated deep inside a
folded derivation.
**Tree** - a quantity used twice through a reference; OEE; first-pass yield
across three stations; energy per piece.
**Chain** - net weight (gross − tare − packaging); a shift's cost items as a
flat chain; fifteen cost items from data with `.map`; mark-up and VAT with
times after an interim; the costing sheet of the spec (the lead case).
**Mixed** - a chain whose lines hold trees (overheads on a named base); a
chain as an operand in a tree.
**Around a quantity** - explanation, source and freshness, a sparkline as
aside; the German wording through `LanguageProvider`.
**Worked in full** - the cost per piece of a production order: bill of
material from data, machine hours × rate per workstation from data, setup
spread over the lot size, a scrap surcharge, overheads, mark-up, VAT - several
dozen quantities, chains inside trees inside chains, and at least one figure
missing or stale.

- Pages cut by what a reader looks up (as the other demos): proposal
  Calculation, Tree, Chain, Given, What can go wrong, Worked examples. The
  outline stays data in `demo/outline.ts`.
- Props tables through the gate; new baselines light and dark for every
  picture; the axe sample covers every page.

## Acceptance

- `pnpm test:unit` green (demo smoke: every page, every example); the image
  and accessibility checks pass with the new baselines.
