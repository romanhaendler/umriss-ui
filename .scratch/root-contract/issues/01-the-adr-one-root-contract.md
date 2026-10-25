# 01 - The ADR: one root contract

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/root-contract/spec.md`

## What to build

Record the decision as an ADR in `docs/adr/`. Take the next free number, and add its row to the ADR index.
In ADR-0018, mark the section "What stands from ADR-0015" as superseded by the new ADR, and add the
amendment to its status line in the index. Use the text below as the decision, in the house style of the
other ADRs: the question, the alternatives that were real, and the costs. No code changes in this ticket.

### Decision text

Title: **Every component has one of four shapes, its ref is an element, and its name is `aria-label`**

Six packages answered "what happens to a prop the component does not name" six ways:

- core passed everything to its root;
- Table, Chart and Schedule refused `id`, and Table and Chart refused `ref`;
- Chart dropped `data-*` without a word;
- Schedule's `ref` was a handle;
- Calculation split its class and its rest across two elements;
- the combobox family put a test id on a wrapper that `fill()` cannot type into.

The name was `ariaLabel` in six places and `aria-label` in the rest. The rule behind it, "`aria-label`
where the named element is the root", asked the caller to know the component's DOM, and two components
broke it.

**Every component has one of four shapes:**

1. **An element.** `ref`, `className`, `style` and every prop the component does not name reach its root
   element.
2. **A field.** Class and style reach the wrapper that a caller dresses and sizes (ADR-0041). `ref` and the
   rest reach the control that takes the focus: the native control, the combobox's input, and the trigger
   button of the multiselect and the date pickers.
3. **A composite**: a frame that holds several parts, such as the table, the chart, the schedule and the
   calculation.
   - `ref`, class, style and the rest reach the frame.
   - `aria-label`, `aria-labelledby` and `aria-describedby` reach the element that carries the role they
     name.
   - A caller's description is added to the component's own; it never replaces it.
4. **No element of its own**: a wrapper, a provider, or a part that its container reads or draws. It is a
   named exception with its reason.

The rest never replaces the component's own role, the `aria-*` it computes, or its handlers.

**`ref` is always an element.** No component hands a handle through `ref`. What a caller does to a component
from code is a function on the hook that declares it, beside `setView` and its setters (ADR-0047). It
returns `false` or `null` where its target is not shown.

**The accessible name is spelled `aria-label` everywhere.** This supersedes the section of ADR-0018 that
kept `ariaLabel` for a name that does not land on the root. A composite routes the name itself, so the
caller does not need to know which element is the root. `aria-labelledby` takes the same path, and it is how
the APG prefers to name a table by its heading.

**Each package holds the contract with the same guard.** The guard renders every component with a ref, a
class, a style and a data attribute, and checks where each one arrives. A component that is neither a case
nor a named exception fails.

Alternatives that were real:

- **A handle through a second prop** (`apiRef`, as MUI X does). It was rejected:
  - every stateful component of umriss is already declared through a hook that holds its state and
    setters, so a second way in would split one surface into two;
  - a function on the hook's return reaches a toolbar outside the component without passing a ref around.
- **Keep the handle on the schedule's `ref`.** It was rejected because `ref` would then mean an element in
  five packages and an object in one, and a caller could not measure or anchor to the schedule.
- **`ariaLabel` everywhere.** It was rejected because it fights the rest: an `aria-label` that a caller hands
  in through the HTML attributes would still arrive, at the frame, and name the wrong element.
- **A type test per component.** It was rejected because TypeScript does not check a hyphenated prop on a
  component. Only rendering shows where `data-*` went.

What it costs:

- One breaking minor in every package. There are no aliases: `ariaLabel` becomes `aria-label`, a
  `ScheduleHandle` ref becomes the hook's functions, and a picker's `ref` becomes its control's element.
  The compiler reports each of these.
- A selector or a test that found the pickers' `data-*` on the wrapper now finds it on the control.

## Acceptance criteria

- [ ] The ADR stands in `docs/adr/` with the next free number and the decision above, in the ADRs' style.
- [ ] The ADR index lists it. ADR-0018's row and its section "What stands from ADR-0015" name it as the
      superseding decision for the spelling of the name.
- [ ] Nothing outside `docs/adr/` changes.
