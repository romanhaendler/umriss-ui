# One root contract across the packages

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "One root contract across the packages" (its Answer
holds every decision below); findings `.scratch/shakedown/audit-family.md` 5 and its wishes, `qa.md` 2,
`schedule.md` (wishes), `operator-screens.md`; ADR-0018, ADR-0041, ADR-0047, ADR-0062; core's README,
principles 1 and 6.

## Problem Statement

What a component does with the props it does not name, and what its `ref` points at, depends on the package:

- **Core** passes `ref`, `className`, `style` and the rest to the root. Its guard proves it for every export.
- **Table, Chart and Schedule** reject `id`. Table and Chart also reject `ref`, and Table rejects `style`.
  Chart takes `data-*` and drops it without a word, because TypeScript does not check a hyphenated prop on a
  component.
- **Schedule's `ref`** is a handle, not an element.
- **Dashboard and Calculation** take HTML attributes but no `ref`. Calculation puts `className` on its surface
  and the rest on the list inside it.
- **Combobox, MultiSelect and the date pickers** put `data-testid` and `id` on a wrapper. So
  `getByTestId('city').fill()` fails, and `<label for>` labels nothing.
- **The name** is `ariaLabel` on Table, Chart, Schedule, TreeView, Popover and ContextMenu, and `aria-label`
  everywhere else. The rule behind this (ADR-0018: "`aria-label` where the named element is the root")
  asks the caller to know which element the root is. Schedule and TreeView break the rule anyway.
- **No way to act from code.** A caller cannot scroll a virtual table to a row or focus one of its cells.
  The schedule offers `positionAt` through its handle, but nothing that scrolls to a lane or to a subtask.

A developer who has learnt one package is a beginner in the next. A test suite needs a wrapper element for
every component outside core.

## Solution

One contract for every component of the six packages, held by the same guard in each package:

- **An element.** `ref`, `className`, `style` and every prop the component does not name reach its root
  element.
- **A field.** Class and style reach the wrapper. `ref` and the rest reach the control that takes the focus.
  The combobox family and the date pickers join the native fields here.
- **A composite**: Table, Chart, Schedule and Calculation.
  - `ref`, class, style and the rest reach the frame.
  - `aria-label`, `aria-labelledby` and `aria-describedby` reach the element that carries the role they
    name.
- **No element of its own.** Named exceptions, each with its reason.

`ref` is always an element. What a caller does to a component from code is a function on the hook's return:

- the schedule's `positionAt`, `clientPointOf` and `visibleDomain` move there;
- the table gains `scrollToRow` and `focusCell`;
- the schedule gains `scrollToLane`, `scrollToSubtask` and `focusSubtask`.

The name is spelled `aria-label` everywhere.

All of it ships in one minor of the six packages, under the upgrade promise:

- `ariaLabel` and the schedule's handle keep working for one further minor, and each warns once in
  development. The release after that removes them.
- Where the rest of a field or of the Calculation lands is the one change that cannot keep its old form.
- Every change carries a migration line in its changelog.

## User Stories

1. As an application developer, I want every umriss component to take `id`, `data-*` and `aria-*` the way an
   HTML element does, so that I don't look up per package what reaches the DOM.
2. As a QA engineer, I want `data-testid` on a Table, a Chart or a Schedule to reach the page, so that my
   locator finds it without a wrapper `<div>` of my own.
3. As a QA engineer, I want `data-testid` on a Combobox to reach its input, so that
   `getByTestId('city').fill()` works as it does on an Input.
4. As an application developer, I want `id` on a Combobox, a MultiSelect or a DatePicker to reach the control,
   so that a `<label for>` of my own names it.
5. As a form-library user, I want a Combobox's `ref` to be its input, so that `register()` and `focus()`
   reach the element the user types into, as they do on Input and Select.
6. As an application developer, I want a `ref` on Table, Chart, Schedule, Calculation and Dashboard to give
   me the root element, so that I can measure it, anchor a popover to it or scroll it into view.
7. As an application developer, I want `style` on a Table, so that I can size or place it as I do every
   other component.
8. As an application developer, I want to name a table, a chart or a schedule with `aria-label`, the native
   spelling, so that I don't have to remember which components want `ariaLabel`.
