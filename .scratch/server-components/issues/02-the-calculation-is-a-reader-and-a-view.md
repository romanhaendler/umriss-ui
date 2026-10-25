# 02 - The calculation is a reader and a view

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/server-components/spec.md`

## What to build

The prefactor for 03. Nothing a caller sees changes, and the package is still built as one file with the
directive.

- `<Calculation>` becomes a reader: a component without hooks. It builds the model from its children and
  `metrics`, then renders the view with that model and every other prop it was given. That includes
  `className`, `style`, `density`, the `aria-*` attributes and `ref`.
- The view is today's component without the reading. It holds evaluation, the folding and hover state, the
  measuring, the density, the formats and the wording. It is not exported.
- The model the reader hands over holds only what React can serialise across a Server Component boundary:
  strings, numbers, `null`, Dates, plain objects and arrays, a Map, and JSX (`aside`). If it holds anything
  else today (a function, a class instance), that moves to the view's side.
- The reader and the elements import nothing from `@umriss-ui/core` at runtime (type imports are fine). On
  the server, core's every export is a client reference. The arithmetic, which calls core's `assess`, stays
  with the view.

## Acceptance criteria

- [ ] `pnpm check calculation` passes with the unit tests unchanged, the server test included.
- [ ] A unit test asserts that the model a reader builds survives a round trip through `structuredClone`,
      for the costing and OEE examples and for one with metrics. Structured clone is close enough to what
      React serialises to catch a function or a class instance. The `aside` JSX is the one exception, so
      the test leaves it out.
- [ ] The reader's module and the elements' module have no runtime import of `@umriss-ui/core` and no hook
      call. A comment in the reader says why: it must run in a Server Component.
- [ ] `pnpm check:site` passes; calculation's `API.md` is unchanged (the view is not an export).
- [ ] `pnpm test:visual:quick calculation` passes.
