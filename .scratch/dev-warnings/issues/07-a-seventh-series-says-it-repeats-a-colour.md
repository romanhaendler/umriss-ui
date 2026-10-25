# 07 - A seventh series says it repeats a colour

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

A chart author adds a seventh line without a `color`. It takes the first line's colour, as it does today,
and with `encoding="marks"` the first line's dash and marker too. In development the chart now logs once
that the seventh series repeats the first one's colour, and says to give it a `color` or to split the chart.

- **The check** sits where a series gets its palette place. It warns once per series when the place is the
  seventh or later, and the series has neither `color` nor `tone`. The warning names both series.
- State bands and matrices take no palette place and are not counted.

## Acceptance criteria

- [ ] Seven lines without `color` warn once, naming the seventh and the first.
- [ ] Seven lines where the seventh has a `color` or a `tone` stay silent.
- [ ] Six lines and a state band stay silent.
- [ ] `pnpm check charts` passes.
- [ ] The changelog notes the warning under "Added".
