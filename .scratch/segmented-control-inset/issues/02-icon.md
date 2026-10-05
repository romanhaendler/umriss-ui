# 02 — An icon before a possibility's word

Status: ready-for-agent

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

- [ ] `icon?: ReactNode` on `SegmentedOption`, documented in the props; `label` stays required.
- [ ] The icon is `--u-icon-size` at `md` and `--u-icon-size-sm` at `sm`, does not shrink, and stands before the word with the button's gap.
- [ ] The icon is hidden from assistive technology: a unit test shows the radio named by its word alone.
- [ ] The icon's vertical centre lies within a pixel of the word's; in a place too narrow, the word ends in an ellipsis and the icon keeps its size (layout test).
- [ ] Possibilities without an icon render exactly as before: the existing tests and baselines stay green.
- [ ] An existing example on the segmented control's page, or a new one, shows icons.
- [ ] Core's changelog has a feature entry.
