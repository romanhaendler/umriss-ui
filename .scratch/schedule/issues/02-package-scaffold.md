# 02 — `@umriss-ui/schedule`: the package and its demo shell

Status: done
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

**Delivered** (d452d68, with 03–06: the files were written together).

- `packages/schedule` after the table's pattern; `check:dist` passes and the
  bundle imports `@umriss-ui/core` and `@umriss-ui/charts` instead of inlining
  them. README and CHANGELOG came with 08.
- Lint: the schedule takes both peers by the public entry only; `NO_SCHEDULE`
  on core, charts, table and the shell. Found on the way: the block forbidding
  the table to charts matched `packages/charts/src/**` as well and, as a later
  block of the same rule, replaced the R-1.2 ban on core there - an import of
  core in charts' `src` passed `pnpm lint`. The block now ignores `src/`; a probe
  file fails as it should.
- Charts publishes `resolveColours`, `subscribeTheme`, `toOperatingTimeClamped`
  (tests in `theme.jsdom.test.ts`).
- Port 4176, projects `schedule-light`/`schedule-dark`, `pnpm dev:schedule`,
  `build:pages`.
