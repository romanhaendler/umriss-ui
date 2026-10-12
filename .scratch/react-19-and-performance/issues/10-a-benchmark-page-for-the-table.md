# 10 - A benchmark page for the table

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/react-19-and-performance/spec.md`, "Measuring"; user stories 40, 42, 43

## What to build

A page in the table's demo on which what the table costs can be read, built
as the charts' benchmark page is: a row count that can be set (up to 200 000),
the figures shown on the page, left out of the screenshot comparison the way
the charts' page is.

It measures from outside - React's profiler and the clock - and adds no prop
to the table. What it shows, for a virtualised table with a footer aggregate,
and switchable to a grouped one with share bars:

- the first render;
- one scroll step, as the render time per scroll event over a scripted scroll;
- a sort, a search keystroke, a page turned, a group folded, a column hidden;
- a re-render of the caller with nothing changed, with the accessors written
  inline as the examples write them.

The table gets a capability record (it has none), and the map of documents
points at it. Its first section holds the reference figures of this page at
10 000, 50 000 and 200 000 rows, with machine, browser and method - the
"before" every later ticket compares with. Where 200 000 rows cannot be
measured before ticket 01 has landed, the record says so and the row is filled
in by ticket 13.

## Acceptance

- [ ] The page is reachable in the table's demo, has its place in the outline
      and is excluded from the screenshot comparison.
- [ ] The table's `API.md` is unchanged: no new export, no new prop.
- [ ] The capability record exists with the reference figures and how they
      were taken, and the map of documents names it.
- [ ] `pnpm check table`, `pnpm check:site` and `pnpm test:visual:quick table`
      pass.
