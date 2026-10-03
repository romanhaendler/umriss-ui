# 05: Every library type in a type cell is a link, and "Types on this page" defines the rest

Status: ready-for-agent
Blocked by: 01 (One table model, two writers), 02 (Rows that are true: no `never`, no free type parameters, constraints in the header)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** The reader records each type reference in a type cell whose declaration lies in this package or another workspace package; the cell renders as text segments, some of them links. A link goes to the type's props table (same page as an in-page anchor, otherwise to that page's address), otherwise to its definition in a new block **Types on this page** at the end of the API section. The block holds the closure of mentioned table-less types, in order of first appearance, stopping at types with a table; each entry has its name with parameters and constraints, its JSDoc, and a members table or its emitted declaration with library names linked; a type from another package names its package. Until the API index exists, the llms appendix prints every export that has neither a props table nor a definition block.

- [ ] On a chart series page `Accessor<T>` links to its definition on the same page; on the table's Search page `TableRef` does, and inside it `TableSnapshot` is a link too.
- [ ] llms fixture tests: a table-less type mentioned on a page gets a definition; the closure includes a type mentioned only inside a definition and stops at a type with a table; a type with a table on another page is a link, not a definition.
- [ ] Built-site guard: every `#type-` link resolves to an element with that id on its target page, and every library type referenced in a type cell has a target.
- [ ] Zero props name a library type with neither a table nor a reachable definition.
- [ ] The definitions and links are in the prerendered HTML and in the llms text.
- [ ] `ButtonSize`, `Accessor`, `TableRef`, `Wording`, `Intent` are defined in the llms text; `applyIntent`, `useTree`, `useToast`, `controlLimits` stand in the appendix with their declarations.
