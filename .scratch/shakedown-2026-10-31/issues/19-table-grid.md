# 19: Table grid - keyboard and editing keep focus and input

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8 (Cmd+Arrow). Sources: README 10, 27, 36 (group header row), 38 (caret,
Space, Cmd+Arrow); P10/11 12, 13; earlier-runs-open audit-family 2, audit-family 6 (`aria-colcount`).
Reds: H7 `f08`, `gridkeys.spec.ts`; P10/11 `repro-virtual-grid-focus.mjs`, `t22.mjs`.
All reds named here are in `../reds/` (`../reds/README.md`).

- [x] Ctrl+Home from deep in a virtual grid scrolls to the top and focuses the header cell, with or without `stickyHeader`.
- [x] The focused row stays rendered when the virtual window moves (scroll, live re-sort), or focus moves to the row now at its place - never to `<body>`.
- [x] A row removed by a live update while a cell of it is being edited: the draft is reported or kept visibly, focus moves to the neighbouring cell.
- [x] The column-group header row is reachable by ArrowUp; its filler cells are not empty gridcells.
- [x] Space on a header cell sorts (or does nothing) - it never scrolls the area.
- [x] On macOS, Cmd+Arrow and Cmd+Home/End move to the grid's edges like Ctrl+Home/End.
- [x] A click that opens an editor selects the value, so typing replaces it (49 + "0" is not 490).
- [x] A new-row draft has an `aria-rowindex`; a tree row's rowheader name does not contain the expander's label; the grid has `aria-colcount`.
- [x] Unit tests where jsdom can tell; `@quick` browser cases for the virtual ones; `pnpm check table`.

## Comments

**Delivered (2026-10-31, run coordinator).** Ctrl+Home in a virtual grid scrolls to the top and focuses
the head; a focused cell that leaves (scroll, re-sort, removal) hands focus to the cell at its place; an
edit whose row goes is settled - a valid draft reported, focus to the neighbour; the column-group row is
reachable by arrows, its blanks skipped; Space on a header neither sorts nor scrolls; Cmd+Arrow; a
click-opened editor selects its value; `aria-colcount`, a draft's `aria-rowindex`, a tree rowheader named
by its row. Decided: an invalid draft on a removed row is dropped (no editor left to say why); Cmd keys
are not platform-gated (like Ctrl+A). Left: no Playwright case; virtual focus loss checked in jsdom only.

Review fix pass: the browser cases now exist - `table/tests-visual/virtual-grid-focus.spec.ts` (Ctrl+Home to the head; a focused row scrolled out hands the focus on).
