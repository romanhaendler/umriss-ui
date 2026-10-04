# 08: `useSchedule`

**What to build:** The schedule is declared like the table and the chart: `useSchedule(options)` hands back `Schedule` and its parts. It binds no row type - its subtasks, tasks and lanes are the library's types; what it gains is the place where the view and its setters will stand (`component-view` 07). The ref handle stays. The free `Schedule` goes in the same ticket - the schedule's callers are few enough to move at once.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Every schedule example, scenario and test uses `useSchedule`
- [x] Which parts are returned and which stay free imports is recorded in the ticket
- [x] Every suite green; screenshots unchanged

## Which parts are returned

`useSchedule()` returns `Schedule` and everything declared inside it: `Lane`,
`LaneGroup`, `Subtasks`, `Dependencies`, `BlockedTimes`. None of them is a free
export any more. It reads as the table does -
`const { Schedule, Lane, Subtasks } = useSchedule();` beside
`const { Table, Column } = useTable(rows, ...)` - with one spelling per part,
and the parts are where the view's setters will reach them (`component-view` 07).

Free imports stay what reads or computes over the caller's data and never
stands inside `<Schedule>`: the types (`Subtask`, `Task`, `Dependency`,
`BlockedTime`, the intents, `ScheduleHandle`, the `*Props`) and the pure
functions (`applyIntent`, `findings`, `ripple`, `shiftTask`, `snapTime`,
`subtaskFromPlace`, `resolveAppearance`, ...).

## Comments

Delivered. `useSchedule()` (`packages/schedule/src/useSchedule.ts`) takes no
argument yet - the options come with the view (`component-view` 07) - and
hands back one module-level object, so the parts keep their identity across
renders and calls; a ref on the returned `Schedule` still gives the
`ScheduleHandle`. Tests: `tests-unit/useSchedule.test.tsx` (identity, drawing)
and `tests-unit/types.test-d.tsx` (the free `Schedule` and parts are gone; no
rows argument). Every example, scenario, the readout test, the README and
core's control room moved. The demo's import lines now show `useSchedule`:
the 48 page-head pictures (24 pages, light and dark) changed by that line
alone and were renewed; no example or scenario picture changed.
