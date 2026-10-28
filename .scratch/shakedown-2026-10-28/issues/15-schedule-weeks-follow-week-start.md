# 15: The schedule's week bands follow weekStart

**What to build:** A schedule in a Sunday-first locale draws its week bands from Sunday. The schedule's time axis counts weeks from the formats' `weekStart` instead of a fixed Monday. The table's "week" grouping stays ISO (out of scope). Spec: `../spec.md` ("Formats").

**Blocked by:** 14 (`weekStart` in the formats)

**Status:** ready-for-agent

- [ ] A component or unit test: with `weekStart: 7` a week band opens on a Sunday; with the default formats on a Monday
- [ ] The visual suite does not move with the default formats
- [ ] Commit body: `Changelog schedule Added:` line
