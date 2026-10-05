# 04 — The segmented control, tracer at `md`

Status: done

Blocked by: 01, 03

Spec: `.scratch/field-row-alignment/spec.md`

## What to build

A new export from `@umriss-ui/core`: the **Segmented control** - one choice out
of a few short possibilities, drawn as one field with a segment for each. It
stands in the row of fields from 01 as one of them.

Its type: generic over the value; options carry `value`, `label` and `disabled`
and nothing else; props `options`, `value` (`T | null`), `defaultValue`,
`onChange`, `size`, `disabled`, `name` and its root's attributes; a forwarded
ref. No orientation, no line of explanation.

Its behaviour is the radio group's, through 03. Its drawing: a field's surface,
strong edge, radius and control height; a hairline seam between segments as in
the button group; the chosen segment filled with the primary ground and
foreground; hover and pressed on a segment as on a field; the focus ring on the
focused segment. Each segment as wide as its label; the width never follows
the choice.

## Acceptance criteria

- [x] Unit tests through the public interface: the radiogroup role and radio roles with their names; one tab stop and where it sits; arrow keys move, choose, skip disabled and wrap; controlled and uncontrolled; `null` as none chosen; `onChange` typed with the option values
- [x] Unit tests for the `FormField` wiring: label, description, required and invalid reach the group, and a click on the field's label chooses nothing
- [x] The row-of-fields example gains a segmented control; the layout test measures its box top and bottom equal to the select's, and its words on the field line within 1 px
- [x] Switching the choice leaves the control's width unchanged (measured)
- [x] A demo page for the segmented control, and its place on the site (ADR-0044)
- [x] A comment in the component says why it is a radio group and not a row of toggle buttons
- [x] The component brings no wording of its own
- [x] Lint, types, unit, build and visual pass

## Comments

Delivered: `SegmentedControl` with `SegmentedControlProps` and
`SegmentedOption`, built on `useRadioGroup`; a page in Forms after the radio
group, a configurator (`size`, `disabled`), two examples, a row in the README
table, a case in the pass-through test.

Three things beyond the ticket:

- **A group in a field had no name.** `label htmlFor` names only what HTML can
  label, and a `div` with `role="radiogroup"` is not that - the radio group
  inside a `FormField` was nameless all along (the demo's configurator gave
  it an `aria-label` of its own). The field's label now carries an id, the
  context hands it on as `labelId`, and the shared mechanics set
  `aria-labelledby`. The radio group gains a test for it.
- **It does not fill its place.** A field fills a place that gives it a width
  (ADR-0041); stretched, the segments stood in an empty box. The control is
  `fit-content`, never wider than its place.
- **`sm` came early**, because the row example has a small row: a small
  select's height, type and radius. Ticket 05 keeps `ControlSizeProvider`'s
  test, disabled, forced colours and the ellipsis.

`SegmentedOption.disabled` stands in `demo/unshown.json` as "not shown yet"
until 05 shows it.

Worth knowing for every baseline: a faint edge (17 % ink on white) lies
under the screenshot comparison's colour threshold. The first baselines of
this page were written while the control still stretched, and the stretched
edge passed the comparison; they were deleted and written anew.
