# 20: Table columns share the free width, and "Fit all columns" sizes them to content

**What to build:** A developer gives a column `flex` (a share of the width left after the fixed columns) with an optional `minWidth`, so the table fills its frame. A hand resize stores a pixel width in the view and ends the flex for that column, so flex never fights the user's drag. The column menu gains "Fit all columns", and the hook returns `autoSizeColumns()`; both use the measurement the resize grip's double-click already uses. The menu entry's label comes from core's English and German wording. Spec: `../spec.md` ("Table: widths"); wish: `../personas/p22-tobias.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A browser test: two `flex: 1` columns beside a fixed one split the remaining width equally and keep `minWidth` when the frame narrows
- [ ] A browser test: dragging a flex column's grip fixes its width; the view stores it; a reload restores it
- [ ] A browser test: "Fit all columns" and `autoSizeColumns()` set every column to its content's width
- [ ] Works with pinned columns, a virtual table and the sticky header
- [ ] README, `llms-full.md`, API.md and a demo example
- [ ] Commit body: `Changelog table Added:`, `Changelog core Added:` (wording) lines
