# 02: A union shows its members

**What to build:** in the "Types" index of `API.md`, a type alias that is a union prints its members after
its sentence: literals as written, named types by name, an inline object member by its field names; never
cut. A reader can write `route: "orthogonal"` from the file alone. See the spec's "Unions"; findings in
`.scratch/release-1-0/research/07-the-surface-of-the-schedule.md` (the head, point 3).

**Blocked by:** 01

**Status:** ready-for-agent

**Size:** S (same agent as 01, continued)

- [ ] Fixture: a literal union, a union of named types, a union with an inline object member
- [ ] The schedule's `API.md` shows the values of `SubtaskAppearance`, `DependencyRoute`,
      `DependencyAttachment`, `DependencyEnds` and the kinds of `ScheduleHit`
- [ ] The seven `API.md` are regenerated; `pnpm check demo` and `pnpm check:site` are green
