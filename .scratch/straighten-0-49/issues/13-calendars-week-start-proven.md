# 13: Every calendar is proven to follow weekStart, and the docs show a third language

**What to build:** `weekStart` is tested for DateRangePicker and DateTimePicker as for DatePicker (weekday heads, grid, Home/End), and core's Language page gains an example that sets `formatsFor("fr-CH")` with a Sunday-first week, so an evaluator sees both. Spec: `../spec.md` (User stories 29-30).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Component tests for DateRangePicker and DateTimePicker under `weekStart: 7`
- [ ] The new example passes the demo's page rules; screenshot reviewed
- [ ] A defect found is fixed with a `Changelog core Fixed:` line
