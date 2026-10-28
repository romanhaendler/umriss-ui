# 22: A recipe for undo and redo over onCellEdit

**What to build:** A developer finds in the table docs how to undo a wrong edit in about twenty lines: the application keeps a history of the edits `onCellEdit` reports and applies the inverse on Ctrl+Z, the edit again on Ctrl+Shift+Z. The table stays as it is (ADR-0032: it reports, the application applies). A demo example shows it working on an editable grid. Spec: `../spec.md` ("Table: undo recipe"); wish: `../personas/p22-tobias.md` (undo: "Instead holds").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A recipe section in the table README and `llms-full.md`, its code type-checked like the other examples
- [ ] A demo example: edit a cell, Ctrl+Z restores it, Ctrl+Shift+Z redoes it; the demo's smoke test covers the new example
- [ ] No change to the table's API
- [ ] Commit body: `Changelog table Added:` line (docs)
