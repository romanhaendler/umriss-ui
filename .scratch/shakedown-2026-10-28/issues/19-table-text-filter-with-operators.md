# 19: The table offers a text filter with operators

**What to build:** A user filters a text column by "contains foo" in one click. A fourth column filter kind `"text"` stands beside `"list"`, `"range"` and `columnFilter`: operators contains, does not contain, starts with, ends with, equals, is empty; up to two conditions joined by AND or OR; matching case-insensitive through the formats' text comparison. The condition is JSON-safe in the view, shows as a chip, and appears in a server-mode request under the column's id with its operators and values, in a documented shape. The operator names and the AND/OR join come from core's English and German wording. Spec: `../spec.md` ("Table: text filter"); wish: `../personas/p22-tobias.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Component tests: each operator, AND and OR of two conditions, case-insensitive matching, "is empty"
- [ ] The view round trip (serialise, reload) restores the condition; the chip names it and removes it
- [ ] A server-mode test: the request carries the condition in the documented shape and the table applies nothing itself
- [ ] Keyboard: the filter popover is reachable and operable with Tab, arrows and Enter; focus moves into it on open
- [ ] README, `llms-full.md`, API.md and a demo example
- [ ] Commit body: `Changelog table Added:`, `Changelog core Added:` (wording) lines
