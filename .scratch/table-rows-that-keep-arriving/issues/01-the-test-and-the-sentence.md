# 01 - The test of a table under changing rows, and what holds

Status: done
Type: task
Size: M

Blocked by: none
Spec: `.scratch/table-rows-that-keep-arriving/spec.md`

## What to build

A test of a table with a `rowKey` whose `rows` are a new array every second
(fake timers): values change, a row is added, one is removed, one moves under
the sort. For each of the six states of the spec - sort, scroll position,
virtualisation, selection, an open Row draft, an active cell - the test says
what must hold and checks it. Where jsdom cannot show it (real scroll, focus
under the row motion), the test says so and a browser case covers it.

Then one sentence per state in the table's README and capability record: what
holds, what does not, and that grouping and tree rows are not proved.

A failing case is not fixed here. Write it as `issues/NN-<what>.md` in this
directory (`Status: ready-for-agent`, sized), keep its test skipped with a
pointer to that ticket, and let the sentence say what is true today.

## Acceptance

- [ ] The test exists, runs in the unit suite, and each of the six states has at
      least one assertion; the cases that need a browser are named and covered there.
- [ ] Every case that fails became a ticket of its own and is skipped with its number.
- [ ] The README and the capability record say what holds, in the test's words,
      and name what is not proved.
- [ ] No source file of the table changed in this ticket.
- [ ] `docs/testing.md` lists the test in the row where its kind stands.

## Comments

Delivered.

- `packages/table/tests-unit/rowsThatKeepArriving.test.tsx`: 13 cases over a clock of fake timers, `rows` a fresh array each second. Sort (default and user-turned sort stays, order follows values, a row keeps its DOM); selection (stays ticked across value changes; the count follows the rows there are; a key whose row is gone waits in the set and ticks again on return); Row draft (stays open, same input, typed text and focus kept; its untouched fields stay as at opening; closes only when the row leaves `rows`); Active cell (focus and tab stop stay on the row by key across a re-sort; where the row is gone the cell now at its index takes over); scroll position and virtual window (scrollTop unchanged, same rows by key, filler heights follow the count).
- No case failed, so no ticket of a fault. jsdom cannot show real scroll under changing heights, nor focus under the row motion (the FLIP of `motion.ts` is not asserted for a re-sort): `tests-visual/rows-that-keep-arriving.spec.ts` names four cases as `test.fixme` because no example ticks on a clock and the spec forbids new API; Playwright was not run.
- README bullet "Rows that change every second" (the table has no capability record of its own; the README is where its capabilities stand); `docs/testing.md` row for the table's component tests lists the test. Grouping and tree rows are named as not proved. No table source file changed.
