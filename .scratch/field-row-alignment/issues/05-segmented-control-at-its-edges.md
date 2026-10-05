# 05 — The segmented control at its edges

Status: ready-for-agent

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

- [ ] `sm` takes the small control height, small radius and small type; a `ControlSizeProvider` sets it, an own `size` wins; the layout test measures the `sm` row on the field line
- [ ] Disabled as a whole and per possibility: visible, dimmed, not choosable, skipped by the arrow keys
- [ ] The forced-colours run covers the segmented control, with the chosen segment distinguishable
- [ ] At 320 px the segmented control stays inside its place and its labels end in an ellipsis (measured)
- [ ] The radio group's docs point to the segmented control for short possibilities without explanations, and back
- [ ] Screenshots of the row of fields, light and dark, are left for the owner to judge the chosen segment's look
- [ ] Lint, types, unit, build and visual pass
