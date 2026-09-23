# 05 - Infinity is a gap

Status: ready-for-agent
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 7)

## Scope

- ±Infinity in any channel is treated like `null`/`NaN`: a gap (R-2.5), outside the extent.
- `capabilities.md`, R-2.5 row: "`null`/`undefined`/`NaN`/±Infinity".

## Acceptance

- Unit test (materialisation) first: one `Infinity` among finite values leaves the extent finite and the others drawn.
