# Every component takes a ref, a class and the rest

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

Rule 1 and 2 of core's "Principles for new components" are not met by 21
components: `Badge`, `Card`, `Combobox`, `CommandPalette`, `EmptyState`,
`FormField`, `Modal`, `MultiSelect`, `Skeleton`, `Spinner`, `Stat`, `Tabs`,
`TreeView`, `TreeSearch`, `ConfirmDialog`, `Sparkline`, `Meter` and the four
pickers take no `ref`, no `className` and drop unknown props; `Tabs` is
controlled only, `Card` uncontrolled only. The work was filed under
`library-audit` ticket 09, which went `wontfix` with the renames it was bundled
with - the renames were done by ADR-0018 instead, the pass-through never was.
The comparison names it the first integration obstacle: a caller cannot hang a
tooltip on a `Stat`, measure a `Card` or set a `data-testid`.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| P1 | Which element gets the ref? | The root element the component renders; for `Modal`/`ConfirmDialog` the `<dialog>`, for the pickers and the combobox family the field's wrapper (the element that carries the ring), for `TreeView` the `role="tree"` list. |
| P2 | How are `className` and `style` merged? | Appended to the component's own class; `style` spread after the component's own inline style, never replacing a positioning style the component computes (the popover rule). |
| P3 | Which props may `...rest` not override? | The component's own `role`, `aria-*` it computes and its event handlers are composed, not replaced: a caller's `onKeyDown` runs first and can `preventDefault`. |
| P4 | How is it held? | By a guard test over every exported component (render, pass ref/className/data-attribute, assert they arrive), with the named wrappers of rule 1 as the only exceptions. Written first and red. |
| P5 | Tabs and Card | `Tabs` gains `defaultValue`; `Card` gains `collapsed`/`onCollapsedChange` beside its own state - the rule 2 pattern of the other fields. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The pass-through guard | S |
| 02 | Display components | M |
| 03 | Overlays and composites | M |
| 04 | The combobox family and the pickers | M |
| 05 | Tabs uncontrolled, Card controlled | S |

## Testing

The guard test is the seam (P4); per component one render test. Existing
keyboard and screenshot suites must stay green - nothing visible moves.

## Out of scope

Renaming props; changing any component's DOM structure.
