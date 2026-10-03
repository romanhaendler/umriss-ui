# 04: The gate catches defaults in prose and unexported types

Status: ready-for-agent
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest), `types-without-holes` 06 (Every type a table names can be imported), `types-without-holes` 07 (The charts' defaults move from prose into `@default`), `types-without-holes` 08 (The table's, schedule's and calculation's defaults move from prose into `@default`)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** Two more error classes in the generator, each reporting every offender with file, line, type and prop, no exception list: *default in prose* (the description contains the word "default" and the row has no default from `@default` or destructuring) and *unexported type* (a library type in a type cell, definition block or table header is not exported from the entry or a subpath).

- [ ] Gate tests: one fixture per class fails with file and line; the corrected fixtures pass.
- [ ] The workspace passes both new classes.
- [ ] A phrase `@default` (including "no default") satisfies the first class.
