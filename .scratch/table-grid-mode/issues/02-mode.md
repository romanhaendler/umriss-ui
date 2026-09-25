# 02 - Grid mode

Status: done
Type: task
Blocked by: 01

Spec: `.scratch/table-grid-mode/spec.md`

## Scope

G1, G2, G6; ADR and glossary (G7).

## Acceptance

- Interaction tests of every key; axe clean with role grid/treegrid; own-base focus check.

## Comments

**Done (2026-09-25).** `<Table grid>`: `role="grid"` (`treegrid`
grouped, as before), one tab stop, the Active cell as state (line key + column
id, `src/grid.tsx`). Tab stops are written onto the DOM after every render
(`GridFocus`) instead of being threaded through every cell; a cell's own
controls are quieted (`tabindex=-1`, the old value kept in
`data-grid-tabindex`) and given back for widget mode (Enter/F2 in, Escape/F2
out). A key to a line a virtual window has not rendered calls `showRow` and
focuses the cell once it stands. ADR-0034, glossary **Active cell**.

- The ring: `box-shadow: inset var(--u-focus-ring)` on `.grid td/th:focus-visible`
  - the shared token drawn inside, since the scroll area cuts an outer ring
  away. Core's canon check now accepts `inset var(--u-focus-ring)` (with a test
  line each way). Two pinned-group-header rules gained `.td:not(:focus-visible)`
  so they do not take the ring off (the own-base check found it).
- Tests: `gridMode.test.tsx` (12: every key, one stop, widget mode, a detail,
  a sort, a hidden column, treegrid, a virtual window) and
  `tests-visual/features-grid.spec.ts` (6, in the browser). axe on the Table
  page with the grid examples is clean; own-base green.
- Without `grid`: no role, no `data-grid-line`, no tabindex on cells (tested);
  every existing baseline holds except `table--demonstration` (see 04).
- Not done: Space on a cell does nothing (it scrolls the page, as before); a
  focused cell under a sticky head or a pinned block is scrolled by the
  browser's own `focus()`, which does not know the sticky parts.
