# 07: The charts' defaults move from prose into `@default`

Status: ready-for-agent
Blocked by: 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** Every charts prop whose description states its default gets a `@default` tag, and the sentence that only stated it leaves the description; a description left empty is rewritten into a real sentence. The Default column of the charts fills from 1 of 158 upwards.

- [ ] No charts description repeats a default that its `@default` states.
- [ ] Every charts prop whose description stated a default has a Default entry (e.g. `Chart`'s `height` shows `300`).
- [ ] The JSDoc gate passes (no description left empty).
- [ ] No destructuring default conflicts with a tag (the generator runs through).
