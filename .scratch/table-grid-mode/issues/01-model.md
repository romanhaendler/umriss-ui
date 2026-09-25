# 01 - The grid walk as a pure module

Status: done
Type: task

Spec: `.scratch/table-grid-mode/spec.md`

## Scope

G1's movement over the table's lines (rows, group headers, spans, detail rows) and visible columns.

## Acceptance

- Unit tests with literals, incl. groups and hidden columns.

## Comments

**Done (2026-09-25).** `src/model/gridWalk.ts`: the head row's layout
(`GridLayout`), the cells of every line shape (`lineCells` - a cell per column,
one over all for a detail or the empty body, a group header's label over its
leading run, a folded span's count), `gridLines` over rows or grouped lines
with open details and the footer, `stepGrid` per key (the column kept through
a spanning line, as a caret keeps its goal), `nextCell` in reading order (Tab
in an editor), `placeOf` (where the Active cell stands once its row or column
is gone).

- `groupLineLayout` is the arithmetic `GroupLine` rendered with; it moved into
  the module and `GroupLine` calls it, so the walk and the render cannot drift.
- `tests-unit/gridWalk.test.ts`, 22 tests with literals: flat, grouped (header,
  folded span), start and end blocks, a hidden column, a column followed into
  its pinned block, a sorted and a filtered-away row.
