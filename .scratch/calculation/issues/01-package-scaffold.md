# 01 — `@umriss-ui/calculation`: the package and its demo shell

Status: ready-for-agent
Type: task

Blocked by: none
Spec: `.scratch/calculation/spec.md` ("Package") · ADR-0027

## Scope

- `packages/calculation` after the table's pattern (the table depends on core
  only, as this package does): manifest with core as peer, `vite.config.ts`,
  `vite.demo.config.ts`, `tsconfig`s, vitest config, `check:dist`, `LICENSE`,
  `README.md` and `CHANGELOG.md` as stubs (filled in 07).
- Lint: the package imports core by its public entry only; no package imports
  the calculation.
- The demo on the shared shell (ADR-0020): `demo/` with outline, examples glob,
  props gate, the next free port after the schedule's, Playwright projects
  `calculation-light`/`calculation-dark`, `pnpm dev:calculation`, `build:pages`.
- The package's unit guards, as the table and schedule have them: style rules,
  focus, wording, demo smoke.
- An empty `Calculation` export is enough to make the guards run.

## Acceptance

- `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- `pnpm --filter @umriss-ui/calculation build && check:dist` passes, and the
  bundle imports `@umriss-ui/core` instead of inlining it.