9. As an accessibility-minded developer, I want `aria-labelledby` on a Table or a Chart to point at my visible
   heading, so that the name is the text the reader sees, as the APG recommends.
10. As an accessibility-minded developer, I want my `aria-describedby` on a chart or a schedule to be added
    to its own summary, so that I add a note without losing the summary.
11. As an application developer, I want a Calculation's `data-*`, `id` and `ref` to reach the same surface
    that its `className` reaches, so that one element carries everything I hand it.
12. As a schedule host, I want `positionAt` and `clientPointOf` on `useSchedule`'s return, so that a toolbar
    or a drop handler outside the schedule reaches them without passing a ref around.
13. As a schedule host, I want the README to say that `setDomain(span)` zooms to a span and `setDomain(null)`
    fits the work, so that I stop looking for `zoomTo` and `fit`.
14. As an operator-screen developer, I want `scrollToRow(key)` on `useTable`'s return, so that a click on an
    alarm elsewhere brings its row into view, also in a virtual or paged table.
15. As a keyboard user's developer, I want `focusCell(key, column)` in grid mode, so that after an action
    the focus lands on the cell that the action concerned.
16. As a schedule host, I want `scrollToLane(lane)`, so that a lane picked in a list comes into view.
17. As a schedule host, I want `scrollToSubtask(id)`, so that a finding in my list shows its subtask - its
    lane and its time - without moving the focus.
18. As a keyboard user's developer, I want `focusSubtask(id)`, so that the plot takes the focus with that
    subtask as the **Active subtask**, and the arrows walk on from there.
19. As an application developer, I want these functions to return `false` when the row, the lane or the
    subtask is not shown (filtered out, folded away, unknown, not mounted), so that I can tell the user
    instead of guessing.
20. As an upgrading developer, I want each changelog to give one migration line per change (`ariaLabel` to
    `aria-label`, a `ScheduleHandle` ref to the hook's functions, where a picker's or a Calculation's rest
    now lands), so that the upgrade is mechanical.
21. As an upgrading developer, I want `ariaLabel` and a `ScheduleHandle` ref to keep working for one minor
    and warn once in development, so that I can upgrade first and migrate after.
22. As an upgrading TypeScript developer, I want the deprecated names marked deprecated in my editor, and a
    picker's changed `ref` reported by the compiler, so that I find every place to change.
23. As the maintainer, I want one guard per package to render every component with a ref, a class, a style
    and a data attribute, and fail on a component that is neither a case nor a named exception, so that a new
    component cannot drift from the contract.
24. As the maintainer, I want the guard to check that a composite's name reaches the element with the role
    and not the frame, so that a refactor cannot leave a table unnamed.
25. As the maintainer, I want the contract written once - in an ADR, and in core's README as principle 1 for
    the family - so that a sixth package does not invent a fifth shape.

## Implementation Decisions

- **The four shapes.**
  - **Element.** `ref`, `className`, `style` and the rest go to the root element.
  - **Field** (ADR-0041). Class and style go to the wrapper; `ref` and the rest go to the control that takes
    the focus. The members are:
    - the eight native fields, as today;
    - `Combobox`: its input;
    - `MultiSelect`, `DatePicker`, `DateTimePicker`, `DateRangePicker` and `DateTimeRangePicker`: their
      trigger button.

    Core's clause that takes the pickers' `aria-label`, `aria-labelledby` and `aria-describedby` out of the
    rest is deleted, since the rest now lands on the focused control. The table's `Search` is an `Input` and
    already follows this shape.
  - **Composite.** `ref`, `className`, `style` and the rest go to the frame. `aria-label`, `aria-labelledby`
    and `aria-describedby` are taken out of the rest:

    | Composite | Where the name goes |
    |---|---|
    | Table | the `<table>` |
    | Chart | the plot |
    | Schedule | the figure root and the plot, as now |
    | Calculation | its list |

    A caller's `aria-describedby` is joined to the component's own, its own first.
  - **No element.** Named exceptions in each package's guard, each with its reason. They are:
    - the wrappers (`Popover`, `Tooltip`, `Menu`, `ContextMenu`, the providers);
    - the parts a container reads or draws: the table's `Column` family; the charts' series, axes,
      `Legend`, `DataTable`, `Tooltip`, limits and `ControlChart`; the schedule's `Lane` family; the
      calculation's operators and givens; the dashboard's `WidgetType` and `HeadingType`.
  - In every shape, the component's own `role`, the `aria-*` it computes and its handlers are not replaced
    by the rest. A caller's handler runs first (core principle 1, unchanged).
