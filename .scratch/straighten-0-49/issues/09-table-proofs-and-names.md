# 09: The table's 0.49.0 features are proven where they were only read

**What to build:** What 0.49.0 covered by code reading gets a test: the text filter popover operated by keyboard (focus moves in, Tab, arrows, Enter), a cell under a column group announced with its group ("Q1, Jan") in an accessibility-tree snapshot, the XLSX header cells of a grouped export read from the produced workbook as "Q1 · Jan", and a virtual table with column groups in the browser (both head rows, row numbering, the sticky head). The filter module's internal names say what they hold. Spec: `../spec.md` (Testing Decisions; "Text filter names").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Browser: text filter keyboard; virtual table with groups
- [ ] ARIA snapshot: a body cell's column header includes its group
- [ ] Unit: XLSX group headers from the workbook
- [ ] Renames only in the filter module, no behaviour change (existing tests green)
- [ ] A test that finds a real defect fixes it, with a `Changelog table Fixed:` line
