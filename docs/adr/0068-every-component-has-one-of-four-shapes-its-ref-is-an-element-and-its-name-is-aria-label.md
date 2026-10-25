# Every component has one of four shapes, its ref is an element, and its name is `aria-label`

Status: accepted, supersedes ADR-0018 in part (its section "What stands from ADR-0015")
Date:   2026-10

Six packages answered "what happens to a prop the component does not name" six
ways:

- core passed everything to its root;
- Table, Chart and Schedule refused `id`, and Table and Chart refused `ref`;
- Chart dropped `data-*` without a word;
- Schedule's `ref` was a handle;
- Calculation split its class and its rest across two elements;
- the combobox family put a test id on a wrapper that `fill()` cannot type into.

The name was `ariaLabel` in six places and `aria-label` in the rest. The rule
behind it, "`aria-label` where the named element is the root", asked the caller
to know the component's DOM, and two components broke it.

## Decision

**Every component has one of four shapes:**

1. **An element.** `ref`, `className`, `style` and every prop the component does
   not name reach its root element.
2. **A field.** Class and style reach the wrapper that a caller dresses and sizes
   (ADR-0041). `ref` and the rest reach the control that takes the focus: the
   native control, the combobox's input, and the trigger button of the
   multiselect and the date pickers.
3. **A composite**: a frame that holds several parts, such as the table, the
   chart, the schedule and the calculation.
   - `ref`, class, style and the rest reach the frame.
   - `aria-label`, `aria-labelledby` and `aria-describedby` reach the element that
     carries the role they name.
   - A caller's description is added to the component's own; it never replaces it.
4. **No element of its own**: a wrapper, a provider, or a part that its container
   reads or draws. It is a named exception with its reason.

The rest never replaces the component's own role, the `aria-*` it computes, or
its handlers.

**`ref` is always an element.** No component hands a handle through `ref`. What a
caller does to a component from code is a function on the hook that declares it,
beside `setView` and its setters (ADR-0047). It returns `false` or `null` where
its target is not shown.

**The accessible name is spelled `aria-label` everywhere.** This supersedes the
section of ADR-0018 that kept `ariaLabel` for a name that does not land on the
root. A composite routes the name itself, so the caller does not need to know
which element is the root. `aria-labelledby` takes the same path, and it is how
the APG prefers to name a table by its heading.

**Each package holds the contract with the same guard.** The guard renders every
component with a ref, a class, a style and a data attribute, and checks where
each one arrives. A component that is neither a case nor a named exception fails.

## Considered Options

- **A handle through a second prop** (`apiRef`, as MUI X does). Rejected:
  - every stateful component of umriss is already declared through a hook that
    holds its state and setters, so a second way in would split one surface into
    two;
  - a function on the hook's return reaches a toolbar outside the component
    without passing a ref around.
- **Keep the handle on the schedule's `ref`.** Rejected, because `ref` would then
  mean an element in five packages and an object in one, and a caller could not
  measure or anchor to the schedule.
- **`ariaLabel` everywhere.** Rejected, because it fights the rest: an
  `aria-label` that a caller hands in through the HTML attributes would still
  arrive, at the frame, and name the wrong element.
- **A type test per component.** Rejected, because TypeScript does not check a
  hyphenated prop on a component. Only rendering shows where `data-*` went.

## Consequences

- One minor in every package, under the upgrade promise (ADR-0066):
  - `ariaLabel` keeps working for one further minor as a deprecated alias, and it
    warns once in development.
  - A `ScheduleHandle` ref keeps working for one further minor, and it warns once
    in development. For that minor the element also carries the handle's three
    functions.
  - The release after that removes both.
- The one break with no old form kept is where the rest and `ref` land:
  - on the pickers and the combobox fields, which now use their control;
  - on the Calculation, which now uses its surface.

  A ref or an attribute stands on one element. A selector or a test that found a
  picker's `data-*` on the wrapper now finds it on the control. The compiler
  reports a picker's `ref`, because its element type changes.
- ADR-0018's section "What stands from ADR-0015" is superseded by this decision;
  the rest of ADR-0018 stands.
