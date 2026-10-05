# 05 — The segmented control at its edges

Status: done

Blocked by: 04

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

The segmented control from 04 holds everywhere a control has to: at the small
size and under a `ControlSizeProvider`; disabled as a whole and per
possibility; in forced colours, where the chosen segment takes the system's
selected-item colours; on a phone, where a control that does not fit its place
ends its words in an ellipsis and the page never scrolls sideways (ADR-0041);
in dark mode. The radio group's and the segmented control's documentation
point at one another. And the look of the chosen segment - ink fill, agreed
with "we see it at the end" - is laid before the owner.

## Acceptance criteria

- [x] `sm` takes the small control height, small radius and small type; a `ControlSizeProvider` sets it, an own `size` wins; the layout test measures the `sm` row on the field line
- [x] Disabled as a whole and per possibility: visible, dimmed, not choosable, skipped by the arrow keys
- [x] The forced-colours run covers the segmented control, with the chosen segment distinguishable
- [x] At 320 px the segmented control stays inside its place and its labels end in an ellipsis (measured)
- [x] The radio group's docs point to the segmented control for short possibilities without explanations, and back
- [x] Screenshots of the row of fields, light and dark, are left for the owner to judge the chosen segment's look
- [x] Lint, types, unit, build and visual pass

## Comments

Delivered. `sm` came with 04 (the row example needed it); here a "States
and sizes" example shows `md`, an own `sm`, the whole control disabled and
one possibility closed, and "Long words in a narrow place" the ellipsis at
320 px (measured, with the row of fields added to the phone sweep). The
radio group's page points to the segmented control and back; the gate's
"not shown yet" entry for `SegmentedOption.disabled` is gone.

Forced colours: the chosen segment takes `SelectedItem` and
`SelectedItemText`. Left to the system, its word got the page's backplate -
dark on dark in the dark theme - so the chosen segment opts out of the
adjustment and paints its own ring in `Highlight`. The ring test of
forced-colors 01 now includes the segmented control. The chosen state is
checked by its picture, as the suite's other surface states are: a computed
style reports the stylesheet's colour, not the one painted, and a check on
it passed while the segment was indistinguishable.

"Shift" was a plant word outside the plant world (the demo's guard); the
examples say "Hour".

For the owner's judgement of the ink fill - the row of fields, light and
dark: `example-sizes--a-row-of-fields-ui-{light,dark}-…-darwin.png` under
`packages/core/tests-visual/screenshots.spec.ts-snapshots/`.
