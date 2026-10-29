# 08: A search or condition that narrows a virtual table starts at its top

**What to build:** A user who scrolled deep and searches sees the first matches: a change of the search or of a column condition scrolls a virtual table's scroll area back to the top. A row set that shrinks for any other reason (a live feed) keeps the clamped position of 0.49.0. Spec: `../spec.md` ("Scroll after narrowing").

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A browser test: the 20,000-row example scrolled to the end, then searched, shows its first matching row at the top
- [ ] A browser test or the existing one: a list shrinking without a search keeps rows in view (0.49.0 behaviour)
- [ ] Commit body `Changelog table Changed:` with `Migration:` (nothing to change; a narrowed table opens at its top)
