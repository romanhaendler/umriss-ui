# 07 — Charts: `.uc-*`, layers, own base, canvas colours from `light-dark()`

Status: ready-for-agent
Type: task

Blocked by: 01, 02, 03
Runs in parallel with: 04, 05, 06. Owns `packages/charts/` entirely.

Spec: `.scratch/styles-without-side-effects/spec.md` ("Charts") · ADR-0021

## Scope

- **Rename** every `kc-` class to `uc-` — CSS, TypeScript, tests, demo,
  `docs/capabilities.md`. `git grep -n 'kc-'` finds nothing afterwards outside
  `.scratch/`.
- **Layer**: `charts.css` rules in `umriss.components` (the order statement came
  with 01). A unit guard like core's: every rule in a layer, no forbidden
  selector.
- **Own base**: text context on `.uc-root` and on the tooltip; focus rings on
  whatever the legend or tooltip makes focusable; the build's `box-sizing`
  covers the rest.
- **Canvas colours**: `theme.ts` resolves every colour field through a probe
  element inside the chart root (`color: var(--uc-…)` → computed `color`), so a
  `light-dark()` token yields a drawable colour. Fonts stay custom-property
  reads. The file head is rewritten accordingly.
- **Invalidation**: additionally `matchMedia("(prefers-color-scheme: dark)")`;
  the `html` observer keeps watching attributes (covers `class`, `style`,
  `data-*`). `invalidateTheme()` stays public; the charts demo stops calling it
  if the observer now catches its switch.
- `themeFallbackConformance.test.ts` (in core) is **not** edited here unless
  02 left it red for charts; if so, say so under Comments.

## Acceptance

- Every `charts-light`/`charts-dark` screenshot green without a renewed baseline
  (the two known flaky ones aside, which are judged by repetition, not renewed).
- `features-interaction.spec.ts` "switching the theme changes the axis and
  series colours without a reload" is green with the demo switching
  `color-scheme`.
- A new unit or browser test: with a token defined as `light-dark(#000, #fff)`,
  the resolved theme gives `rgb(0, 0, 0)` under `color-scheme: light` and
  `rgb(255, 255, 255)` under `dark`.
- 03's checks report no offender in the charts demo.
- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green.

## Comments
