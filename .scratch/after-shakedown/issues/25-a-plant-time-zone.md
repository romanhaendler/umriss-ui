# A plant time zone

Type:       grilling
Status:     open
Blocked by: 04

## Question

Does umriss show an instant in a time zone the application names (the plant's), beside the reader's own?

ADR-0060 says "not yet; umriss shows the reader's time". "What umriss promises a Server Component" took
server rendering off this question (on a server no instant is shown, ADR-0060 amended there), so only the
wishes remain: a fixed time zone for charts (`.scratch/shakedown/wishes.md` 3, charts) and a plant time zone
for operator screens (same file, operator screens; `operator-screens.md`).

- One option in core's formats that every package reads (charts' axes, the table's `Date` column, the
  schedule's ticks, freshness), or per component?
- What the axis does across a daylight-saving change in that zone, and what a reader sees who sits in
  another zone (a zone label?).
- Charts depend on nothing: how the option reaches them without core.
