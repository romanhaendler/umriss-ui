# 37: Core - RangeSlider and TimeInput

Status:     ready-for-agent
Blocked by: 01, 11

Spec: `../spec.md`, decision 8. Source: P9 wish (Mantine RangeSlider, TimeInput).

- [ ] `RangeSlider`: two thumbs on one track, `value`/`defaultValue` `[from, to]` and `onValueChange`, the thumbs never cross, step grid as Slider (ticket 11), each thumb a `slider` with its own name; posts `<name>Start`/`<name>End` like the range pickers.
- [ ] `TimeInput`: hour and minute (seconds optional) as the DateTimePicker's time fields, `value` as `{ hours, minutes }` or a string decided in the ticket and written in the ADR of 01; posts `HH:mm`.
- [ ] Both follow the field contract of 01, 04 and 05; demo pages pass the shell page rules; `pnpm check core`, `pnpm check:site`.

## Comments
