# React 19 is the floor, and what it buys: bundles that shake, a table that holds at size

Status: done
Date:   2026-10-12
Origin: a measurement of the five built packages and a reading of their hot
paths on 2026-10-12, at the commit of the 0.34.0 release. The figures stand
under "Further Notes"; how each was taken stands beside it, so that it can be
taken again.

## Problem Statement

An application that imports one `Button` from `@umriss-ui/core` ships 43.5 KB
of gzipped JavaScript - of the 51.5 KB the whole package weighs. The same holds
for a pure function: `age` alone costs 43.5 KB. Nothing a caller's bundler does
helps, because every component of core is a `forwardRef(...)` call at the top of
the module, and a bundler has to take a call it does not know for a side effect
and keep it, with everything it reaches. The charts, the calculation and the
pure helpers of every package shake as they should; core, the package every
other one stands on, does not.

`forwardRef` is there for one reason: the peer range begins at React 18, where
a function component is not handed its `ref`. React 19 hands it as a prop. The
workspace is developed on 19, carries two switches on the React major to behave
the same on both, and runs its unit tests a second time on 18.3.1 to prove it.

Beside that, the table does not hold at the sizes it is built for:

- Above roughly 125 000 rows it throws a `RangeError` as soon as a column has a
  sum, an average, a minimum, a maximum or a range as its **Aggregate** - the
  rows are spread into the arguments of one call.
- The footer computes every aggregate over the whole **Filtered set** on every
  render, and a virtualised table renders on every scroll event.
- A caller who writes `rowKey` or a column's `value` inline - which is how
  every example writes them - defeats the memoisation, and filtering and
  sorting run on every render.

The schedule rebuilds everything it publishes while the pointer moves along one
bar. And outside the charts there is no page on which any of this can be
measured, so no change to it can be shown to have helped.

## Solution

**React 19 becomes the floor of all five packages.** A component is a plain
function that takes `ref` among its props. The two version switches go, the
second CI run goes, and the claim "React 18 or 19" becomes "React 19" wherever
it stands.

**A caller pays for what they import.** With the wrappers gone and the few
calls that remain at the top of a module marked pure, importing one component
brings that component and what it needs. A check on the built package holds
that state: it bundles an import of the package that uses nothing and fails
when more than a small residue is left.

**The packages ship the syntax they are written in.** The library builds
target ES2022, which the TypeScript configuration has named all along; the
helpers for class fields go, and each bundle is two to three per cent smaller.

**The table holds at size.** No aggregate spreads rows into a call. An
aggregate is computed once for a set of rows and read in every render after.
Scrolling inside the window of a virtualised table renders nothing. An inline
`rowKey`, `value`, `sortValue`, `groupValue` or `preFilter` costs what a stable
one costs.

**The schedule does on a pointer move only what the move changed.**

**There is a page to measure on.** The table, the schedule and core's tree get
a benchmark page of the kind the charts have, and the changes whose worth is
not known without one are decided on it.

## User Stories

### The floor

1. As an application developer, I want the packages to declare React 19 as
   their peer, so that my package manager tells me at install time, not at run
   time, that React 18 is not served.
2. As an application developer on React 18, I want the changelog of every
   package to say that 19 is now required and that the last version serving 18
   is the one before, so that I know which version to stay on.
3. As an application developer, I want to pass `ref` to every component that
   took one before and receive the same element, so that the change of floor
   changes nothing in my code.
4. As an application developer, I want `ref` to appear in a component's props
   table with the element it points at, so that I do not have to try it to find
   out what I get.
5. As an application developer, I want a component's handle - where a component
   hands out methods rather than an element - to arrive through `ref` as it
   did, so that imperative calls keep working.
6. As an application developer, I want a `Tooltip` or a `Menu` around my own
   trigger to keep my trigger's `ref` working, so that wrapping an element
   costs me nothing.
7. As an application developer, I want a closed overlay's surroundings to be
   inert and an open one's to be reachable, exactly as before, so that focus
   and screen readers behave as they did.
8. As a coding agent reading `API.md` or `llms-full.md`, I want the React floor
   and each component's `ref` stated there, so that I generate code that
   compiles.
