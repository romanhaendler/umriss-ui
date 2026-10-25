# 02 - One seam for the days and the clock of a zone

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

The prefactor. Nothing a user sees changes. Today the table and the schedule cut their days with the Date's
local methods, each in its own way. They move onto one seam in core that takes a zone, so that the next
tickets only pass the zone in.

- **Core's zone arithmetic.** Two functions, exported from core's main entry and listed in `API.md`. The
  names are the implementer's, in the style of core's exports.
  - The zone's wall-clock fields of an instant: year, month, day, hours, minutes, seconds and weekday.
  - The instant at which the zone's clock shows given fields. A missing time moves forward, and a doubled
    one takes the earlier occurrence.

  Each takes the zone as `string | undefined`. With `undefined`, they use the Date's local methods,
  exactly as the callers do today. With a zone, they read the fields through Intl's `timeZone`, and the
  offset is cached per quarter hour.
- **The picker's resolver.** The DateTimePicker's resolver of a wall-clock time, which reports a missing and
  a doubled time, is built on the second function and takes the zone. The pickers still pass none.
- **Callers moved onto the seam,** still passing no zone:
  - the table's date grouping (day, ISO week, month, year, and the group's key text);
  - the date filter's day bounds;
  - the aggregate's same-year check;
  - the schedule's day band and its "today".

## Acceptance criteria

- [ ] A unit test pins both functions against the Date's local methods under the workspace's zone,
      Europe/Berlin. With the zone named "Europe/Berlin", every hour of 2026 gives the same fields, both
      clock-change days included, and the same instant back, the missing and the doubled hour included.
- [ ] The same test pins America/New_York on 8 March and 1 November 2026, and Asia/Kolkata at +05:30,
      against hand-written expectations.
- [ ] Grouping 100,000 instants by day with a named zone takes under 100 ms in the unit test's Node.
- [ ] The table's, the schedule's and core's existing tests pass unchanged.
- [ ] No caller in table or schedule cuts a day with `getFullYear`, `getMonth`, `getDate`, `getDay`,
      `setHours` or a three-argument `new Date` any more.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm check schedule` and `pnpm check:site` pass, and core's
      `API.md` is regenerated.
