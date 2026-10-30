# 06: A page-size change keeps the row the user looks at

Status:     ready-for-agent
Blocked by: 04

Spec: `../spec.md`, user stories 17-25 and 45, decisions "The anchor",
"Settling", "Motion". Use the settle delay and dead zone ticket 01 chose.

**What to build:** whenever the page size changes - the frame grows or
shrinks, the density or pitch changes, the user picks a size, `setPageSize`
- the pages are re-cut so that the anchor row stays on the page: the row with
focus in the table, else the current row if it is on the page, else the top
row. Other grids keep the page number and lose the user's place; this one
keeps the row.

- [ ] The new page is `floor(anchor index / new size) + 1`; the anchor is the focused row, else the current row on the page, else the top row.
- [ ] On page 1 a taller frame adds rows at the bottom and nothing above moves.
- [ ] The focused row stays on the page and keeps focus.
- [ ] `setPageSize` keeps the anchor instead of going back to page one; a search, a filter or a sort still goes back to page one. The docs of `setPageSize` say so; API.md regenerated.
- [ ] A frame resize is applied once the size has settled and crosses a whole pitch, not at every pixel.
- [ ] While focus is in the table's rows a frame resize is not applied; it is applied when focus leaves the rows. A chosen size and a density change apply at once.
- [ ] Rows that stay glide to their new place with the line motion grouping already has, new rows fade in; under reduced motion they change place without movement.
- [ ] A frame resize announces nothing to assistive technology.
- [ ] Dated amendment to ADR-0042: a page-size change keeps the anchor.
- [ ] Unit tests with a faked scroll-area height: the anchor across a resize, a density change and a chosen size, for each of focused, current and top row; no re-cut while focus is in the rows and the re-cut when it leaves; no announcement on resize.
- [ ] `pnpm check table` and `pnpm check:site` pass; a resize looked at in the demo as a user, also with reduced motion.

## Comments
