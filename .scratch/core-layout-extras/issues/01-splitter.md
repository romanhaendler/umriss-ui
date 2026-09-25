# 01 - Splitter

Status: done
Type: task

Spec: `.scratch/core-layout-extras/spec.md`

## Scope

L1.

## Acceptance

- Keyboard per APG; screenshots.

## Comments

Delivered as `Splitter` (`src/components/Splitter`): two panes as grid tracks in `fr`, so the separator's strip is taken off before the rest is shared; `orientation` `horizontal` (side by side, the separator `aria-orientation="vertical"`) or `vertical` (stacked); `value`/`defaultValue`/`onChange` as the first pane's share in per cent, `min`/`max`/`step`. The separator is a focusable `role="separator"` with `aria-valuenow`/`-min`/`-max` and `aria-controls` on the first pane, named by `separatorLabel` or the new wording key `splitter`. Keys per the APG window splitter: the arrows of its axis by `step`, Home/End to the bounds, Enter collapses to `min` and restores the share it had (the middle for a pane that started collapsed). The pointer drags it with pointer capture, on a tenth of a per cent. Tests: `tests-unit/splitter.test.tsx`; the real pane sizes under keys and drag in `features-basics.spec.ts`; axe and own-base on the page; four examples photographed light and dark, the first under forced colours. Not built: F6 between panes (optional in the APG) and a grip glyph on the line - a matter for 04.