9. As a maintainer, I want one decision record saying that React 19 is the
   floor and why no component is wrapped, so that the next person does not put
   `forwardRef` back out of habit.
10. As a maintainer, I want the pass-through guard to fail on a component that
    is wrapped in `forwardRef`, where today it fails on one that is not, so
    that the rule is held by the test that held its opposite.
11. As a maintainer, I want CI to run the unit tests once, on the React the
    packages claim, so that a green run means what it says.

### Paying for what is imported

12. As an application developer, I want an import of `Button` alone to bring a
    few kilobytes, not the package, so that umriss is a reasonable choice for
    an application that needs three components.
13. As an application developer, I want a pure helper - `age`, `assess`,
    `treeModel`, `column`, `controlLimits` - to cost its own size, so that I
    can use the arithmetic without the components.
14. As an application developer, I want this to hold with the bundler I have -
    Vite, Rollup, esbuild, webpack - so that I need no plugin and no deep
    import path.
15. As an application developer, I want the one import line to stay the whole
    setup, stylesheet included, so that smaller bundles do not bring back a
    second line to forget (ADR-0021).
16. As an application developer, I want the README to state what one component
    and what the whole package costs, measured, so that I can decide before I
    install.
17. As a maintainer, I want the release to fail when a package's unused import
    leaves more than its budget behind, so that one unmarked call at the top of
    a module cannot undo this unnoticed.
18. As a maintainer, I want that failure to name the statements that were kept,
    so that I can find the call without bisecting.
19. As a maintainer, I want the budget to be one number in one place, so that
    raising it is a visible decision.

### The syntax that ships

20. As an application developer, I want the packages to ship ES2022, so that my
    bundle does not carry helpers for syntax every browser I serve has.
21. As an application developer serving older browsers, I want the README to
    say which syntax ships, so that I know to transpile the packages myself.

### The table at size

22. As an operator, I want a table of 200 000 rows with a sum in its footer to
    open, so that the size virtualisation is offered for does not crash it.
23. As an operator, I want a minimum, a maximum and a range over that many rows
    to be right, so that the fix is not a wrong number.
24. As an operator, I want to scroll a virtualised table without the frame rate
    dropping as the row count grows, so that a long list reads like a short
    one.
25. As an operator, I want group headers with their share bars to cost the same
    whether the table has a thousand rows or a hundred thousand, so that
    grouping stays usable at size.
26. As an application developer, I want to write `rowKey: (row) => row.id`
    inline without the table recomputing its keys on every render, so that the
    way every example is written is also the fast way.
27. As an application developer, I want to write a column's `value`,
    `sortValue` and `groupValue` inline without filtering and sorting running
    again on every render, so that I do not have to wrap each one in
    `useCallback`.
28. As an application developer, I want an inline `preFilter` to be applied
    once per change of its rows, so that it does not cost a pass per render.
29. As an application developer, I want a changed accessor that really reads
    differently to be noticed, so that the comparison never shows me stale
    values.
30. As an operator, I want turning a page, folding a group, hiding a column or
    moving one not to sort the table again, so that these stay instant on a
    large table.
31. As an operator, I want typing into the search of a large table to stay
    responsive, so that the field does not lag behind my keys.
32. As an operator with a screen reader, I want a row's position in its group
    announced as before, so that a cheaper way of computing it changes nothing
    I hear.

### The schedule at size

33. As a planner, I want the tooltip to follow my pointer along a bar without
    the schedule stuttering, so that reading a long subtask is smooth on a plan
    of several thousand subtasks.
34. As a planner, I want panning and zooming with the wheel to stay smooth on
    such a plan, so that I can move through it.
35. As a planner, I want hovering to leave the drawn plan alone and change only
    what the hover shows, so that a large plan does not flicker or lag under
    the pointer.
36. As a planner, I want dependencies outside the view not to cost anything, so
    that a plan with many of them draws as fast as the part I look at.

### The tree and the charts

37. As an operator, I want to walk a tree of a hundred thousand nodes with the
    arrow keys without a pause on each key, so that the **Active node** moves
    as fast as I press.
