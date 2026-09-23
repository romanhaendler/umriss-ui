# 05 - Infinity is a gap

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 7)

## Scope

- ±Infinity in any channel is treated like `null`/`NaN`: a gap (R-2.5), outside the extent.
- `capabilities.md`, R-2.5 row: "`null`/`undefined`/`NaN`/±Infinity".

## Acceptance

- Unit test (materialisation) first: one `Infinity` among finite values leaves the extent finite and the others drawn.

## Delivery

Finding confirmed: `materialize.test.ts`, "treats ±Infinity in any channel as a
gap outside the extent", failed first with `xMax: Infinity`. `materializeSeries`
now reads every value channel (y, baseline, matrix value) through one
`valueOf()` that turns null/undefined/NaN/±Infinity into NaN; an x that is not
finite is handled like a point in removed time - its position stays, so the
channel stays ascending, and it is neither in the extent nor drawn. The props'
JSDoc and the R-2.5 row in `capabilities.md` name ±Infinity. No picture changes.
