# 01 - The test of a table under changing rows, and what holds

Status: ready-for-agent
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
