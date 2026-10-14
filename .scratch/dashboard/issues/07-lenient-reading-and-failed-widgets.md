# 07: Lenient reading and failed widgets

**What to build:** An application can release new versions without breaking any reader's kept dashboard: a widget of a type that is gone falls out, a size a type no longer offers falls back to the type's starting size. And a widget whose content fails keeps its frame, says in one sentence that it cannot show anything, and can still be removed - the rest of the dashboard keeps working. See `spec.md` (Lenient reading, The frame).

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] `initialView` and `setView` drop widgets of types the dashboard does not declare, and every widget after the first with an id already seen.
- [ ] A size the widget's type does not offer becomes the type's starting size.
- [ ] Options are passed to the type as they are.
- [ ] The next `onViewChange` reports the arrangement as read, without what was dropped.
- [ ] Each widget's content is wrapped in its own error boundary. A failed widget shows one sentence in its frame; its head, title and, in the mode, its menu stay; it can be moved and removed; the other widgets are unaffected.
- [ ] Wording for the failed widget in English and German.
- [ ] Tests through the hook in jsdom: a kept view with an unknown type, a duplicate id and a retired size; a widget whose content throws, shown failed and then removed in the mode; the report after "Done".
