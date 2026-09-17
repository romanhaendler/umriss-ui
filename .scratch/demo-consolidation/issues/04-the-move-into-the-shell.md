# 04 — The charts demo moves into the shell

Status: done
Type: task

Blocked by: 01, 03

Spec: `.scratch/demo-consolidation/spec.md`

## Scope

The thousand lines. `packages/charts/demo` stops carrying a shell of its own and renders inside `@umriss-ui/demo`, as the other two demos do.

**Deleted:** `Shell.tsx` (391), `shell.css` (623) — including the hand-built `Palette()` and `Section()`. Of its 29 class names, 18 exist in the shared stylesheet under the same name; the rest are either page-level (they move to `demo.css` if still used) or die with the file.

**Written**, both modelled on `packages/table/demo/`:

- `App.tsx` — theme state and the `Shell` from `@umriss-ui/demo`, with `brand`, `version`, `title`, `sentence` and the theme button. **Keep the call to `invalidateTheme()`** on a theme change: charts caches its resolved theme colours and today `Showcase` is what invalidates them. A demo that switches to dark and draws the old colours is the defect this line prevents.
- `main.tsx` — the four Geist faces, `@umriss-ui/core/styles.css`, then `@umriss-ui/demo/shell.css` and `@umriss-ui/demo/page.css`, then the charts stylesheet. The order of stylesheets is part of the appearance (`TESTS.md`); table's `main.tsx` head explains the same thing and is the model.
- `vite.demo.config.ts` — the aliases charts has never needed: `@umriss-ui/core` to `../core/src/index.ts` and `@umriss-ui/core/styles.css` to a two-line `ui-styles.css`, exactly as `packages/table` does it, for the same reason (the package stylesheet exists only after a build).

`demo.css` keeps only what is charts' own: canvas sizing, the lane labels, the benchmark's controls.

The shared shell hard-codes the sidebar's accessible name (`<nav aria-label="Components">`) and the shared shell check queries it by that name. That is correct for chart components too and needs no change — noted here so nobody "fixes" it.

## Acceptance

- `Shell.tsx` and `shell.css` no longer exist under `packages/charts/demo`.
- `pnpm dev:charts` shows the shared shell: sidebar, overview, palette, copy button, source under each example.
- The theme button switches light and dark, and the charts redraw in the new colours — the `invalidateTheme` check.
- `pnpm build:demo` and `pnpm preview:demo` work on port 4174 as before.
- `pnpm lint` and `pnpm typecheck` are green.