38. As an operator, I want a virtualised tree I have scrolled to stay where I
    scrolled it, so that it does not jump back to its active node.
39. As an operator, I want to pan and zoom a chart of bars, points, a state
    series or a matrix over many values as smoothly as a line, so that the
    series kind does not decide whether the chart is usable.

### Measuring

40. As a maintainer, I want a benchmark page for the table with a row count I
    can set, so that I can see what scrolling, sorting and grouping cost before
    and after a change.
41. As a maintainer, I want the same for the schedule and for core's tree, so
    that every claim about speed in this workspace has a page behind it.
42. As a maintainer, I want the reference figures written down beside what was
    measured and on what, as the charts' are, so that a later figure can be
    compared.
43. As a maintainer, I want the benchmark pages left out of the screenshot
    comparison, so that a page built to be slow does not slow the suite.

## Implementation Decisions

### The floor

- **Peers.** `react` and `react-dom` become `>=19` in core, charts, table,
  schedule and calculation. This is a breaking change in each changelog.
- **One ADR, "React 19 is the floor"** (the next free number at the time). It
  records: the floor; that a component takes `ref` as a prop and is never
  wrapped; that the version switches are gone and not to be restored; and what
  it costs - applications on 18 stay on the last version before. It names the
  reason this was worth it: the wrapper is what kept core from shaking.
- **`forwardRef` goes, everywhere** - in core and in the schedule; the other
  three packages have none. A component is a named function that takes `ref`
  with its props.
- **`ref` stands in the component's exported props type**, typed with the
  element (or handle) it points at - the one the pass-through guard names as
  the component's root. It is therefore in the props table and in `API.md`,
  which are generated and written again. One fact, one place: no prose beside
  it repeats the element.
- **Handles stay.** `useImperativeHandle` keeps its place and reads the `ref`
  from the props.
- **The element-ref helper** reads the ref where React 19 keeps it and nowhere
  else; the choice by version goes. **The inert helper** goes: `inert` is a
  boolean attribute and is written as one.
- **A context is rendered as its own provider** (`<Context value>`), not
  through `.Provider`, in every package.
- **No sweep beyond that.** Ref callbacks, effects and hooks are not rewritten
  to newer idioms because the floor allows it.
- **What says "18" is corrected where it stands:** each package's README, the
  installation text of each demo, `docs/testing.md`, the CI workflow (the job
  that resolves React 18.3.1 afresh is removed), and the fixtures of the demo
  shell's tests that carry a peer range.

### Paying for what is imported

- **Every call that remains at the top of a module and whose result is only
  held is marked pure in the source** - the `createContext` calls of all
  packages, and the table's two built-in filter registrations (or these are
  written so that no call is needed). The mark is written at the call; no build
  plugin adds it. A plugin was weighed and dropped: the marks are few once the
  wrappers are gone, and a mark in the source is read by whoever reads the
  line.
- **The residue check.** The check on the built package (the one that already
  holds ADR-0021 before publishing) gains one rule: an entry that imports the
  package's built entry for its side effects only is bundled with Rollup -
  stylesheets resolved to nothing, the peers external - and what remains,
  minified and gzipped, is the residue. It must not exceed **1.5 KB** for any
  package. On failure the check prints the kept top-level statements, largest
  first. Rollup is already in the workspace through Vite; nothing is installed.
- **The budget is one constant in that check.** It is deliberately above what
  was measured (core 1.2 KB with the marks, charts 0.2 KB, calculation and
  schedule under 0.1 KB) and below the table's 2.0 KB of today, so the table's
  filter registrations have to be dealt with.
- **No per-export budgets.** The residue is the one guard; a table of what
  single exports cost is measured once for the README and not held by a test.
- **The single file per package stays**, and so does the single stylesheet it
  imports. `sideEffects` in the manifests is unchanged.

### The syntax that ships

- **`build.target` is `es2022` in the five library builds.** The demo builds
  are not touched. Each README's installation passage says so in one sentence.

### The table

Fixes that are done as written:

- **No row-sized array is spread into a call** - not in the aggregate model
  (minimum, maximum, range), not where the decimals of a sum or an average are
  found. A loop takes its place.
