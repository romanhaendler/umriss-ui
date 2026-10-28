# 21: The table groups columns under a two-level header

**What to build:** A report shows "Q1" over "Jan | Feb | Mar". A `ColumnGroup` part with a `label` wraps `Column`s; the head gets a second row of group cells that span the visible columns of their group and are announced as column-group headers, so a screen reader hears "Q1, Jan". Columns keep hiding, resizing, flex widths and pinning per column; a column cannot leave its group by reordering; a group split by pinning shows its label over each part. The view and the column menu list columns under their group. Exports (CSV, XLSX, `asCsv`) keep one header row and write "<group> · <column>". Spec: `../spec.md` ("Table: column groups"); wish: `../personas/p22-tobias.md`.

**Blocked by:** 20 (header cells, widths and the column menu)

**Status:** ready-for-agent

- [ ] A component test: the head has two rows; a group cell spans its visible columns and carries the column-group scope; hiding a column narrows the span; a group with no visible column disappears
- [ ] A component test: reordering in the column menu keeps a column inside its group
- [ ] A browser test: pinning one column of a group shows the group label over the pinned part and over the rest; the sticky head holds both rows
- [ ] An export test: CSV and XLSX headers read "Q1 · Jan"
- [ ] An ARIA snapshot: a cell's column header includes its group
- [ ] Grid-mode keyboard navigation is unchanged on the data cells
- [ ] README, `llms-full.md`, API.md and a demo example
- [ ] Commit body: `Changelog table Added:` line
