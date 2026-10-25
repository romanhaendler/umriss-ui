# One root contract across the packages

Type:   grilling
Status: resolved

## Question

What does every umriss component do with props it does not name, and what does its `ref` point at?

Core's README states principle 1 for core: rest props reach the root, `ref` is the root element. The other
packages each differ (`.scratch/shakedown/audit-family.md` 5, `qa.md` 2): Table, Chart and Schedule reject
`id`; Table and Chart reject `ref`; Table rejects `style`; Schedule's `ref` is a handle; Dashboard and
Calculation take no `ref`; Calculation splits `className` and the rest across two elements; Chart drops
`data-*` silently; `data-testid` lands on the wrapper of Combobox, MultiSelect and DatePicker. Naming:
`ariaLabel` vs `aria-label`.

To settle:

- The contract: which element is the root of each part, which props reach it, and where a field's `data-*`
  goes (the control or the wrapper).
- `ref`: always the root element? Then where do imperative handles live - a second prop (`handleRef`,
  `apiRef`) or the hook's return? This also answers the wish for imperative handles: scroll to a row, focus a
  cell, select from code on a (virtual) table; `scrollToLane`, `zoomTo`, `fit` on the schedule
  (`audit-family.md` wishes, `schedule.md`, `operator-screens.md`).
- `ariaLabel` or `aria-label`, family-wide, and how the rename is shipped (a breaking change per package).
- A guard that keeps the contract (a type test per component?).

Costly to reverse: an ADR.

## Answer

Decided 2026-10-25 by the agent, under the maintainer's delegation. Technical decisions are marked
*(agent)*; the product call is marked *(agent, product - for review)*.

- **One contract with four shapes, held by one guard** *(agent)*. Every exported component, and every
  component a hook hands back, has exactly one of these shapes:
  1. **An element.** `ref`, `className`, `style` and every prop the component does not name reach its root
     element. "Every prop it does not name" is the rest, including `id`, `data-*` and `aria-*`. This covers
     most of core, `TreeView`, the table's `Toolbar`, `Pagination`, `Export` and `ColumnMenu`, and the
     Dashboard.
  2. **A field** (ADR-0041). `className` and `style` reach the wrapper that a caller dresses and sizes. `ref`
     and the rest reach the control that takes the focus.
     - **New:** `Combobox`, `MultiSelect` and the four date pickers join the eight native fields. Their
       `ref` and rest move from the wrapper to the `<input role="combobox">` or the trigger `<button>`. So
       `data-testid`, `id` and `<label for>` reach what the user operates (`qa.md` 2).
     - Core's special clause that takes the pickers' `aria-*` out of the rest goes. The rest now lands on
       the focused field anyway.
  3. **A composite**: a frame that holds several parts. This covers `Table`, `Chart`, `Schedule` and
     `Calculation`.
     - `ref`, `className`, `style` and the rest reach the frame.
     - A caller's `aria-label`, `aria-labelledby` and `aria-describedby` are taken out of the rest. They go
       to the element that carries the role they name: the `<table>`, the chart's plot, the schedule's figure
       and plot, and the calculation's list.
     - A caller's `aria-describedby` is added to the component's own description; it never replaces it.
     - The gaps close. Table, Chart and Schedule take `id`, `data-*` and an element `ref`. Table takes
       `style`. Chart stops dropping `data-*`. Calculation moves its rest from the inner list to the surface
       that its class already reaches.
  4. **No element of its own.** These are named exceptions with a reason, as in core's guard today:
     - the wrappers: `Popover`, `Tooltip`, `Menu`, `ContextMenu` and the providers;
     - the parts a container reads or draws: `Column`, `Line`, `Legend`, `Lane`, `Given`, `WidgetType` and
       the like.

     A test id belongs on the caller's own child of a `Tooltip`, or on the container.

  Core principle 1 still stands: the rest never replaces the component's own role, the `aria-*` it computes,
  or its handlers.
- **`ref` is always an element** *(agent)*. No component hands a handle through `ref`.
  - The Schedule's `ref` becomes its root `<div>`, and `ScheduleHandle` is removed after one bridging minor
    (see the shipping bullet below).
  - Charts depends on nothing, so it declares its `ref` itself. The other packages extend core's `RefProp`
    (ADR-0062).
