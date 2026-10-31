# 37: Core - RangeSlider and TimeInput

Status:     done
Blocked by: 01, 11

Spec: `../spec.md`, decision 8. Source: P9 wish (Mantine RangeSlider, TimeInput).

- [x] `RangeSlider`: two thumbs on one track, `value`/`defaultValue` `[from, to]` and `onValueChange`, the thumbs never cross, step grid as Slider (ticket 11), each thumb a `slider` with its own name; posts `<name>Start`/`<name>End` like the range pickers.
- [x] `TimeInput`: hour and minute (seconds optional) as the DateTimePicker's time fields, `value` as `{ hours, minutes }` or a string decided in the ticket and written in the ADR of 01; posts `HH:mm`.
- [x] Both follow the field contract of 01, 04 and 05; demo pages pass the shell page rules; `pnpm check core`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** RangeSlider: two native ranges over one groove, value
`[from, to]` on the grid from `min`/`step`, thumbs never cross, each a named slider, posts
`<name>Start`/`<name>End`, resets, blurs only when focus leaves both. TimeInput: the date-time picker's
spinbutton fields standing alone, value `"HH:mm"`/`"HH:mm:ss"` or `null`, posts, resets, `size`,
`invalid`, `disabled`. Demo pages, configurators, README rows; looked at in light and dark. ADR-0081's
table lists both (coordinator). Left: no marks on RangeSlider (known limit); TimeInput's per-field
handlers from `rest` are overridden - only the group's `onBlur` is honoured.
