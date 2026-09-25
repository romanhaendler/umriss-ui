# 04 - Examples and capabilities

Status: done
Type: task
Blocked by: 03

Spec: `.scratch/table-grid-mode/spec.md`

## Scope

Demo: a setpoint list, a comments column; the README and CHANGELOG.

## Acceptance

- The examples ladder from simple to full; screenshots.

## Comments

**Done (2026-09-25).** Four examples on the Table page, a ladder:
`11-grid-mode` (walking, a checkbox and an action behind Enter),
`12-comments-column` (one text column, applied by the example),
`13-setpoint-list` (number with range validation, select, date),
`14-the-whole-grid` (grouped, pinned, 2000 virtual rows, two editing columns).
A "why" section on the Table page; README and CHANGELOG (table: Added; core:
Changed, `editCell`).

- Eight new baselines, looked at in both themes before accepting.
- `table--demonstration` moved (571 to 570 px, text on other subpixels): the
  page grew above it. Measured, not assumed: with the four examples moved out
  and the component changes kept, the old baseline passed; renewed once.
- The examples sit on the Table page rather than a page of their own: a new
  page would have moved the overview picture and cut the ladder in two.
