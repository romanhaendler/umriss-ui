# 03 - A table shows the plant's time

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-an-application-names-its-time-zone.md`, `02-one-seam-for-the-days-and-clock-of-a-zone.md`, `.scratch/server-components/issues/04-an-instant-is-written-once-the-page-has-hydrated.md`, `.scratch/number-formats/issues/03-a-table-column-takes-intls-options.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

The tracer bullet, end to end through core and the table. An application writes
`language={{ formats: { timeZone: "Europe/Berlin" } }}` on its provider. A reader in Chicago then sees a
table of alarms in Berlin time:

- its Date column in Berlin time;
- grouped by Berlin days;
- filtered by Berlin days;
- with "CET (Germany)" in the head of the time column.

A server writes those times into its HTML. The ticket is blocked by two other specs because both edit what
it edits: the hydration rule in `useFormats` and core's `Formats`.

- **Core's formats.**
  - `Formats` gains `locale`, `timeZone` and `timeZoneName(d)`, the generic name, Intl's `shortGeneric`.
  - The internal `formatsFor` takes the zone, builds every date and time entry with it, and caches a set
    per locale and zone, so `DEFAULT_FORMATS` and `GERMAN_FORMATS` keep their identity.
  - The merge (spec, "The merge"): where the merged formats name a zone, every date and time entry still
    identical to the built-in one of the set's locale is replaced by the zoned one. An entry the
    application replaced stays its own.
  - An unknown zone throws Intl's `RangeError`.
  - The Language page in core's demo samples `timeZoneName`, since its samples are typed by `Formats`.
- **The server.** `useFormats()` keeps the hydration rule of `.scratch/server-components/` 04 only where no
  zone is named. `timeZoneName` joins the members that are empty until hydration. With a zone named, the
  server writes every instant. A comment says why: a named zone does not depend on the reader.
- **The label.** Core exports `useTimeZoneLabel()`. It returns the formats' `timeZoneName` of now when all
  of these hold, and `null` otherwise:
  - the formats name a zone;
  - the page has hydrated;
  - the reader's zone, from Intl's resolved options, differs from the named one after both are
    canonicalised through Intl.
- **The table.**
  - Grouping, the date filter and the same-year check pass `formats.timeZone` into 02's seam.
  - The head of every column whose format is a date format (`"date"`, `"time"`, `"dateTime"`) shows the
    label after its text, in muted text, and it is part of the column's accessible name.
  - The cells need no change: they follow the formats.
- **README.** Core's Language section gets a "Time zone" part:
  - the option, and spreading it into the German set;
  - a nested provider for a second zone;
  - what follows the zone and what stays the reader's;
  - the label;
  - the server.

  The table's README names the column head's label in one sentence.
- **Changelog.** Core, a minor entry, with the migration line for a `Formats` written from scratch. Table, a
  minor entry.

## Acceptance criteria

- [ ] Core's formats characterisation test pins both sets in America/New_York and in Asia/Kolkata at one
      instant, `timeZoneName` included. Naming "Europe/Berlin", the workspace's zone, gives exactly the
      unnamed set's texts.
- [ ] A test shows a replaced `date` surviving a named zone, and `{ ...GERMAN_FORMATS, timeZone }` writing
      German notation in the zone.
- [ ] `{ timeZone: "Mars/Base" }` throws a `RangeError` naming the zone.
- [ ] Table: under a named America/New_York, a row at 2026-03-17T03:30Z lands in the group "16/03/2026",
      a day filter of 16 March keeps it, and its cell reads "16/03/2026, 23:30".
- [ ] The column head carries the label under a named zone different from the reader's (stub the resolved
      zone in the test), and none under a named "Europe/Berlin" or no zone.
- [ ] Server: `renderToString` of a table with a Date column under a named zone holds the formatted
      instant. Hydrating it in jsdom raises no recoverable error. Without a zone, the server-components rule
      holds, and its tests stay green.
- [ ] `pnpm check core`, `pnpm check table`, `pnpm typecheck` and `pnpm check:site` pass, and both `API.md`
      files are regenerated.
- [ ] `pnpm test:visual:quick core` and `pnpm test:visual:quick table` pass.
