# 05: Table: a view applies by content, and is reported in every mode

**What to build:** A table takes a view handed in whenever it differs in content from the last one - not only on the first render - and reports every change of its view through `onViewChange`, in every mode. Two tables, or a table and a stored view, stay in step without a remount. The 'View' page shows it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Model test: a view applies once per content change; the same again changes nothing; unknown columns fall out
- [ ] `onViewChange` fires once per change with the whole view
- [ ] The 'View' example keeps working without a `key`
