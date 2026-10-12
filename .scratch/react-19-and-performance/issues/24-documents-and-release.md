# 24 - Documents and release

Status: ready-for-human
Type: task
Size: S

Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
Spec: `.scratch/react-19-and-performance/spec.md`; user stories 2, 8, 16, 42

## What to build

The work reaches the people who use it. A release of all five packages whose
changelogs say, for a caller:

- **Changed, breaking:** React 19 is required; the version before is the last
  that serves React 18. `ref` is a prop of every component that took one.
- **Changed:** the packages ship ES2022.
- **Fixed:** a table with an aggregate no longer throws above roughly 125 000
  rows; and whatever ticket 22 found about a scrolled virtual tree.
- **Faster, with the figure where there is one:** an import of one component
  from core; scrolling, grouping and re-rendering a large table; a pointer
  moving over a large schedule; walking a large tree - and each candidate the
  benchmark pages kept.

The figures in core's README are taken once more on the release build. The
testing guide names the residue rule and the benchmark pages where their kind
stands. The generated documents are current. Release after the maintainer has
looked at it by hand.

## Acceptance

- [ ] A changelog entry in each of the five packages; the breaking change
      stands first.
- [ ] Core's README figures match a measurement of the release build.
- [ ] The testing guide names the residue rule and says the benchmark pages
      are opened by hand and assert nothing.
- [ ] The full check before a release: lint, types, unit, build, visual -
      parallel suites waited for, ports 4173-4177 free, the machine kept
      awake.
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments`; every ticket's status set to `done`.

## Comments

**Done here (2026-10-12):** the testing guide names the residue rule and the
benchmark pages; core's README figures were taken again on the final build
(an import that uses nothing 1.1 kB, `Button` 5.2 kB, `Select` 9.4 kB,
`DatePicker` 10.4 kB, everything 50.7 kB); the capability records of the
table, the schedule and the tree end with the figures as they stand.

**Left to the maintainer:** the release itself. A version is released by
raising it, and a push to `main` publishes it, so no manifest and no
`CHANGELOG.md` was touched. A draft of what the changelogs say, for a caller:

All five packages

- **Changed, breaking:** React 19 is required (`react` and `react-dom`
  `>=19`); the version before is the last that serves React 18.
- **Changed:** the packages ship ES2022 syntax; an application that serves
  older browsers transpiles them itself.

`@umriss-ui/core`

- **Changed:** `ref` is a prop of every component that took one, declared in
  its props type (`RefProp<Element>`, exported). No component is a
  `forwardRef` object any more - code that looked at `$$typeof` no longer
  finds one.
- **Smaller:** an import pays for what it uses. `Button` alone is 5.2 kB
  minified and gzipped where the whole package came with it (43.5 kB); an
  import that uses nothing leaves 1.1 kB.
- **Fixed:** a virtualised tree that was scrolled jumped back to its active
  node on the next render; and its scroll area was only as high as its window
  inside a container of fixed height, because the filler rows were squeezed.
- **Faster:** a key in a tree of 100 000 nodes costs 0.3 ms (14 ms before); a
  scroll inside the window of `useVirtual` renders nothing.

`@umriss-ui/table`

- **Fixed:** a table with an aggregate threw a `RangeError` above roughly
  125 000 rows.
- **Changed:** a column's `value`, `sortValue` and `groupValue` and the
  `rowKey` are compared by their source text when they are new functions. A
  function that reads an outer variable which has changed counts as
  unchanged: give it a new text, or carry the variable in the row data. The
  `preFilter` is not affected.
- **Faster, at 200 000 rows:** a scroll step 3.7 ms (135 ms before), a
  re-render of the caller with nothing changed 1.5 ms (308), a page 6.2 ms
  (312), a group folded 2.4 ms (902), a column hidden 2.8 ms (486), a sort
  151 ms (488).

`@umriss-ui/schedule`

- **Changed:** `ref` is a prop of the schedule (`Ref<ScheduleHandle>`).
- **Faster:** a hover redraws the overlay alone - at 5 000 subtasks its frame
  ends after 17 ms (24 before); a pan or zoom lays the plan out once per
  frame.

`@umriss-ui/charts`

- **Faster:** bars, the state band and the matrix draw what the view shows -
  zoomed into a million points a draw costs 0.1 ms for bars (47 before).

`@umriss-ui/calculation`

- No change of its own beyond the two at the top.
