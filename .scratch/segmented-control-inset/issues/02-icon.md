# 02 — An icon before a possibility's word

Status: done

Blocked by: None (can start immediately)

Spec: `.scratch/segmented-control-inset/spec.md`

## What to build

A possibility takes `icon`, and the segmented control draws it before the word
as a button draws an icon among its children: the control decides its size
(CONTEXT: **Icon**), the gap is the button's, and it is centred on the word's
line. A screen reader hears the word only. A long word ends in an ellipsis
while the icon stays whole. Callers no longer assemble icon and word in
`label` and space them with a space character.

## Acceptance criteria

- [x] `icon?: ReactNode` on `SegmentedOption`, documented in the props; `label` stays required.
- [x] The icon is `--u-icon-size` at `md` and `--u-icon-size-sm` at `sm`, does not shrink, and stands before the word with the button's gap.
- [x] The icon is hidden from assistive technology: a unit test shows the radio named by its word alone.
- [x] The icon's vertical centre lies within a pixel of the word's; in a place too narrow, the word ends in an ellipsis and the icon keeps its size (layout test).
- [x] Possibilities without an icon render exactly as before: the existing tests and baselines stay green.
- [x] An existing example on the segmented control's page, or a new one, shows icons.
- [x] Core's changelog has a feature entry.

## Comments

Delivered. The icon is a span before the word, `aria-hidden`, sized by a
module-private `--_icon` (the icon size, the small one at `sm`), with the
button's gap on the segment - the input lies outside the flow, so a segment
without an icon is unchanged and every existing baseline held. The theme
switch example from 01 now carries three inline SVGs (the set has no sun or
moon). Tests: a unit test that the radio is named by its word alone and the
icon is hidden; a layout test that the icon stands on its word's line at the
icon size and keeps it when the word is squeezed to an ellipsis; the 01 test
now centres icon and word together.
