# 03 - Table, schedule, calculation

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/forced-colors/spec.md`

## Scope

FC2, FC3 in the three packages (selected rows, group bands, subtasks, findings, the calculation's verdicts).

## Acceptance

- Forced-colour screenshots; axe clean.

## Comments

**Delivered** with 01 and 02.

- Table: a selected row draws 2px `Highlight` lines inside its cells, a
  focused virtual row 2px `CanvasText` lines - on a `::after` per cell,
  because the sticky cells paint over an outline on the row and a border grows
  it; the pinned blocks' inner edge becomes a line; the share bar
  `CanvasText`. Group bands keep their strong lines, chevron, count and weight;
  their tone goes. The alarm list's inset edge goes too - its word stays.
- Schedule: the canvas resolves `FORCED` system colours instead of its tokens
  (work in `CanvasText`, lines `GrayText`, overlap, late transport, the present
  and accent `Highlight`), and the active subtask - a wash otherwise - draws a
  2px `Highlight` outline around its bar. Grips and the ghost's label get
  outlines.
- Calculation: the hover coupling's band becomes an outline in `Highlight`
  (2px on the quantity, 1px on its operands), the derivation's spine
  `CanvasText`.
- Pictures: every page's first example, plus pinned blocks scrolled, bands,
  a whole group selected, selected rows, a focused virtual row, the schedule's
  active subtask, the calculation's hover coupling - light and dark, each
  looked at. Axe clean with `color-contrast` off (see 02).
- Left for 04: on the schedule's canvas an overlap, a late transport, the
  present and the active subtask all share `Highlight`; tasks lose their
  colour identity (lane and label tell them apart).
