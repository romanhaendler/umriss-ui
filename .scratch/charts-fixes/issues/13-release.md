# 13 - Release

Status: done
Type: task
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, and `.scratch/charts-demo-examples/` complete

Spec: `.scratch/charts-fixes/spec.md` (Q26)

## Scope

- Minor release of `@umriss-ui/charts` (breaking: `Span` removed); `@umriss-ui/schedule` patch if 09 changed its imports. Mechanics per `docs/releasing.md`.
- CHANGELOG lists the removal, every fix, and the new demo examples.

## Acceptance

- Published; demo deployed; `.scratch/charts-fixes/spec.md` and `.scratch/charts-demo-examples/spec.md` set to `done` with a delivery report.

## Comments

### Status corrected (2026-09-24)

Delivered: `13c6fdf` released core 0.4.0 and charts 0.4.0; the changelog lists the removal of `Span` and the fixes. The Status line had not been moved when the work landed.
