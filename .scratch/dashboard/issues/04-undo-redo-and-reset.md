# 04: Undo, redo and reset

**What to build:** In the editing mode a reader can take back any single step and do it again, and can return to the arrangement the application gives their role - and take that back too. A mistake after ten good moves costs one move. See `spec.md` (The editing mode).

**Blocked by:** 03

**Status:** done

- [ ] The draft is a history of whole arrangements: every action is a step; "Undo" and "Redo" move through it; a new step forgets the steps ahead.
- [ ] The bar shows "Undo", "Redo" and "Reset" as permanent buttons in the mode (not in a passing message), disabled where there is nothing to undo, redo or reset.
- [ ] "Reset" is one step to the default view; it asks no question, because "Undo" brings the reader's arrangement back. It is disabled while the draft equals the default.
- [ ] "Cancel" still restores the arrangement from before "Edit", whatever was undone or redone; "Done" reports the current step.
- [ ] Undo, redo and reset are announced.
- [ ] The hook hands out undo, redo and reset as well.
- [ ] Wording in English and German.
- [ ] Tests through the hook in jsdom: undo and redo across moves, sizes and removals; a new step after undo; reset and its undo; "Done" after undo reports the undone state; "Cancel" after several undos.
