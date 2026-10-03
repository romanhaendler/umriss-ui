# 01: Keywords on a CommandPalette candidate

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/one-search/spec.md`

**What to build:** A library user can give a `CommandPaletteItem` an optional list of `keywords`.

**How keywords are searched:**
- Only when neither the name nor the group matched, and only for queries of three characters or more.
- As a contiguous, case-insensitive substring.
- A keyword find ranks behind every name and group find and carries no marked characters.

**Without keywords** the palette behaves exactly as before.

The CommandPalette page gets an example with synonyms of a command, and core's changelog records a minor addition.

- [ ] A keyword find ranks behind every name find and every group find (searcher unit test).
- [ ] Queries under three characters do not search keywords. A keyword matches as a substring, never as a subsequence.
- [ ] A keyword find renders with no marks.
- [ ] The existing searcher and palette tests stay unchanged and green.
- [ ] The CommandPalette page shows a keywords example, its props table lists `keywords` with a description, and the changelog has the entry.
