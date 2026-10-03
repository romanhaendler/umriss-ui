# 01: The API index of calculation, end to end

Status: ready-for-agent
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest)
Spec: `.scratch/api-index/spec.md`

**What to build:** A reader opens `/calculation/api/`, the last entry of the sidebar, alone in a final rubric "API index", and finds every export of the package's entry with its signature. The outline gains a kind of page whose body is generated; the shell renders it with the page head and without the import line. Entries are grouped Components, Hooks, Functions, Constants, Types (by what the export is), alphabetical within a group. A component links to its page with the page's lede, or shows its declaration when it has no page; a hook, function or constant shows its JSDoc (with `@param`/`@returns` as a short list) and its emitted declaration with library type names linked; a type links to its props table or shows its definition with the writer of the definition block; every entry lists "Used on" pages; deprecated exports carry the badge. Values are anchored at `#<name>`, types at `#type-<Name>`. The page is prerendered, in the sitemap, and in `llms-full`. ADR-0044 is written.

- [ ] `/calculation/api/` exists, prerendered, in the sitemap, with title, description, canonical and `h1`, last in the sidebar.
- [ ] llms fixture tests: a hook, function, constant and type land in the right groups and order; a type with a table is a link; a type without one is a definition; a component without a page shows its declaration; "Used on" names exactly the pages that mention the export in code.
- [ ] Built-site guard: every name of calculation's entry has an element with its anchor on the index.
- [ ] Shell suite: the sidebar's last entry is "API index" and opens the page.
- [ ] ADR-0044 "Every export has a place on the site" is in the ADR directory and its index.
