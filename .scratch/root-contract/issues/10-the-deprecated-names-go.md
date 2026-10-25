# 10 - The deprecated names go

Status: ready-for-agent
Type: task
Size: S

Blocked by: `03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`,
`04-the-table-is-a-composite.md`, `05-the-chart-is-a-composite.md`, `06-the-schedules-ref-is-its-root.md`,
and the minor that ships them being released
Spec: `.scratch/root-contract/spec.md`

## What to build

The release after the contract removes what the upgrade promise kept for one minor:

- the `ariaLabel` alias on Table, Chart, Schedule, `TreeView`, `Popover` and `ContextMenu`, with its
  development warning;
- the schedule's bridge: the handle functions on the root element, the `ref` type that accepts a handle,
  and the `ScheduleHandle` type.

## Acceptance criteria

- [ ] `ariaLabel` is a type error on all six components, and `ScheduleHandle` is no longer exported.
- [ ] A ref on `Schedule` is typed at `HTMLDivElement` only. The type test now asserts that a handle ref is
      an error.
- [ ] No development warning for the old names is left in the sources.
- [ ] `pnpm check`, `pnpm typecheck` and `pnpm check:site` pass, and `API.md` is regenerated where it
      changed.
- [ ] Each affected changelog has a Changed entry with a migration line for each removal.
