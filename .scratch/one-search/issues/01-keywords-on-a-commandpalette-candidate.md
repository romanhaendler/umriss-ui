# 01: Keywords on a CommandPalette candidate

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/one-search/spec.md`

**What to build:** A library user can give a `CommandPaletteItem` an optional list of `keywords`.

**How keywords are searched:**
- Only when neither the name nor the group matched, and only for queries of three characters or more.
- As a contiguous, case-insensitive substring.
- A keyword find ranks behind every name and group find and carries no marked characters.

**Without keywords** the palette behaves exactly as before.

The CommandPalette page gets an example with synonyms of a command, and core's changelog records a minor addition.

- [x] A keyword find ranks behind every name find and every group find (searcher unit test).
- [x] Queries under three characters do not search keywords. A keyword matches as a substring, never as a subsequence.
- [x] A keyword find renders with no marks.
- [x] The existing searcher and palette tests stay unchanged and green.
- [x] The CommandPalette page shows a keywords example, its props table lists `keywords` with a description, and the changelog has the entry.

## Comments

**Delivered.** `CommandPaletteItem.keywords` (`readonly string[]`, optional,
with JSDoc) goes to the searcher as the `Candidate`'s `keywords`. `find` in
`lib/search.ts` gives every find a tier (name, group, keyword) and sorts by
tier, then rank. A keyword find is a case-insensitive `includes` on a trimmed
query of three characters or more, ranked by the caller's weight alone, with
empty spans. The name and group tiers are untouched.

**Tests.** `tests-unit/search.test.ts`, "find – the keywords count last" (7
tests): found through a keyword, case and the middle of a word, every name
and group find above a keyword find even at weight 100, weight orders
within the tier, nothing below three characters, `snbr` does not find
"snackbar", no spans. `tests-unit/commandPalette.test.tsx`, "finds through a
keyword, last and without a mark". The existing tests are unchanged and
green.

**Page.** `demo/examples/CommandPalette/04-synonyms.tsx`, "Find a command by
its synonyms". The props table picks up `keywords` from the JSDoc. Core's
CHANGELOG has `## Unreleased / ### Added`.

**Baselines.** Two new ones,
`example-commandpalette--synonyms-ui-{light,dark}`. Two moved,
`palette-resting-ui-{light,dark}`: that picture covers the whole viewport,
and the new example now stands on the CommandPalette page behind the window.
The old picture was already stale (header "0.16.0", Forms 16, a wider input
in example 3). The page head did not change.

**Deviation.** The button reads "Find a command", not "Open the palette".
The resting-state screenshot test finds example 1's button by that name, and
a second button with the same name breaks its locator.