- **What a caller does to a component from code is a function on the hook's return** *(agent)*. It stands
  beside `setView` and the setters that are already there (ADR-0047). There is no second ref prop (`apiRef`,
  `handleRef`) and no handle type. The reasons:
  - every stateful component is already declared through a hook whose return holds its state and setters;
  - a toolbar outside the component reaches the function without passing a ref around;
  - `ref` keeps one meaning across the family.

  A function called before its component mounts, or for a target that is not shown, changes nothing and
  returns `false` (or `null` where it returns a value). `positionAt`, `clientPointOf` and `visibleDomain`
  move from the handle to `useSchedule`'s return, unchanged.
- **The handle wishes** (ticket 23 points here):
  - The schedule's `zoomTo` and `fit` already exist: `setDomain(span)` and `setDomain(null)`. The README
    says so. Zoom buttons and keyboard zoom stay with ticket 23.
  - Selecting a row from code already exists: `selection` with `useTableSelection`.
  - **Taken** *(agent, product - for review)*:
    - on `useTable`'s return: `scrollToRow(key)`, and `focusCell(key, column)` in grid mode;
    - on `useSchedule`'s return: `scrollToLane(lane)`, `scrollToSubtask(id)` and `focusSubtask(id)`.

    Three personas asked for these, and a virtual table offers no workaround.
  - **Out:** unfolding a group or a branch to reach a row or lane, and a chart function (no persona asked
    for one). The function returns `false`, and the existing toggles unfold.
- **The name is spelled `aria-label` across the family, and `ariaLabel` goes** *(agent)*. This replaces
  ADR-0018's rule ("`aria-label` where it names the root, `ariaLabel` elsewhere"). The reasons:
  - A caller never needs to know which element is the root, because a composite routes the name itself.
  - `aria-labelledby`, the APG's preferred way to name a table by its visible heading, takes the same path.
    Today Table and Chart cannot take it at all.
  - The renamed props are on Table, Chart and Schedule, and on core's `TreeView`, `Popover` and
    `ContextMenu`.
  - Whether a name is required does not change: TreeView, Schedule and ContextMenu still require one.
    Development warnings for a missing name belong to ticket 18.
- **Shipped under the upgrade promise** (ticket 19). Everything goes into one minor of all six packages,
  and every Changed entry carries a migration line.
  - **`ariaLabel` keeps working for one further minor** *(agent)*. It stays as a deprecated alias, the
    component reads `aria-label ?? ariaLabel`, and the old name warns once in development through the
    mechanism the upgrade-promise spec defines. The release after that removes it.
  - **The Schedule's handle is bridged for one minor** *(agent)*. For that one minor, the element that a
    Schedule hands its `ref` also carries `positionAt`, `clientPointOf` and `visibleDomain`. The `ref` is
    typed so that it accepts a ref to either the element or the handle. `ScheduleHandle` is still exported,
    marked deprecated, and the first call of a handle function through the element warns once. The release
    after that removes the bridge and the type.
  - **The one break, with no old form kept** *(agent, product - for review)*: where the rest and `ref` land
    on the six pickers and combobox fields (wrapper → control) and on the Calculation (list → surface).
    - A ref or an attribute stands on one element, so an old place and a new place cannot both hold it.
      Copying `id` or `data-*` onto both elements would create duplicate ids and two matches for one test
      id.
    - The migration line names the new element. For a picker the compiler reports it, because its `ref`
      changes element type.
- **Held by the pass-through guard in every package, not by a type test per component** *(agent)*.
  TypeScript does not check `data-*` on a component, so only rendering proves the contract.
  - Core's guard moves into the demo's `tests-support`, beside the style and wording guards.
  - Each package runs it over its exports and over the components its hooks hand back. Each component must
    be a case or a named exception.
  - The four probes must arrive at the element its shape names. For a composite, the name probes must also
    arrive at the named element and not at the frame.
  - A new component that is in neither list fails.
- **Costly to reverse: yes, so an ADR**, the first ticket of the spec. It supersedes ADR-0018's section
  "What stands from ADR-0015", and it amends core's README principles 1 and 6.
- **Touches** all six packages: their sources, demos, READMEs and `API.md`. It also touches the demo's
  `tests-support` and the shipped skill `skills/umriss-ui`.
- **Becomes the spec** `.scratch/root-contract/`.
