# 01 — The grouping pipeline: a pure module, test-first

Status: done
Type: task

Blocked by: none
Spec: `.scratch/table-grouping/spec.md` ("Where it lives", Q2, Q4, Q9, Q10, Q11) · ADR-0029

## Scope

- A pure module in `table/src/model/` from the filtered, sorted rows and a
  grouping (up to three keys, each a value function and an optional group-key
  function) to a group tree: path of values, level, rows, count, and the
  aggregates per column.
- Absent grouping values form one group per level that stands last in either
  direction; the date keys `day`, `week`, `month`, `year` (ISO week).
- Every built-in aggregate — `sum`, `avg`, `min`, `max`, `range`, `count`,
  `distinct` — and a caller's `(values, rows) => W`, always over the rows of
  the group, never over child aggregates. Absent values count towards nothing.
- Group order: by grouping value by default; by an aggregate when the first sort
  level is a column with one; reversed when the sort level is the grouped column;
  rows within groups by the remaining sort levels.
- Lines: the flat sequence of header lines, span groups and rows for a set of
  folded paths — the form of each group by its level (innermost = span), a group
  of one row as a plain row, a folded span as one line.
- Paging over lines, with the header lines and span values to repeat at the top
  of a page that begins inside a group (not counted).
- Fold paths that no longer occur fall out.
- Filter → group → sort → page in `tableModel.ts`; selection figures stay on the
  filtered set.

## Acceptance

- Unit tests cover every point above, the average-of-averages trap included,
  and the prototype's case (13 orders, line › customer: 16 lines open,
  3 lines when all folded).
- An ungrouped table produces exactly the lines it produced before.