- **Types.** A props type extends the HTML attributes of its element (with the component's own names
  omitted where they clash) and `RefProp<E>` from core. Charts depends on nothing, so it declares
  `ref?: Ref<HTMLDivElement>` itself. `TableProps`, `ChartProps` and `ScheduleProps` gain the attributes;
  `CalculationProps` and `DashboardProps` gain the ref.
- **The name.** On Table, Chart, Schedule, `TreeView`, `Popover` and `ContextMenu`, `aria-label` replaces
  `ariaLabel`.
  - For one further minor, `ariaLabel` stays as a deprecated alias: the component reads
    `aria-label ?? ariaLabel`, and the old name warns once in development. The warning uses the mechanism
    that the upgrade-promise spec defines, which is being written as `.scratch/upgrade-promise/`. The
    release after that removes the alias (ticket 10).
  - Where a name is required today (TreeView, Schedule, ContextMenu), `aria-label` is required.
  - Chart's development warning names `aria-label` and is satisfied by `aria-labelledby` as well.
  - Every internal use moves too: the table's and the dashboard's popovers, core's own components, and the
    demos.
- **`ref` is always an element.** `ScheduleHandle` goes. Its three functions move to `ScheduleParts` with
  the same signatures.
  - For one further minor, a bridge keeps the old `ref` working:
    - the element that the Schedule hands its `ref` also carries the three functions;
    - the `ref` prop accepts a ref to either the element or the handle;
    - `ScheduleHandle` stays exported, marked deprecated;
    - the first call of a handle function through the element warns once in development, by the same
      mechanism as the alias.
  - The release after that removes the bridge and the type (ticket 10). While the schedule is not mounted, `positionAt` and `clientPointOf` return
  `null`, as `clientPointOf` does today off screen.
- **Functions on the hook's return.** Each one acts on the mounted component and returns whether the target
  is now shown. It returns `false` and changes nothing for a target that is unknown, filtered out, inside a
  folded group or branch, or not mounted. None of them unfolds or clears a filter.
  - `useTable` → `scrollToRow(key)`.
    - In a paged table it moves to the row's page, as `setPage` does.
    - In a scroll area or a virtual table it scrolls the row into view, from the row pitch (ADR-0042).
    - In server mode it reaches only the rows of the page it holds.
  - `useTable` → `focusCell(key, column)`. In grid mode, it brings the row into view, makes the cell the
    **Active cell** and focuses it. Outside grid mode it returns `false`.
  - `useSchedule` → `scrollToLane(lane)`. It scrolls the lanes vertically until the lane's row is in view.
  - `useSchedule` → `scrollToSubtask(id)`. It brings the subtask's lane into view, and its time as well:
    when the subtask lies outside the span, the span moves to it and keeps its width, as a `setDomain` would.
    The focus stays where it is.
  - `useSchedule` → `focusSubtask(id)`. It does what `scrollToSubtask` does, then makes the subtask the
    **Active subtask** and focuses the plot.
  - `fit` and `zoomTo` are not added. The README names `setDomain(null)` and `setDomain(span)` for them.
- **The guard.** Core's pass-through guard moves into the demo's `tests-support` as a function, beside the
  style and wording guards. Each package's test calls it with:
  - the package's exports;
  - its cases (render functions, including the components a hook hands back);
  - its exceptions with their reasons;
  - per case: which shape it has and, for a field or a composite, how to find the control or the named
    element.

  It renders each case with a ref, a class, a style and a data attribute. For a composite it also passes
  the three name attributes. It asserts that:
  - each probe arrives where the shape says;
  - the data attribute stands on exactly one element;
  - the name attributes are on the named element and not on the frame.

  The checks core's guard makes today remain: every export is a case or an exception, and no export is a
  `forwardRef` object.