- **An aggregate is computed once for a set of rows.** The footer's value and
  its decimals belong to the projection and are computed when the rows it
  covers change, not in render. A **Group header** reads the aggregates its
  group already holds; the whole-table sum its share bar divides by is computed
  once per projection, not once per header.
- **The virtual window is the state.** `useVirtual` holds the window it derives
  and renders its caller only when the window, the measured row height or the
  viewport changes. A scroll event that leaves the window where it is sets no
  state. What it returns keeps its shape.
- **An accessor is compared the way the charts compare theirs** - by identity
  first, by its source text otherwise, never for a native or bound function.
  This goes for a column's `value`, `sortValue` and `groupValue`, for `rowKey`
  and for `preFilter`. The rule and its one known limit - a closure that reads
  a changed outer variable reads as unchanged - are the charts' already; the
  table states the limit where the charts state it, and the escape is the same
  (a new function text, or the row data carrying the variable).
- **The pipeline is staged.** Filtering and sorting depend on rows, columns'
  values, search, filters and sort; grouping on that result and the grouping;
  paging and the order and visibility of columns on that. Turning a page,
  folding a group, hiding or moving a column runs only its own stage.

Changes that are decided on the benchmark page, each kept only if the page
shows it:

- memoised rows and cells (which first needs the snapshot the hook deposits to
  keep its identity across renders that change nothing in it);
- sort keys computed once per sort instead of per comparison;
- a deferred value for the search;
- a row's position in its group and a group checkbox's state without a scan of
  the group per rendered row;
- the tree's and the grid's per-render maps built once per projection;
- the frame's layout effects reading rows' boxes only when rows can have moved.

### The schedule

Done as written:

- **A pointer move along one hit publishes the tooltip's place and nothing
  else.** The headers, the bars and the summary are rebuilt when the data, the
  view or the selection changes.
- **The two canvases are drawn for their own reasons.** The data layer is
  redrawn when data, view, colours or selection change; hover and the ghost
  redraw the overlay alone.
- **Dependencies are culled to the view** before they are stroked, as subtasks
  already are.
- **Pan and wheel are coalesced per frame** in the layout as they already are
  in the draw.

Decided on the benchmark page: a hit test that does not scan every box (the
lane is already found by bisection); windowing the **Lane headers**; the
overlap depth of a lane without comparing every pair.

### The tree

- A change of the **Active node** does not compute the **Flattening** again.
- The virtual rows a tree hands on keep their identity while nothing in them
  changed, so that a scroll runs no search over the flattening.
- **To verify first, in a browser:** whether a scrolled virtual tree is pulled
  back to its active node when that node is outside the window. If it is, that
  is a defect and is fixed here; if it is not, this line is struck with what
  was observed.

### The charts

Decided on the charts' existing benchmark page: windowing bars, scatter, the
state series and the matrix to the visible range as lines and areas already
are, and a matrix hit test that does not walk every cell.

### Measuring

- **A benchmark page each for the table, the schedule and core's tree**, in
  that package's demo, built as the charts' is: a data volume that can be set,
  figures shown on the page, excluded from the screenshot comparison the way
  the charts' page is.
- **No new public API for it.** The pages measure from outside - React's
  profiler and the clock - where the charts needed instrumentation of their own
  for the canvas. A package gains an instrumentation prop only if the page
  cannot be built without one, and then it gets a place on the site like every
  export (ADR-0044).
- **Reference figures are written into the package's capability record** (a new
  one where a package has none), with machine, browser and method, as the
  charts' are. They are a record, not a gate: no test asserts a duration.

### Order

The benchmark pages come before any change that is "decided on the benchmark
page" and before the reference figures of the fixes, so that every fix has a
"before". The floor comes before the marks and the residue check. The
`RangeError` waits for nothing.

## Testing Decisions

A good test here states what a caller or a user can observe - an element
arrives at a ref, a value is right, a function the caller handed in is not
called again, a built file leaves nothing behind - and survives a rewrite of
the inside. No test names an internal function, counts renders of an internal
component or asserts a duration.

