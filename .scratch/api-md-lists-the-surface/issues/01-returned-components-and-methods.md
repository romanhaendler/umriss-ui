# 01: A hook's components and method members are listed

**What to build:** `API.md` shows the props of every component a hook returns (`Table`, `Column`, `Action`,
`Chart` and its parts, `Schedule` and its parts, `Dashboard`) as a table under that hook, and every member
written as a method (`exportAs`, `TableRef.setFilter`, the bulk action's `onSelect`, `Scale.toPx`, `fromPx`,
`ticks`) wherever members are listed. The writer fails when an exported `*Props` type with members has no
table. See the spec's "Returned components" and "Methods"; findings in
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` A1-A3.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet)

- [ ] A fixture hook that returns a component gets `#### props of <Member> (<PropsType>)` under the hook
- [ ] A fixture method member prints as `name(parameters): result` in a table and in a bracketed list
- [ ] The writer throws for an exported `*Props` type with members and no table (fixture test)
- [ ] `grep` finds `exportAs`, `setFilter` and `toPx` in the regenerated files, and a props table for
      `TableProps`, `ChartProps`, `ScheduleProps`, `DashboardProps`, `LaneProps`, `BarProps`
- [ ] The seven `API.md` are regenerated; `pnpm check demo` and `pnpm check:site` are green
