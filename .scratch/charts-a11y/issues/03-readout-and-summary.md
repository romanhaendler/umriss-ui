# 03 - The readout and the summary

Status: ready-for-agent
Type: task
Blocked by: 01, 02

Spec: `.scratch/charts-a11y/spec.md` - Q4, R10, R11.

## Scope

- A polite live region inside the chart, written 150 ms after the last
  keystroke with the tooltip's content (x, then series, emphasised first),
  formatted through the series' `format` and the axis' `tickFormat`. Never
  written by the pointer.
- A visually hidden summary tied by `aria-describedby`: kind, series by name,
  visible x range, minimum and maximum per series there, key help; rebuilt on
  data, domain or visibility change; not live.

## Acceptance

- jsdom tests read the readout after keys and assert it stays empty after
  pointer moves; the summary follows a domain change.
- axe clean on every sample page, no new tolerated pair.
