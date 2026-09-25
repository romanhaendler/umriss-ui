# 03 - Forced colours on the canvas

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/charts-alternatives/spec.md`

## Scope

C4, emulated in Playwright (`forcedColors: "active"`).

## Acceptance

- Screenshots under forced colours; the theme resolves system colours.

## Comments

Delivered (2026-09-24). `resolveTheme` asks `matchMedia("(forced-colors:
active)")`; when it matches, the theme is the system colours - `CanvasText`
for text, axes and all six series, `Canvas` for the ground, `GrayText` for
the grid, `Highlight` for warning and alarm, `CanvasText` for ok - and
`ResolvedTheme.forced` is true. The scene then encodes by marks whatever
`encoding` says, and paints every caller colour (`color`, states, matrix
stops) as `CanvasText`. Entering or leaving the mode invalidates the theme.

Found on the way, measured in the browser: forced colours repaint an
element's `color` at computed-value time, so the theme's probe read every
colour back as the text colour - "Canvas" too. The probe reads system colours
with `forced-color-adjust: none`, only for the forced theme, so
`resolveColours` (the schedule's) behaves as before.

Two things about the emulation, both in `docs/testing.md`: the
`forcedColors` context option does not exist in this Playwright, so the spec
calls `page.emulateMedia({ forcedColors: "active" })` before loading; and
Chromium's emulated contrast themes are not black and white alone - GrayText
is a dark red in light and a green in dark -, so the canvas check asks "no
palette colour" rather than "only greys" (and proves itself against the same
chart unforced).

Not done, and not the canvas: forced colours remove every `box-shadow`, so
the chart's focus ring (and core's, which uses the same canon) is invisible
in the contrast mode. An outline under `@media (forced-colors: active)` would
break the focus canon guard in `packages/core/tests-unit/stylesheets.test.ts`
("by the ring and by nothing else"); it is a workspace question, left for the
polish round or a spec of its own. The tooltip's colour chips vanish under
forced colours as well (their names stay).

Tests: `theme.jsdom.test.ts` (system colours, series in the text colour, not
forced otherwise), `encoding.jsdom.test.tsx` (marks switch on by themselves);
Playwright `forced-colors.spec.ts`: the chip in `CanvasText` with the second
place's dash on a chart without `encoding`, no palette pixel on its canvas,
and four examples photographed forced in light and dark - eight new
baselines, each looked at, stable over `--repeat-each=3`. Full charts suite:
191 passed, no existing picture moved.