**Four seams, all of them existing:**

1. **The built package, through the dist check.** The residue rule lives there
   and is exercised by `check:dist` in every package before publishing. Prior
   art: the rules of ADR-0021 held by the same script, and the unit tests that
   run those rules against small stylesheets - the residue rule gets the same
   kind of unit test against two small fixture entries, one that shakes and one
   with an unmarked call.
2. **The pass-through guard of core.** It already renders every exported
   component with a ref, a class, a style and a data attribute and asks that
   all four arrive at the root. Its fifth demand turns round: no export is a
   `forwardRef` object. Its comment is written anew for the floor. The
   schedule's ref is held by the schedule's own unit tests, which already
   render it with one.
3. **The public hooks and components, rendered in the unit tests** (jsdom,
   Testing Library - the tests each package has):
   - the table through `useTable`, virtualised, with 200 000 rows, a footer
     with sum and average and a column with a range: it renders, and the
     values are right. The aggregate itself is pure and also gets its direct
     case table in the model's tests, where its neighbours are.
   - an accessor counted from outside: a `value` and a `rowKey` that count
     their calls, a re-render with nothing changed and one with a new function
     of the same text - the count does not grow; with a function of another
     text it does, and the cells show the new values.
   - a page turned, a group folded, a column hidden: a counting `sortValue` is
     not called again.
   - `useVirtual` through `renderHook`: scroll events inside one window do not
     render; one that crosses it does, and the window is right.
   - the tree: a counting reader is not called again when the active node
     moves.
   - `Tooltip` and `Menu` around a trigger with a ref of the caller's: both
     refs hold the element. The inert attribute: present when it should be and
     absent otherwise. The tooltip's ref and the inert attribute are held by
     behaviour tests today, which must pass unchanged with the switches gone;
     the menu's trigger gets the tooltip's test if it has none.
4. **The browser suite**, for what jsdom cannot see: the schedule's canvases
   (an interaction test that the data canvas's pixels are untouched and the
   overlay's change under a hover; prior art: the canvas pixel tests of the
   charts and the schedule), and the check of the scrolled virtual tree. The
   screenshots must not move: this spec changes no picture, and a changed
   baseline is a defect, not an update.

The benchmark pages are not tests. They are opened by hand, their figures
written down.

The type tests keep proving what must compile: a `ref` of the wrong element
type on a component is a `@ts-expect-error` case, one per kind of root
(element, dialog, handle).

## Out of Scope

Each of these was weighed in the same analysis and is recorded here so that it
is not found again as if it were new.

- **Splitting the three large hooks.** `useChart` (40 KB gzipped), `useTable`
  (38 KB) and `useSchedule` (23 KB) each come whole: one line chart brings the
  box plot's drawing with it. That follows from the hook handing out its parts
  bound to the rows (ADR-0048), and changing it is a change of the public API
  with no caller yet asking for it.
- **A stylesheet per component.** `core.css` is 22 KB gzipped and arrives whole
  with any import. Splitting it needs one output file per module and reopens
  ADR-0021 and every rule the dist check holds.
- **`"use client"` only where it is needed.** With one file per package the
  directive covers the pure helpers too, so a Server Component cannot call
  `column`, `controlLimits` or `treeModel`. It is the same change as the
  stylesheet per component and waits for it.
- **Splitting the wording.** Any component that reads the **Wording** brings
  the whole English wording (about 3.5 KB gzipped). It is paid once per
  application, and a caller overrides it as one object.
- **Shorter generated class names.** They are 28 % of the stylesheet before
  compression and 9 % of core's JavaScript; after gzip the gain is unmeasured
  and small, and the fold of the own styles and the dist check read those
  names.
- **The React Compiler.** The floor makes it possible without a runtime
  package, and no component in the workspace is memoised by hand. It is not
  adopted here: the table writes to its registry during render, by design, and
  what the compiler does with that has to be known before it is trusted; and
  compiled output is larger, against the first aim of this spec. It is a
  decision of its own, to be taken on the benchmark pages this spec builds.
- **Timing assertions in CI.** Durations on a shared runner are noise.
- **Anything of React 19 that is not named above** - `use`, actions, form
  hooks, document metadata.

