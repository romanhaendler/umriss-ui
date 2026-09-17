# 06 — Rubrik Formulare: thirteen pages

Status: done

Blocked by: 03, 05

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

Input · FormField · Textarea · NumberInput · Checkbox · RadioGroup · Select ·
Combobox · MultiSelect · DatePicker · DateTimePicker · DateRangePicker ·
DateTimeRangePicker

The bundles dissolve here, and this is where dissolving them pays: `Select`,
`Combobox` and `MultiSelect` shared one address and two of the three could not
be linked to at all. Each now has its own page, its own examples and its own
table.

The four pickers are four pages and not one. They share modules
(`.scratch/picker-shared-modules/`, `.scratch/range-panel-bausteine/`) and that
is an implementation fact; a developer looking for `DateTimeRangePicker` looks
for `DateTimeRangePicker`.

**JSDoc to write** — this rubric carries the worst of it: MultiSelect 0/11 ·
Combobox 2/11 · RadioGroup 3/14 · DateTimeRangePicker 3/18 · DatePicker 1/7 ·
FormField 3/8 · DateTimePicker 2/8 · DateRangePicker 2/8 · NumberInput 4/10 ·
Input 2/5 · Textarea 4/6 · Select 1/4. Roughly forty comments, more than half
the total debt.

**"Warum so"**: real material here. The value contract the pickers share
(`.scratch/picker-value-contract/`) is exactly the kind of decision a reader
will otherwise fight: what a picker emits, when, and what `null` means. Put it
on the pages it governs rather than in one place, or on `DatePicker` with the
others linking to it — decide once and be consistent.

## Acceptance

- Thirteen pages, each with examples that show its own component and not its
  neighbour's.
- Every picker page states what its value is and when `onChange` fires, in the
  purpose line or the first example — not only in the table.
- The gate fails for any bare prop on these thirteen components.
- Validation, error and disabled states appear as examples on `FormField` and on
  at least one field component, since that is the pair a reader actually needs.
- Baselines regenerated; suite passes.

## Notes

Expect to discover, while writing forty JSDoc comments, that two or three props
are hard to describe because they do two things. Record those in the handover.
Do **not** change a public API here — the spec puts that out of scope — but a
prop that resists description is a finding worth its own ticket later.

## Comments

**Delivered, together with ticket 03** — see the reasoning there: the bridge was
the way to an intermediate state, and there was none.

Every page of this rubric has at least one example; the JSDoc gaps of these
components are closed, and the gate is unconditional for them.
