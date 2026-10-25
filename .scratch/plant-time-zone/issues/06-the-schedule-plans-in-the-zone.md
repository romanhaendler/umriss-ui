# 06 - The schedule plans in the zone

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-a-table-shows-the-plants-time.md`, `05-a-chart-in-a-named-time-zone.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

A planner in Chicago opens the plant's schedule under a named Europe/Berlin. The fine band reads Berlin's
hours, and the day band and "today" are Berlin's days. A bar dragged onto a shift raster of eight hours
offset by six snaps to 06:00, 14:00 and 22:00 Berlin time. The axis names the zone once. On the day winter
time begins, the band reads "02:00 GMT+2 02:30 GMT+2 02:00 GMT+1 02:30 GMT+1", no longer an unexplained
repeat.

- **The zone.** The schedule reads `useFormats().timeZone` and passes it to charts' helpers (05) and to
  core's seam (02). The application passes nothing.
- **The bands.**
  - The fine band follows the tick rule (spec), so a two-hour step stays on even hours after a change.
  - The day band holds the zone's days.
  - Every label in the doubled hour carries its offset.
- **Snapping.** `snapTime(time, raster, timeZone?)` takes the zone as an optional last argument. The
  schedule passes it for every drag and key move, so the raster's hours are the zone's on both sides of a
  change. Its doc line says "in the zone's time, the reader's unless one is named".
- **Today and the now line.** "Today" is the zone's. The now line is an instant and does not move.
- **The texts.** The tooltip, the ghost's times and the summary follow core's formats. Where an instant lies
  in the doubled hour, the tooltip carries its offset.
- **The label.** `useTimeZoneLabel()` stands once at the head of the time axis, above the lane headers,
  and in the schedule's accessible description.
- **README.** The schedule's README says that the schedule follows core's zone, and names the raster's and
  the label's behaviour.

## Acceptance criteria

- [ ] The time-axis test pins, under a named America/New_York, the fine band over 1 November 2026: half-hour
      ticks through the doubled hour with their offsets, and a two-hour step on even hours on both sides.
      The day band starts on New York's midnights.
- [ ] The snap test pins a raster of 8 h offset by 6 h under a named Europe/Berlin to 06:00, 14:00 and 22:00
      Berlin time, across 25 October 2026.
- [ ] Naming "Europe/Berlin", the workspace's zone, keeps every existing schedule test green. The only
      exception is the doubled hour's labels, which a test pins with their offsets.
- [ ] A jsdom test shows the label for a named zone that is not the stubbed reader's, and none otherwise.
- [ ] `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule` pass, and the
      schedule's `API.md` is regenerated.
- [ ] The changelog notes the zone, `snapTime`'s argument, and the labels in the doubled hour.