- **Documents.**
  - Core's README principle 1 states the four shapes for the family, and principle 6 drops the
    `ariaLabel` exception.
  - Each other package's README says in one line which shape its components have, and where a composite's
    name goes.
  - `API.md` is regenerated in every package.
  - The skill `skills/umriss-ui` loses every `ariaLabel`.
- **Release.** One minor of each of the six packages, released together, as the upgrade promise has them
  release in step. Each changelog's Changed section carries a migration line per change.
  - The alias and the bridge are named as deprecated, together with the release that removes them.
  - **The one break.** On the six pickers and combobox fields (wrapper → control) and on the Calculation
    (list → surface), the place where the rest and `ref` land changes with no old form kept. A ref or an
    attribute stands on one element, and copying `id` or `data-*` onto both elements would create duplicate
    ids and two matches for one test id. The migration line names the new element.
- **Removal.** In the minor after, ticket 10 removes the aliases and the bridge, each with a Changed entry
  and a migration line.
- **ADR.** A new ADR records the contract, the element `ref`, the functions on the hook's return and the
  spelling `aria-label`. It supersedes ADR-0018's section "What stands from ADR-0015", which keeps a note
  that points at it. It is the first ticket.

## Testing Decisions

- A good test renders a component the way an application does and asserts on the DOM a user or a test tool
  reaches: where the probe attributes landed, which element is named, what is in view and what has the
  focus. It never asserts on internal class names or module state.
- **The contract** is tested by the shared guard, once per package, in each package's unit tests. The
  prior art is core's pass-through test, which becomes its first caller, and the shared style, wording and
  glyph guards in the demo's `tests-support`, which show the shape of a shared guard.
- **Types**: the schedule's existing type test (`types.test-d`) asserts that a `ref` on `Schedule` is an
  `HTMLDivElement`. While the bridge stands, it also asserts that a `ScheduleHandle` ref is accepted and
  marked deprecated. Once ticket 10 removes the bridge, it asserts that such a ref is a type error. Core's
  `iconButton` test already proves that a wrong element type is refused, and nothing more is added there.
- **Deprecated names**: a unit test per package asserts that each old name still works and warns exactly
  once in development.
- **The functions on the hook's return** are tested in jsdom through the hook, beside the existing tests:
  - the table's grid-mode, paging and virtual-row tests for `scrollToRow` and `focusCell`;
  - `useSchedule`'s and the schedule view's tests for the schedule's functions.

  The tests cover:
  - the page that is switched;
  - the scroll offset that is set;
  - the active cell or **Active subtask** with the focus;
  - every `false` case.

  In a real browser, the scroll is proved by one `@quick` visual check per package against the new demo
  example.
- **Examples.** Each new function gets an example in its package's demo. The schedule's existing handle
  example moves to the hook's functions.

## Out of Scope

- A second ref prop (`apiRef`, `handleRef`) or any handle type.
- Unfolding a group, a branch or a lane group, or clearing a filter, to reach a target. The function returns
  `false`, and the existing toggles do the rest.
- `fit` and `zoomTo` as new names; zoom buttons and keyboard zoom on the schedule (map ticket 23).
- A function on the chart's hook. No persona asked for one.
- Development warnings for a missing name on Table, Schedule or Calculation (map ticket 18).
- The deprecation mechanism itself: its development warning helper and its wording. The upgrade-promise
  spec defines them, and this spec uses them.
- Keeping the old landing place of a picker's or a Calculation's rest. It cannot stand beside the new one.
- `data-testid` on core's `Tooltip`. It wraps the caller's child, and the child carries the caller's test id.
- The schedule bars' hit targets for test tools (`qa.md` 5): a defect of its own.

## Further Notes

- The six packages release in step, so the contract reaches every application in one upgrade. The tickets
  land on `main` one after another; the release waits until the last of tickets 03 to 07 is in. Ticket 10
  goes into the minor after that one.
- If `.scratch/upgrade-promise/issues/` holds a ticket for the deprecation mechanism when tickets 03 to 06
  start, that ticket blocks them.
- "Root" in this spec means the element a component's `ref` reaches. For a field that is its control, while
  its class dresses the wrapper. The ADR uses the same words.
- `CONTEXT.md` names `ScheduleHandle` under **Grip**, and states the old spelling rule under "Language".
  Both go with this spec. The coordinating session writes them.
