# 05 - A chart in a named time zone

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-an-application-names-its-time-zone.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

`<Chart timeZone="Europe/Berlin">` draws a trend in Berlin time for a reader anywhere. Its ticks stand on
Berlin's hours, its labels, tooltip, readout, data table and summary say Berlin time, and its axis title
names the zone where the reader's zone is another. Charts import nothing, so this ticket runs beside the
core work.

- **The prop.** `ChartProps.timeZone?: string`, an IANA name, for every time axis of the chart, a calendar
  axis included. An unknown zone throws Intl's `RangeError`. The doc line says that an application on core
  passes `useFormats().timeZone`.
- **The arithmetic.** Charts get their own zone fields and offset, the same as core's seam (02), with the
  Date's local methods as the path for no zone and an offset cache per quarter hour.
  `localOffset(instant, timeZone?)` and the working-time ticks take the zone as an optional last argument.
  No existing call changes meaning.
- **The tick rule** (spec, "The tick rule across a clock change"), for the reader's zone and a named one
  alike:
  - steps of a day or longer from the zone's calendar fields;
  - steps below a day on the zone's whole multiples in real time, on both sides of a change;
  - no tick in the missing hour;
  - every tick label in the doubled hour carries its offset.

  The same rule applies to the working-time ticks, whose grid today takes one offset at its start.
- **The texts.** The tick labels, the tooltip's x, the readout, the data table's position column and the
  summary's range are written with Intl's `timeZone`, in `wording.locale`. Where the instant lies in the
  doubled hour, the tooltip and the readout carry its offset. That includes the range readout, where
  `.scratch/chart-range-selection-and-navigator/` has built it.
- **The label.**
  - The zone's generic name, Intl's `shortGeneric` in `wording.locale`, stands after the time axis's own
    title, or alone where the axis has none.
  - It shows only after mount, and only where the reader's zone, canonicalised through Intl, differs by
    name from the named zone.
  - It is part of the title, so the Picture (`.scratch/chart-picture-and-print/`) paints it with no change
    of its own.
- **README and demo.** Charts' README gets a "Time zone" section that stands on its own, for a charts-only
  app: the prop, the label, the tick rule and a pointer to core's formats. A charts demo example shows a
  trend across 25 October 2026 in Europe/Berlin and in UTC.

## Acceptance criteria

- [ ] The time ticks test pins, for a named America/New_York, an hourly axis over 1 November 2026: the ticks
      "00:00 01:00 GMT-4 01:00 GMT-5 02:00", one hour apart in real time. Over 8 March it pins no 02:00
      tick. A two-hour axis stays on even hours after the change, and a week's day ticks stand on New
      York's midnights.
- [ ] Naming "Europe/Berlin", the workspace's zone, gives today's ticks and labels on every day but the
      doubled hour's. There it gives the new offsets, and a test pins that.
- [ ] The working-time test pins the same rule for a calendar axis across a clock change.
- [ ] A jsdom test shows the axis title with the label for a named zone that is not the stubbed reader's,
      and without it for the reader's own zone and for no zone.
- [ ] The tooltip and the readout of an instant in the doubled hour carry its offset.
- [ ] `pnpm check charts`, `pnpm check:site` and `pnpm test:visual:quick charts` pass, and charts'
      `API.md` is regenerated.
- [ ] The changelog notes `timeZone`, the optional argument of `localOffset` and the working-time ticks,
      and the new tick rule in the doubled hour.
