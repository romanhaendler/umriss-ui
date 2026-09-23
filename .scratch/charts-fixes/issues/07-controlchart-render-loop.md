# 07 - The ControlChart render loop

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 9)

## Scope

- `onViolations` is called only when the violations actually change (compared by content), not per render.
- Inline `accessor` and `origin` must not recompute limits on every render - compare them the way series accessors are compared (`fnEqual`) and `origin` by value.

## Acceptance

- jsdom test first: a caller that keeps the violations in `useState` settles after one update; `capabilities.md` moves `onViolations` from Manual to Unit.
