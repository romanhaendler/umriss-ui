# One root contract across the packages

Type:   grilling
Status: claimed

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
