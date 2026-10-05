# 04 — The segmented control, tracer at `md`

Status: ready-for-agent

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

- [ ] Unit tests through the public interface: the radiogroup role and radio roles with their names; one tab stop and where it sits; arrow keys move, choose, skip disabled and wrap; controlled and uncontrolled; `null` as none chosen; `onChange` typed with the option values
- [ ] Unit tests for the `FormField` wiring: label, description, required and invalid reach the group, and a click on the field's label chooses nothing
- [ ] The row-of-fields example gains a segmented control; the layout test measures its box top and bottom equal to the select's, and its words on the field line within 1 px
- [ ] Switching the choice leaves the control's width unchanged (measured)
- [ ] A demo page for the segmented control, and its place on the site (ADR-0044)
- [ ] A comment in the component says why it is a radio group and not a row of toggle buttons
- [ ] The component brings no wording of its own
- [ ] Lint, types, unit, build and visual pass
