# 02 — Radio group

Status: done

Spec: `.scratch/foundation-primitives/spec.md`

## Scope

Add a radio group for the case between a checkbox and a select: a small set of
mutually exclusive options, each of which may carry a line of explanation.

Behaviour:

- Owns the selected value; supports controlled and uncontrolled use.
- Renders options from a description carrying a value, a label, an optional
  explanation line and an optional disabled flag.
- Exactly one tab stop for the whole group; arrow keys move the selection and
  wrap at both ends; disabled options are skipped.
- Lays out in a row or a column.
- The explanation line is associated with its option so assistive technology
  reads them together.
- Binds to the surrounding field context like the other form elements.

## Acceptance

- Demo tile with a row layout, a column layout with explanation lines, a
  disabled option, and a disabled group.
- Interaction tests: arrow keys move the selection, the group holds one tab
  stop, disabled options are skipped, wrapping works at both ends.
- Screenshot baselines in both themes.
- No existing component changed.

## Notes

The arrow-key handling is built **inside this component**, matching the pattern
the calendar, the menu, the tabs, the combobox and the multi-select each use.
Extracting a shared helper was considered and declined for this work — doing it
here would turn a purely additive change into a refactor of the components the
handoff protects most carefully. If the duplication is worth removing, that is a
separate spec.
