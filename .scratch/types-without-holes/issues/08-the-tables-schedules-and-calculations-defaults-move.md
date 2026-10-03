# 08: The table's, schedule's and calculation's defaults move from prose into `@default`

Status: ready-for-agent
Blocked by: 03 (`@deprecated` and `@default` are read)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** The same migration as ticket 07 for table (2 of 150 today), schedule (0 of 94) and calculation (0 of 54), and for any core prop whose default is written only in prose.

- [ ] No description in these packages repeats a default that its `@default` states.
- [ ] Across all five packages the Default column is filled for at least 90 % of the props that stated a default in prose on `main` @ 3b2fa14.
- [ ] The JSDoc gate passes.
- [ ] No destructuring default conflicts with a tag.