## Further Notes

**How the figures were taken.** Each package was built fresh. For each export,
an entry re-exporting that one name from the built entry was bundled with
Rollup (stylesheets resolved to nothing; React and the umriss peers external),
minified with esbuild and gzipped at level 9. "Residue" is the same with an
import that names nothing.

| core, gzipped | as shipped | wrappers and contexts marked pure |
|---|---|---|
| residue | 43.4 KB | 1.2 KB |
| `age` | 43.5 KB | 1.3 KB |
| `Tabs` | 43.5 KB | 1.4 KB |
| `Checkbox` | 43.5 KB | 1.8 KB |
| `Modal` | 43.5 KB | 2.4 KB |
| `Button` | 43.5 KB | 5.2 KB |
| `Input` | 43.5 KB | 5.5 KB |
| `TreeView` | 43.5 KB | 7.1 KB |
| `Select` | 43.5 KB | 9.6 KB |
| `DatePicker` | 43.5 KB | 10.6 KB |
| `DateTimeRangePicker` | 43.5 KB | 14.0 KB |
| everything | 51.5 KB | 51.5 KB |

The right-hand column was measured with the marks set in the built file, 83
calls in core. Without the wrappers the figures should be the same or lower;
they are taken again for the README once the floor is in.

Residue of the other packages as shipped: charts 0.2 KB, calculation under
0.1 KB, table 2.0 KB (two filter registrations at the top of a module),
schedule 5.2 KB (its one large wrapper; under 0.1 KB once marked).

Whole packages, JavaScript as shipped, raw / gzipped: core 227 / 61 KB, charts
195 / 55 KB, table 176 / 51 KB, schedule 115 / 33 KB, calculation 27 / 9 KB.
With `es2022` as the target the gzipped sizes fall by 1.5, 1.1, 1.4, 0.7 and
0.1 KB.

**The `RangeError`** was confirmed in Node: a spread of 100 000 values into
`Math.max` returns, one of 125 000 throws. The limit is the engine's and is
lower in others.

**What was read and not measured.** Everything under "The table" beyond the
`RangeError`, and everything under "The schedule", "The tree" and "The charts",
was found by reading the code; none of it was profiled. That is why the
benchmark pages come first and why a part of each list is "decided on the
benchmark page".

**What was found to be in order** and needs no work: the charts redraw only the
overlay on hover, coalesce everything into one frame, downsample lines and
areas, bisect their hit tests and cache their formatters; core's providers
memoise their values and its formats are built once per locale; the table
keeps its selection in a set and caches its grouping model.

## Comments

**Delivery, 2026-10-12.** Tickets 01 to 20, 22 and 23 are done; 21 is closed
without code; 24 waits for the maintainer, because a version is released by
raising it. What was built departs from the text above in these places:

- **The pre-filter is not compared by its source text** (decision "An accessor
  is compared the way the charts compare theirs", user story 28). Two existing
  tests hold that a pre-filter reading the caller's state takes effect, and
  that is the ordinary way to write one. It is applied on every render and its
  result reconciled, as before. A column's `value`, `sortValue`, `groupValue`
  and the `rowKey` are compared as decided.
- **An aggregate is held per set of rows beside the projection**, not on it;
  the effect is the one decided.
- **Decided on the benchmark pages:** the table's four row candidates and the
  schedule's three were not tried, because the figures left nothing for them to
  win - for the table a profile named one other cause (the toolbar looked for
  selected rows in an empty selection), which was fixed. The deferred search
  and the bisecting matrix hit test were tried and dropped. Scatter is not
  windowed: its rows often come unsorted.
- **The schedule's benchmark page** shows that a pan's frame did not get
  shorter; only the synchronous cost of an event fell.
- **Two defects were found and fixed that the text did not know:** a
  virtualised tree's filler rows were squeezed by its flex column, and
  `NumberInput` and `CommandPalette` carry lint exceptions the hook rules had
  not asked for while the components were wrapped.

The figures stand in the capability records of the four packages and in core's
README; the changelog draft stands in ticket 24.
