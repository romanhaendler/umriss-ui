# A plant time zone

Type:       grilling
Status:     resolved
Blocked by: 04

## Question

Does umriss show an instant in a time zone the application names (the plant's), beside the reader's own?

ADR-0060 says "not yet; umriss shows the reader's time". "What umriss promises a Server Component" took
server rendering off this question (on a server no instant is shown, ADR-0060 amended there), so only the
wishes remain: a fixed time zone for charts (`.scratch/shakedown/wishes.md` 3, charts) and a plant time zone
for operator screens (same file, operator screens; `operator-screens.md`).

- One option in core's formats that every package reads (charts' axes, the table's `Date` column, the
  schedule's ticks, freshness), or per component?
- What the axis does across a daylight-saving change in that zone, and what a reader sees who sits in
  another zone (a zone label?).
- Charts depend on nothing: how the option reaches them without core.

## Answer

Decided 2026-10-25. The maintainer answered the product question: **yes**. umriss shows instants in a time
zone the application names (the plant's), as one option in core's formats that every package reads, charts'
axes included. Where the reader's zone and the named zone differ, the zone is shown. The maintainer
delegated the rest; those decisions are marked *(agent)*, and three of them are flagged for review.

- **The option is `timeZone`, an IANA name, in core's formats** *(agent)*. An application writes
  `language={{ formats: { timeZone: "Europe/Berlin" } }}`, or `{ ...GERMAN_FORMATS, timeZone: … }`, on the
  provider. Every package reads it as `useFormats().timeZone`. Left out, it is the reader's zone, as today.
  - `Formats` gains three members *(agent)*:
    - `locale`, the tag the set was built in, as the charts' wording already has it;
    - `timeZone`;
    - `timeZoneName(d)`, the zone's generic name in the set's locale ("CET (Germany)", "Chicago Time").
      It can be replaced entry by entry, like every text the formats write.
  - When the merged formats name a zone, the merge rebuilds every date and time entry that is still the
    built-in one of the set's locale, for that zone *(agent)*. An entry the application replaced stays its
    own. Core's sets are built once per locale and zone, so identity tells the two apart.
  - `formatsFor` stays unexported *(agent)*. Exporting it would offer any locale, and ADR-0024 ships two.
  - A section in another zone, such as a head office comparing two plants, is a nested provider. No
    package gets a per-component zone prop.
  - An unknown zone throws Intl's `RangeError` at the provider *(agent)*. A silent fallback to the reader's
    zone would show a wrong time on an operator screen.
- **Charts take it as a `timeZone` prop on `Chart`** *(agent, product - for review)*. Charts depend on
  nothing (ADR-0031), so they cannot read core's formats. They take the zone the way they take their locale,
  per chart and beside `wording`. An application passes `useFormats().timeZone`, which is one line. The
  schedule hands core's zone to charts' helpers itself, so the schedule needs nothing from the application.
  Charts' exported helpers `localOffset`, and with it the working-time ticks, take the zone as an optional
  last argument *(agent)*. The schedule's `snapTime` does the same.
- **A day is the zone's day** *(agent)*. Midnight, an ISO week, a month and a year are the zone's
  calendar. That holds for the table's date groups, its date filter, the year check of its aggregate, the
  schedule's day band, its raster and its "today", and the pickers.
  - **What a picked date means** *(agent, product - for review)*. In a named zone, the DatePicker's value is
    the instant of the zone's midnight. The DateRangePicker's two ends are zone midnights. The
    DateTimePicker resolves its wall-clock fields in the zone, with the missing and the doubled hour
    reported in the zone, as it reports them for the reader's zone today. Presets, "Today", "Now" and the
    calendar's today are the zone's.
  - Inside the picker, the grid keeps working on calendar-day Dates; the conversion stands at the value
    seam *(agent)*.
  - A day value handed in that is not a zone midnight warns once in DEV *(agent)*. An app east of the plant
    that hands in its own local midnight would otherwise see the day before.
- **The axis across a clock change keeps the zone's wall clock** *(agent)*.
  - Ticks of a day and longer stand on the zone's midnights, built from the zone's calendar fields. A day
    is then 23 or 25 hours wide, and the tick after the change still reads 00:00. This is today's rule, in
    the zone.
  - Ticks below a day stand on the zone's whole minutes and hours in real time, on both sides of the
    change. The missing hour gets no tick. The doubled hour is ticked twice, and each of its labels carries
    its offset ("02:00 GMT+2", "02:00 GMT+1").
  - This changes the reader's zone too, and fixes two things: the schedule's repeated "02:00 02:30 02:00
    02:30" with nothing telling CEST from CET (`schedule.md` 4), and a two-hour step that slid onto odd
    hours after a change because the grid's one offset was taken at its start.
  - A tooltip and a readout of an instant in the doubled hour also carry its offset, in charts and the
    schedule. A table cell does not; it reads as its wall clock, as today (see Out).
- **The time zone label** *(agent)*.
  - Each view names the zone once, where it names its time scale:
    - a chart's time axis, in its title (the Picture paints it with the title);
    - the head of each table column of points in time;
    - the schedule's time axis;
    - a picker's panel, and the trigger's accessible description.
  - It is never written on every instant. A thousand rows would repeat it a thousand times.
  - It shows only after hydration, and only where the reader's zone, read in the browser, differs from the
    named zone by name after Intl's canonicalisation. A same-offset neighbour (Vienna for a Berlin plant)
    sees it too. That is true and harmless. Comparing offsets instead would make the label come and go
    with two zones' clock-change dates.
  - Core exports `useTimeZoneLabel()`. It returns the label, or `null`. Charts compute their own the same
    way.
- **On a server, a named zone writes the instants** *(agent)*. The hydration rule of "What umriss promises a
  Server Component" (`.scratch/server-components/` 04) applies only without a named zone, because only then
  is the zone the reader's. The label still waits for hydration. `timeZoneName` joins the instant members
  that are empty until hydration when no zone is named.
- **What stays the reader's** *(agent)*:
  - everything, when no zone is named;
  - ages: freshness and `relative` measure a duration, which has no zone;
  - "now", which is an instant;
  - the CSV's ISO date-times with their offset (ADR-0061);
  - the language;
  - what an application formats itself.

  The XLSX's date serials and the CSV's day-only dates do follow the zone, because they are wall clock and
  the file must match the screen.
- **No library, no Temporal** *(agent)*. Intl's `timeZone` knows every zone in every supported browser. Core
  and charts each hold a small arithmetic: the wall-clock fields of an instant in a zone, and the instant of
  fields in a zone. Charts duplicate it because they import nothing (ADR-0031's pattern). Without a zone, it
  falls back to the Date's local methods. An offset cache per quarter hour keeps grouping 100,000 rows near
  25 ms; uncached it took 260 ms in Node 22.
- **Explicitly out.**
  - Both zones on every instant.
  - A built-in "plant time / my time" switch *(agent, product - for review)*. It is the application's state
    and one memo over the formats.
  - A zone per axis or per column.
  - An offset on table cells in the doubled hour.
  - Shifting instants by an offset.
  - Exporting `formatsFor`.
- **Costly to reverse: yes, so an ADR.** It supersedes ADR-0060 in its time-zone point, which ADR-0060's own
  consequences ask for ("by an ADR that supersedes this entry"). Validation and the layout editor stand. The
  ADR is the spec's first ticket, with its text.
- **Touches:**
  - core: formats, language merge, the hydration rule, pickers, `useTimeZoneLabel`, README and the
    Language page;
  - charts: time ticks and labels, working-time ticks, `localOffset`, the `Chart` prop and README;
  - table: Date column header, grouping, date filter, exports;
  - schedule: ticks, days, snapping, today and the label;
  - the control-room example in core's demo.
- **Becomes the spec** `.scratch/plant-time-zone/`.
