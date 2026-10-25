# 01 - The ADR: an application names the time zone its instants are shown in

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/server-components/issues/01-the-adr-and-what-each-readme-says.md`
Spec: `.scratch/plant-time-zone/spec.md`
ADR:    ADR-0076, given in `.scratch/after-shakedown/order.md`; use it wherever this ticket says "the next free number" or ADR-NNNN

## What to build

The decision, written where a reader looks for it. There are no source changes. The ticket is blocked by
the server-components ADR because that ticket writes the amendment to ADR-0060 that this ADR completes.

- **The ADR.** Add it under `docs/adr/` with the next free number the coordinator gives (ask under
  `## Comments` if none is given), and list it in `docs/adr/README.md` the way the others are. Its text is
  below. Copy it, fill in the number, and correct only facts that have changed since.
- **ADR-0060.**
  - Its status line names the new ADR as superseding it in one point, time zones, beside ADR-0064's point.
  - Its "Not yet: time zones" section stays as history. One line at its head points at the new ADR.
  - The amendment of 2026-10-25 ends "A zone the application names would let the server write instants
    again. That is the 'not yet' above." Add after it: "Taken by ADR-0076: with a named zone, the server
    writes the instants."

### The ADR's text

> # An application names the time zone its instants are shown in
>
> Status: accepted, supersedes ADR-0060 in one point (time zones)
> Date:   2026-10
>
> ADR-0060 left time zones at "not yet". Every instant was shown, ticked, snapped and parsed in the reader's
> zone, until an application needed another. The shakedown of 2026-10-24 found two applications that do:
>
> - a trend in a fixed zone, UTC or the plant's;
> - the operator screens of a plant, read from a head office in another zone.
>
> The workaround, a `tickFormat` with Intl's `timeZone`, fixed the labels. It left the ticks, the table,
> the schedule and the pickers in the reader's zone, so one screen said 06:00 on the axis and 23:00 in the
> table for the same moment.
>
> **An application names one time zone in core's formats, and every package shows its instants in it:
> written, ticked, grouped, snapped and picked. Without one, the reader's zone holds, as before. Where the
> reader's zone is another, each view names the zone once.**
>
> - **One option, in core's formats.** `timeZone` is an IANA name, set on the provider as
>   `{ formats: { timeZone: "Europe/Berlin" } }` or spread into the German set. The formats carry it, and
>   their date and time entries are built for it. Every package already reads `useFormats()`, so every
>   package follows. An entry the application replaced stays its own. A section in another zone is a
>   nested provider. An unknown zone throws, because a silent fallback would show the reader's time as the
>   plant's.
> - **Charts take it as a prop.** Charts depend on nothing (ADR-0031). `Chart` takes `timeZone` beside its
>   wording, as it takes its locale. The schedule hands core's zone to charts' helpers itself.
> - **A day is the zone's day.** Midnight, an ISO week, a month and a year are the zone's calendar. That
>   holds for table groups, the date filter, the schedule's days and raster, and the pickers. A picked day
>   is the instant of the zone's midnight.
> - **Across a clock change the axis keeps the zone's wall clock.**
>   - Day ticks stand on the zone's midnights, so a day is 23 or 25 hours wide.
>   - Ticks below a day stand on the zone's whole hours and minutes in real time, on both sides of the
>     change.
>   - The missing hour has no tick.
>   - The doubled hour is ticked twice, each label with its offset ("02:00 GMT+2", "02:00 GMT+1").
>
>   The rule holds for the reader's zone too.
> - **The time zone label.** Where the reader's zone is not the named one, each view names the zone once,
>   where it names its time scale: a time axis's title, the head of a column of points in time, the
>   schedule's axis, a picker's panel. The text is the zone's generic name in the formats' locale. It shows
>   after hydration, because only the browser knows the reader's zone. The two zones are compared by name,
>   so the label does not come and go with two zones' clock-change dates.
> - **On a server, a named zone writes the instants.** It does not depend on the reader, so the hydration
>   rule of ADR-0060's amendment applies only when no zone is named.
> - **What stays the reader's:**
>   - everything, when no zone is named;
>   - ages and freshness, which are durations;
>   - "now";
>   - ISO date-times in an export;
>   - the language.
>
> ## Considered Options
>
> - **A `timeZone` prop on every component.** A screen of eight views would name it eight times, and the one
>   forgotten view would show the other zone without a word.
> - **A `timeZone` on the provider beside the formats.** It has the same effect, in a second place. The
>   formats are where the date entries are built and where every package reads them.
> - **Shifting timestamps by the zone's offset**, which ADR-0060 already warned against. It gets the
>   clock-change hour wrong.
> - **A date library or Temporal.** Intl's `timeZone` knows every zone in every supported browser. A
>   library would be a dependency for a few dozen lines, and Temporal is not in the oldest browsers umriss
>   supports.
> - **Both zones on every instant, or the label on every instant.** A table of a thousand rows would repeat
>   it a thousand times.
> - **Comparing the two zones by offset.** A Vienna reader of a Berlin plant would see no label, but a
>   reader whose clock changes on other dates would see the label come and go during the year.
> - **The doubled hour ticked once,** as day fields would give. A zoomed axis inside that hour would have no
>   tick at all, and the schedule's grid would slide after a change.
>
> ## Consequences
>
> - ADR-0060's time-zone entry is superseded. Validation and the layout editor stand.
> - `Formats` gains `locale`, `timeZone` and `timeZoneName`. A set an application wrote from scratch must
>   add them.
> - Core and charts each hold the zone's arithmetic, a few dozen lines on Intl, because charts import
>   nothing.
> - With a named zone, a day value handed to a picker from elsewhere must be the zone's midnight. A DEV
>   warning says so.
> - Reversing this breaks every screen that names a zone.

## Acceptance criteria

- [ ] The ADR stands under `docs/adr/` with its number, in the format of its neighbours, and is listed in
      `docs/adr/README.md`.
- [ ] ADR-0060's status line, its pointer line and the sentence after its amendment name the new ADR.
- [ ] `pnpm check:site` passes, and the site renders the new ADR (ADR-0046) and finds every link.
