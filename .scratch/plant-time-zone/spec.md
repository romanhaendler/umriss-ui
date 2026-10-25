# An application names the time zone its instants are shown in

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "A plant time zone" (its Answer holds every decision
below); findings `.scratch/shakedown/charts.md` (a fixed time zone), `schedule.md` 4 and its wish,
`operator-screens.md`, the charts and schedule rows of `wishes.md` section 3; ADR-0024, ADR-0031,
ADR-0060 (superseded here in its time-zone point), ADR-0061; the hydration rule of
`.scratch/server-components/`.

## Problem Statement

An operator screen of a plant in Berlin is read from a head office in Chicago, or a trend must be read in
UTC. umriss shows every instant in the reader's zone, and nothing on the screen says so.

- **The workaround fixes one text and breaks the screen.** A chart's `tickFormat` with Intl's `timeZone`
  writes plant time on the axis labels. The ticks still stand on the reader's hours, and the table beside the
  chart, the schedule, the pickers and the tooltip's own date stay in the reader's zone. The screen then says
  06:00 on the axis and 23:00 in the table for the same moment.
- **A day is the reader's day.** A table grouped by day, a date filter, the schedule's day band and its
  handover raster (06:00, 14:00, 22:00) all cut at the reader's midnight. For a reader seven hours away,
  the night shift falls on the wrong day and the raster snaps to the wrong hours.
- **A picked date is the reader's midnight.** A planner in Chicago who picks 17 March for the plant hands
  the application 06:00 on 17 March in Berlin.
- **Nothing says which zone a time is in.** A reader cannot tell plant time from their own.
- **The clock change is unreadable.** On the day winter time begins, the schedule's axis reads "02:00 02:30
  02:00 02:30" with nothing telling summer time from winter time. A two-hour raster slides onto odd hours
  after the change, because the grid takes one offset at its start.
- **A server cannot write a time.** Under the hydration rule, no instant is written until the page has
  hydrated, because only the browser knows the reader's zone. A plant's screen leaves every time blank
  during the first paint, although its zone is known.

## Solution

umriss promises: **an application names one time zone, in core's formats, and every package shows its
instants in it. Instants are written, ticked, grouped, snapped and picked in that zone. Without one, the
reader's zone holds, as before. Where the reader's zone is another, each view names the zone once.**

