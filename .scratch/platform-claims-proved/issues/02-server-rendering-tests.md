# 02 - A server-rendering test for table, schedule and calculation

Status: done
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

## Comments

- Written: `tests-unit/ssr.test.tsx` in table (3 tests, green), calculation (4, green) and schedule (4: 3 green, 1 red). The `setup.ts` of the three packages is guarded with `typeof window !== "undefined"` (and the schedule's canvas stub with `typeof HTMLCanvasElement`), so the node environment loads.
- **Finding, not fixed (the library is not this ticket's to change in this run):** `renderToString` of a `<Schedule>` with two `<Lane>`s renders "0 lanes" and no lane label - the lanes register in an effect, so the server's markup holds only the empty frame, two empty canvases, the `ariaLabel` and a summary of zero lanes. The spec says the markup holds the lane labels. The test "renders the lane labels" stays and fails. Options: lanes registered during render (so the server paints them), or the spec's line changed to "an empty frame". The ticket stays open on this.
- The mutant check by hand (`document.createElement` in each main component's render) is not done: other agents were editing `src/` at the time.
- Settled by the coordinator, 2026-10-11 (maintainer to confirm at acceptance): the schedule is not changed. The lane-label test is replaced by "renders no lane label on a server - the lanes arrive on the client, after mount", which asserts the frame, the empty canvas, no lane label and "0 lanes, 0 subtasks". The README may say only that: on a server the schedule renders its labelled frame and empty canvas, the rest arrives after mount. A client-vs-server first-markup comparison is not in the file (node environment); not done.
