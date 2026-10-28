# 01: A virtual window holds rows when the list shrinks

**What to build:** A virtual list that the user scrolled deep keeps showing rows when its count shrinks - a search, a filter or a live feed. Today a 100k-row virtual table scrolled to the end and searched for "Item 99" shows no row, and the scroll height stays near the old one. The window function clamps its first visible row to the last full window of the current count, and the virtual hook re-reads the scroll position when the count changes. One fix in core serves the table, TreeView, MultiSelect and every listbox. Spec: `../spec.md` ("Virtual window"); repro: `../personas/p22-tobias.md` finding 1.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The pure window function returns the last rows, and a leading filler no taller than the list, for a scroll position past the end of the count (unit test, red first)
- [ ] A browser test: a virtual table scrolled to the end, then searched down to about 1,000 rows, shows rows and a scroll height that matches the shrunken list
- [ ] TreeView, MultiSelect and the listbox show rows after the same shrink (one test each, or one shared test of the hook)
- [ ] Nothing changes for a list that does not shrink (existing tests green)
- [ ] Commit body: `Changelog core Fixed:` and `Changelog table Fixed:` lines
