# 04 — Rendering header bands and spans

Status: done
Type: task

Blocked by: 01, 02, 03
Spec: `.scratch/table-grouping/spec.md` (Q5, Q14–Q17, "How it looks" 1–8, Q9) · ADR-0029 · `prototype/final.html`

## Scope

- Header band and span as in the prototype's F2, from `Table.module.css` tokens:
  one row high, one 20 px fold slot per level, lines by rank, the share bar,
  condensed ranges, a folded span as one line.
- The innermost grouped column moves to the front; outer grouped columns hide.
- No `rowspan`: the span is a cell per row; its value sticks within its group,
  and repeats, marked continued, at the top of a page or window.
- Sticky header bands stacked per level under `stickyHeader`; virtualised lines
  of the row height.
- Group of one row: no fold, no count.

## Acceptance

- Rendering tests for the prototype's case, a group of one, a folded span and a
  folded header, a page that begins inside a group, a virtual window inside a
  group.
- Screenshot of the demo case matches `prototype/f2-open.png` in its relations
  (checked by eye in this ticket; baselines in 07).
