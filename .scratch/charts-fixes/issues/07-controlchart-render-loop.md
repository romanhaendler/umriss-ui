# 07 - The ControlChart render loop

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 9)

## Scope

- `onViolations` is called only when the violations actually change (compared by content), not per render.
- Inline `accessor` and `origin` must not recompute limits on every render - compare them the way series accessors are compared (`fnEqual`) and `origin` by value.

## Acceptance

- jsdom test first: a caller that keeps the violations in `useState` settles after one update; `capabilities.md` moves `onViolations` from Manual to Unit.

## Delivery

Finding confirmed: `tests-unit/controlChartViolations.jsdom.test.tsx` - a
caller that keeps the violations in `useState` was reported to ten times (the
test's own bound) instead of once, and three renders with an inline accessor
called it 63 times instead of 21. Both failed first.

`ControlChart.tsx`: accessor and origin are kept across renders while they
are equal - the accessor by `fnEqual` (now exported from `scene.ts`), the
origin by its values; the violations likewise by content. `onViolations` is
read through a ref, so an inline callback does not re-trigger the report.
`capabilities.md`: `onViolations` from Manual to Unit. No picture affected.
