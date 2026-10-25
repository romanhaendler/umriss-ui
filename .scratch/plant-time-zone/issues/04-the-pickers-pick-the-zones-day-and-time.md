# 04 - The pickers pick the zone's day and time

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-a-table-shows-the-plants-time.md`, `.scratch/root-contract/issues/03-core-the-pickers-are-fields-and-the-name-is-aria-label.md`, `.scratch/date-jump-and-typed-entry/issues/03-a-date-typed-in-the-panel.md`, `.scratch/date-jump-and-typed-entry/issues/04-the-time-fields-under-a-finger.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

A planner in Chicago picks 17 March in a DatePicker under a named Europe/Berlin. The application receives
the instant of midnight in Berlin on 17 March, and the panel says "CET (Germany)". The ticket waits for the
root-contract ticket and the date-jump tickets because they rework the same pickers: the root, the
calendar's head, the typed date and the time fields.

- **The value seam.**
  - DatePicker and DateRangePicker: a value coming in is turned into the zone's calendar day for the grid,
    and a picked day goes out as the zone's midnight.
  - DateTimePicker and DateTimeRangePicker: the wall-clock fields are resolved in the zone, through 02's
    resolver.
  - The grid itself keeps working on calendar-day Dates.
  - The typed date of `.scratch/date-jump-and-typed-entry/` 03 goes out the same way.
- **The doubled and missing hour** are resolved and reported in the zone. That includes the choice of the
  earlier or later occurrence, and the reopening of a value in the later one.
- **The zone's today.** "Today", "Now", every preset and the calendar's marked today are the zone's.
- **The label.** `useTimeZoneLabel()` stands in the panel's foot, and in the trigger's accessible
  description.
- **The DEV warning.** A DatePicker or DateRangePicker value that is not on the zone's midnight warns once
  per picker. The warning names the zone, and says that a day is the instant of the zone's midnight. Without
  a named zone the check is the reader's midnight, as the contract already states.
- **The docs.** The value lines of the four pickers say "on midnight in the formats' zone (the reader's,
  unless the application names one)". `API.md` follows.
- **The table's date editor** (`edit: "date"`) and the date filter's DateRangePicker follow with no change
  of their own; a test proves it.

## Acceptance criteria

- [ ] Under a named Europe/Berlin and the test's stubbed reader in America/Chicago, a click on 17 March
      calls `onChange` with 2026-03-16T23:00Z, and a value of that instant opens on 17 March.
- [ ] Under a named America/New_York, 02:30 on 8 March 2026 is reported missing, and 01:30 on 1 November
      2026 offers the earlier and later occurrence with their offsets. Reopening the later one keeps it.
- [ ] "Last 7 days" ends on the zone's today. The marked today is the zone's around the reader's
      midnight; a fake clock at 23:30 reader time proves it.
- [ ] A value at the reader's midnight under a zone seven hours off warns once in DEV, and not in a
      production build.
- [ ] With the zone named "Europe/Berlin", the workspace's zone, every existing picker test passes
      unchanged.
- [ ] `pnpm check core`, `pnpm check table` and `pnpm check:site` pass, and `pnpm test:visual:quick core`
      passes.
- [ ] The changelog notes the pickers in the zone and the DEV warning.
