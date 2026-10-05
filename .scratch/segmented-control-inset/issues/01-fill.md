# 01 — A segmented control that fills its place

Status: done

Blocked by: None (can start immediately)

Spec: `.scratch/segmented-control-inset/spec.md`

## What to build

`<SegmentedControl fill … />` takes the whole width its place gives it, as a
field does in a block (ADR-0041), and its segments share that width equally,
their words centred. A word too long for its share ends in an ellipsis, and
the control never pushes its place wider. Without `fill`, nothing changes from
0.26. The configurator offers `fill` as a switch.

## Acceptance criteria

- [x] `fill?: boolean` on `SegmentedControl`, default `false`, documented in the props.
- [x] With `fill`, the control's width equals its place's, and its segments' widths agree within a pixel - whatever the words and whichever possibility is chosen.
- [x] Words are centred in their segments; a too-long word ends in an ellipsis; at 320 px the control stays inside its place.
- [x] `fill` works at `sm` and `md` and inside a `FormField`.
- [x] Without `fill`, no class is added and no existing rule changes: the existing segmented control layout tests and screenshot baselines stay untouched and green.
- [x] `fill` is named in the segmented control's configurator.
- [x] Core's changelog has a feature entry.
- [x] A layout test in the Sizes behaviour spec covers the width, equal segments and the 320 px case.

## Comments

Delivered. `fill` makes the control a block with segments of basis zero,
words centred. The new example "A theme switch" (a settings card, 320 px at
most) carries it; 02 and 03 grow the same example with icons and the inset
variant instead of adding two more. Layout tests at 1280 and 320 px: the
control's width equals its place's, the three segments agree within a pixel,
each word stands in its segment's middle, a choice moves nothing, the page
does not scroll sideways. The configurator's baseline changed by the new
`fill` switch; the example has baselines light and dark.
