# 06 - Isolated points

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 8, Q23)

## Scope

- A Line point with a gap (or the edge) on both sides always gets a marker, whatever the point count; only `markers="never"` suppresses it.
- An Area point with gaps on both sides is drawn as a vertical stroke from baseline to value.

## Acceptance

- Unit test (draw, against a recording context) first: a lone point in 1,000 produces a marker; with `never` none.
- A screenshot shows it (the gap example of `Line/02-multi-series`, or a new point in `Area/02-corridor`).
