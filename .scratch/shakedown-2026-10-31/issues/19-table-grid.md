# 19: Table grid - keyboard and editing keep focus and input

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8 (Cmd+Arrow). Sources: README 10, 27, 36 (group header row), 38 (caret,
Space, Cmd+Arrow); P10/11 12, 13; earlier-runs-open audit-family 2, audit-family 6 (`aria-colcount`).
Reds: H7 `f08`, `gridkeys.spec.ts`; P10/11 `repro-virtual-grid-focus.mjs`, `t22.mjs`.
All reds named here are in `../reds/` (`../reds/README.md`).

- [ ] Ctrl+Home from deep in a virtual grid scrolls to the top and focuses the header cell, with or without `stickyHeader`.
- [ ] The focused row stays rendered when the virtual window moves (scroll, live re-sort), or focus moves to the row now at its place - never to `<body>`.
- [ ] A row removed by a live update while a cell of it is being edited: the draft is reported or kept visibly, focus moves to the neighbouring cell.
- [ ] The column-group header row is reachable by ArrowUp; its filler cells are not empty gridcells.
- [ ] Space on a header cell sorts (or does nothing) - it never scrolls the area.
- [ ] On macOS, Cmd+Arrow and Cmd+Home/End move to the grid's edges like Ctrl+Home/End.
- [ ] A click that opens an editor selects the value, so typing replaces it (49 + "0" is not 490).
- [ ] A new-row draft has an `aria-rowindex`; a tree row's rowheader name does not contain the expander's label; the grid has `aria-colcount`.
- [ ] Unit tests where jsdom can tell; `@quick` browser cases for the virtual ones; `pnpm check table`.

## Comments
