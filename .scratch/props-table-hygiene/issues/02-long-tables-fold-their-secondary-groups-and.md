# 02: Long tables fold their secondary groups, and a fold never hides a target

Status: ready-for-agent
Blocked by: 01 (Props are grouped and ordered by one rule everywhere)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** A table of more than 15 rows shows each secondary group as a closed native disclosure whose summary names the group and its count ("Events · 12"); at 15 rows or fewer every group is open and plain; Main never folds; the content is in the prerendered HTML either way. When an address's anchor names a row inside a closed group, the shell opens the group before scrolling to the row, on a full load and on an in-app jump.

- [ ] Table-model fixture: a 16-row table folds its secondary groups, a 15-row one does not.
- [ ] Shell suite: an address whose anchor names a row in a closed group opens the group and shows the row in the viewport, on a full load and after an in-app jump.
- [ ] The Markdown writer writes every group as a sub-heading with its rows.
- [ ] The folds are keyboard-operable and pass the shell suite's axe run.
