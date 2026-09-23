# 02 - The sortedness check

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 2)

## Scope

- The DEV check runs once per data change for **every** series whose hit test is a binary search (Line, Area, Bar, Scatter, StateBand), and never for Matrix (row-major, linear hit).
- The warning names the series.

## Acceptance

- Unit test first: two series, the second unsorted → one warning naming it; a row-major matrix → none.

## Delivery

Finding confirmed: `tests-unit/scene.test.ts`, "The sortedness check (R-2.6)",
failed on both cases before the fix - no warning for an unsorted second series,
a false one for a row-major matrix. The scene-wide `sortednessChecked` flag is
gone: the check runs in `materialize()` for every series but the matrix, which
is once per change of that series' data (series-own data included, which the
flag never reset for). `warnOnce` is keyed per series name, and the message
names it. No picture changes.