- **One option.** `timeZone`, an IANA name, in core's formats on the provider: `{ timeZone:
  "Europe/Berlin" }`, or the German set spread with it. The formats carry it, and every package that reads
  `useFormats()` follows. A section in another zone is a nested provider.
- **Charts take it as a prop.** Charts import nothing, so `Chart` takes `timeZone` beside its wording. An
  application passes the formats' zone in one line. The schedule passes it itself.
- **A day is the zone's day.** Grouping, filtering, the schedule's days and raster, and the pickers' values
  use the zone's midnights, weeks, months and years.
- **The axis keeps the zone's wall clock across a clock change.** Day ticks stand on the zone's midnights.
  Ticks below a day stand on the zone's whole hours and minutes in real time. The doubled hour is ticked
  twice, and each of its labels carries its offset.
- **The time zone label.** Where the reader's zone differs, the zone's name stands once per view, where the
  view names its time scale.
- **On a server, a named zone writes the instants.** Only the label waits for hydration.

## User Stories

1. As an application developer of an operator screen, I want to name the plant's zone once on the provider,
   so that every table, schedule, picker and text from umriss shows plant time.
2. As an application developer with German formats, I want to add the zone to `GERMAN_FORMATS` by spreading
   it, so that I keep the German notation.
3. As an application developer, I want `useFormats().timeZone` to tell me the zone in use, so that I can
   hand it to a chart and to my own texts.
4. As an application developer using a chart, I want to pass the zone to `Chart` in one prop, so that its
   ticks, labels, tooltip, readout, data table and summary are in plant time.
5. As an application developer using only charts, I want `timeZone` on `Chart` to work without core, so
   that a charts-only app can show a trend in UTC.
6. As an application developer comparing two plants on one page, I want a nested provider to name the
   second zone, so that each section shows its own plant's time.
7. As an application developer who replaced the `date` entry of the formats, I want my entry to stay mine
   when I name a zone, so that the zone does not silently discard my override.
8. As an application developer, I want a misspelled zone to fail at once with Intl's error, so that a
   screen never shows the reader's time while claiming the plant's.
9. As an operator in the plant, reading in the plant's zone, I want to see no zone label, so that my
   screen is as calm as today.
10. As a head-office reader in another zone, I want each chart axis, table column of times, schedule and
    picker to name the zone once, so that I know these are plant times.
11. As a reader in Vienna of a Berlin plant, I want the label to stay put across the year, so that it does
    not come and go with two clock-change dates.
12. As a head-office analyst, I want a table grouped by day to cut at the plant's midnight, so that a
    night shift falls on its plant day.
13. As a head-office analyst, I want a date filter for 17 March to keep the plant's 17 March, so that the
    filtered rows match the plant's report.
14. As a planner in another zone, I want the schedule's raster to snap to the plant's handovers at 06:00,
    14:00 and 22:00, so that my plan lands on the plant's shifts.
15. As a planner, I want the schedule's day band and "today" to be the plant's, so that the day I see is
    the plant's day.
16. As a planner in Chicago, I want a date I pick for the plant to mean the plant's midnight, so that the
    application stores the plant's day.
17. As a planner, I want a time I pick in the doubled hour of the plant's clock change to be resolved in
    the plant's zone, with the choice offered as today, so that I pick the moment I mean.
18. As a planner, I want "Today", "Now" and the presets to be the plant's, so that "Last 7 days" means
    the plant's last seven days.
19. As a reader of a trend across the end of summer time, I want the doubled hour ticked twice with its
    offset, so that I can tell the two 02:00s apart.
20. As a reader across the start of summer time, I want the missing hour to have no tick, so that the axis
    claims no time that never existed.
21. As a reader of a week-long trend across a clock change, I want each day tick on the zone's midnight,
    so that every day still starts at 00:00.
22. As a schedule user, I want a two-hour raster to stay on even hours after a clock change, so that the
    grid does not slide.
23. As a reader hovering in the doubled hour, I want the tooltip to carry the offset, so that the time it
    names is unambiguous.
24. As a reader of a server-rendered plant screen, I want the times in the first paint, so that the screen
    is not blank until hydration.
25. As a reader of a server-rendered page without a named zone, I want the hydration rule to hold as
    before, so that my own zone never comes out wrong.
26. As an application developer who hands a picker a day from elsewhere, I want a DEV warning when that day
    is not the zone's midnight, so that I find the off-by-one day before my users do.
27. As a head-office analyst exporting a table, I want the XLSX's dates and the CSV's day dates to be the
    plant's wall clock, so that the file matches the screen.
28. As a reader, I want ages, "3 minutes ago" and freshness unchanged, so that a duration never depends on
    a zone.
29. As the maintainer, I want an ADR to record that time zones are taken and how, so that ADR-0060's "not
    yet" is closed where a reader looks.
30. As the maintainer, I want a test that a zone equal to the reader's gives exactly today's output, so that
    the zone's arithmetic is proved against the Date's own.

## Implementation Decisions

- **The ADR.** One new ADR supersedes ADR-0060 in its time-zone point. Validation and the layout editor
  stand. The ADR also replaces the last sentence of the amendment that `.scratch/server-components/` 01
  adds to ADR-0060 ("A zone the application names would let the server write instants again"). Its text
  stands in ticket 01, and its number is the coordinator's.
- **Core's formats.**
  - `Formats` gains three members:
    - `locale`, the tag a set was built in;
    - `timeZone`, the IANA name, or `undefined` for the reader's zone;
    - `timeZoneName(d)`, the zone's generic name in the set's locale (Intl's `shortGeneric`).
  - Every date and time entry of a built-in set is built with Intl's `timeZone`: `date`, `dateShort`,
    `month`, `dateLong`, `time`, `dateTime`, `offset` and `timeZoneName`.
  - Core's sets are built once per locale and zone and cached, so `DEFAULT_FORMATS` and `GERMAN_FORMATS`
    keep their identity.
- **The merge.** When the merged formats name a zone, every date and time entry that is still identical to
  the built-in entry of the set's locale is replaced by the entry built for the zone. An entry the
  application replaced stays its own. `formatsFor` stays internal, because exporting it would offer any
  locale (ADR-0024).
- **An unknown zone** throws Intl's `RangeError` where the formats are merged. There is no fallback.
- **The zone's arithmetic.**
  - Core holds two internal functions, used by core's components and exported for the table and the
    schedule:
    - the zone's wall-clock fields of an instant: year, month, day, hours, minutes, seconds and weekday;
    - the instant at which the zone's clock shows given fields. A missing time moves forward, and a
      doubled one takes the earlier occurrence; the picker's resolver reports both cases.
  - Without a zone, both use the Date's local methods, so the reader's zone keeps today's code path.
  - The offset at an instant is cached per quarter hour, so 100,000 rows group in tens of milliseconds.
  - Charts hold the same arithmetic of their own, because they import nothing (ADR-0031's pattern).
  - The exported names are the implementer's, in the style of core's other exports, and `API.md` lists
    them.
- **The label.**
  - Core exports `useTimeZoneLabel()`. It returns the formats' `timeZoneName` when all of these hold, and
    `null` otherwise:
    - the formats name a zone;
    - the page has hydrated;
    - the reader's zone differs from the named zone by name, after both are canonicalised through Intl.
  - The table, the schedule and the pickers show it. Charts compute their own the same way, with Intl in
    `wording.locale`.
- **The server.** `.scratch/server-components/` 04 makes `useFormats()` write no instant until hydration.
  That rule applies only when no zone is named. With a named zone, the server writes every instant, and only
  the label waits. Without a zone, `timeZoneName` joins the members that are empty until hydration.
- **The table.**
  - A Date column's cells follow the formats, with no change of their own.
  - Grouping by day, ISO week, month and year cuts in the zone's calendar.
  - The date filter's day bounds are the zone's midnights, and the aggregate's same-year check reads the
    zone's year.
  - The head of each column whose format is a date format shows the label after its own text, as part of
    its accessible name.
- **The pickers.**
  - The value contract reads "on the zone's midnight", where the formats name a zone, for DatePicker and
    DateRangePicker, and "resolved in the zone" for DateTimePicker and DateTimeRangePicker.
  - The grid keeps working on calendar-day Dates, and the conversion happens where the value comes in and
    goes out.
  - The missing and doubled hour are resolved and reported in the zone.
  - "Today", "Now", the presets and the calendar's today are the zone's.
  - The panel shows the label in its foot, and the trigger carries it in its accessible description.
  - In DEV, a day value that is not on the zone's midnight warns once per picker.
- **Charts.**
  - `Chart` takes `timeZone?: string`, for every time axis of the chart, the working-time calendar included.
  - Everything the chart writes about an instant follows it: tick placement, tick labels, the tooltip's x,
    the readout, the data table's position column and the summary's range.
  - `localOffset(instant, timeZone?)` and the working-time ticks take the zone as an optional last
    argument, so no existing call changes meaning.
  - The label goes into the time axis's title, after the axis's own label, or alone where it has none. The
    Picture then paints it with the title.
- **The tick rule across a clock change.** It holds for charts and the schedule alike, and for the
  reader's zone too.
  - Steps of a day or longer are built from the zone's calendar fields, as today from local fields.
  - Steps below a day stand on the zone's whole multiples in real time, on both sides of a change, so a
    two-hour grid stays on even hours.
  - The missing hour gets no tick.
  - Every tick label inside the doubled hour carries the offset, written by the formats' `offset` or the
    charts' equivalent.
  - A tooltip or readout text of an instant in the doubled hour carries it too.
- **The schedule.**
  - It passes `useFormats().timeZone` to charts' helpers.
  - The fine band, the day band, the raster of `snapTime` and its "today" follow the zone.
    `snapTime(time, raster, timeZone?)` takes it as an optional last argument.
  - The label stands once on the time axis.
- **The exports.**
  - The XLSX writes a date's serial from the zone's wall-clock fields, and its midnight test is the zone's.
  - The CSV's day-only dates (the rule the map's ticket 23 gives `.scratch/table-xlsx/`) test the zone's
    midnight.
  - ISO date-times stay ISO with their offset (ADR-0061).
- **What stays the reader's:**
  - everything, without a zone;
  - ages, freshness and `relative`;
  - "now";
  - the language;
  - what an application formats itself.
- **Changelog.** `Formats` gains required members, so a set an application wrote from scratch needs them, as
  with `numberWith` (`.scratch/number-formats/`). The entry carries the upgrade promise's migration line.

## Testing Decisions

- A good test pins what a reader sees for a fixed instant in a fixed zone: a cell's text, a tick's label and
  position, a group's key, a picker's value. It never asserts on internal state.
- **The equality test.** The workspace's unit tests run under the zone Europe/Berlin. Naming
  "Europe/Berlin" must give exactly today's output everywhere: formats, ticks, groups, raster, pickers. That
  proves the zone's arithmetic against the Date's own.
- **Other zones.** The other zones are chosen so that their changes fall on other dates than Berlin's:
  - America/New_York, whose clock changes fall on other dates;
  - Asia/Kolkata, at +05:30 with no change;
  - UTC.
- **The clock changes of 2026.** Berlin changes on 29 March and 25 October, New York on 8 March and 1
  November. Those days pin the doubled hour's two ticks with offsets, the missing hour's absent tick, the
  23- and 25-hour days, and the two-hour grid on even hours.
- **Seams:**
  - core's formats characterisation test, which pins both sets at one instant;
  - the pickers' unit tests and their DST tests;
  - the table's grouping and filter model tests;
  - charts' time and working-time tests;
  - the schedule's time-axis and snap tests;
  - the `ssr.test.tsx` files: a named zone's server markup holds the instant, and hydrating it in jsdom
    raises no recoverable error.
- **Visual.** Playwright's `timezoneId` sets the reader's zone. The control-room example renders under
  America/New_York with the plant in Europe/Berlin, and shows the labels. Under Europe/Berlin it shows none.
- Prior art: the `TZ` line in every package's Vitest config; the DateTimePicker's tests of the missing and
  the doubled hour; charts' DST tests in Berlin and New York.

## Out of Scope

- Both zones on every instant, or a zone label on every instant.
- A built-in switch between plant time and the reader's time. It is application state and one memo over
  the formats.
- A zone per axis, per column or per component prop in the packages on core. A nested provider covers a
  section.
- An offset on a table cell in the doubled hour. It reads as its wall clock, as today.
- Exporting `formatsFor`, or any locale beyond the two shipped sets.
- A date library or Temporal.
- Shifting instants by an offset, which ADR-0060 already warned against.

## Further Notes

- With a named zone, server and browser must write the same text. Both use Intl with the same locale,
  zone and options. A future ICU that changes a separator would show up as a hydration error, and the
  `ssr` tests would catch it in jsdom only for the workspace's own ICU.
- The ticket order: 02 is the prefactor (the seam, no behaviour change), 03 the tracer bullet through core
  and the table. Charts (05) can run beside the core work, since charts depend on nothing.
- Other specs edit the same code. Each ticket names them in its blocked-by line: the hydration rule
  (`.scratch/server-components/` 04), core's formats (`.scratch/number-formats/` 03), the pickers
  (`.scratch/root-contract/` 03 and `.scratch/date-jump-and-typed-entry/` 03 and 04) and the XLSX writer
  (`.scratch/table-xlsx/` 02). `.scratch/dev-warnings/` edits nothing these tickets edit.
