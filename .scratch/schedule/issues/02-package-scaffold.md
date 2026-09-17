# 02 — `@umriss-ui/schedule`: the package and its demo shell

Status: ready-for-agent
Type: task

Blocked by: none
Spec: `.scratch/schedule/spec.md` ("Package", "Styling", "Demo") · ADR-0022

## Scope

- `packages/schedule` after the table's pattern: manifest (peers core and
  charts), `vite.config.ts` with `importOwnCss`, `tsconfig`s, vitest config,
  `check:dist`, `LICENSE`, `README.md`, `CHANGELOG.md`.
- Lint: the schedule imports only the public entries of core and charts; no
  package imports the schedule.
- Charts publishes what the schedule takes that is not public yet: the canvas
  colour resolution (`resolveColours`, `subscribeTheme`) and
  `toOperatingTimeClamped`.
- The demo on the shared shell: `demo/` with outline, examples glob, props
  gate, port 4176, Playwright projects `schedule-light`/`schedule-dark`,
  `pnpm dev:schedule`, `build:pages`.
- The package's unit guards: style rules, focus, wording, demo smoke.

## Acceptance

- `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.
- `pnpm --filter @umriss-ui/schedule build && check:dist` passes.

## Comments
