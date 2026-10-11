# 02 - A server-rendering test for table, schedule and calculation

Status: ready-for-agent
Type: task
Size: S

Blocked by: none
Spec: `.scratch/platform-claims-proved/spec.md` - P4 and "What the server tests assert"

## What to build

One file per package, `tests-unit/ssr.test.tsx` in `packages/table`,
`packages/schedule` and `packages/calculation`, in the manner of
`packages/charts/tests-unit/ssr.test.tsx` and `packages/core/tests-unit/fieldWidth.test.tsx`
("rendered on a server"): `renderToString`, no testing-library, and
`// @vitest-environment node` on the first line so that `window` and `document`
do not exist. If a package's `tests-unit/setup.ts` touches `window`, guard it with
`typeof window !== "undefined"`.

What each asserts is in the spec: the table's grid, headers, first row and
aggregate, and a second render with a selection and `loading`; the schedule's lanes
and label with an empty canvas, once with `now` a number and once with `now`
true; the calculation's list, labels and amounts with the folded rows `hidden`.
Each renders its markup twice and expects the same string.

If a component throws on the server, that is the finding: the fix is to move the
access into an effect (the rule `Chart.tsx` states), not to guard the test.

## Acceptance

- [ ] Three files, each green under Node 22 and under React 18 (once 01 is in).
- [ ] No `window` or `document` in the assertions; the node environment is set.
- [ ] A mutant check by hand: a `document.createElement` placed in the render of
      each package's main component makes its test fail.
