# 05 - The CSV writes a day as its day

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/table-xlsx/spec.md`, "Date"; the decision is the map's ticket 23
(`.scratch/after-shakedown/issues/23-the-tables-and-the-schedules-single-wishes.md`, its Answer)

## What to build

A Berlin user exports a column of days, `new Date(2026, 2, 17)` shown as 17/03/2026. The file says
`2026-03-17`, not `2026-03-16T23:00:00.000Z`, and a spreadsheet reads the day it showed
(`.scratch/shakedown/table.md` 10, `table-export.md` 6).

- **The rule.** It is the XLSX writer's own: a column whose dates all fall at local midnight is written as
  the local day, `YYYY-MM-DD`, from the local wall-clock fields. A column with one date at another time
  writes every date as ISO text, as today. Absent values do not count. *(agent: decided per column, so that
  a column never mixes two forms)*
- **One test of midnight.** The CSV and the XLSX writer use one function for "every date of the column is
  at local midnight". It stands where the XLSX entry can import it without importing the table at run
  time. Whichever of this ticket and ticket 02 lands second takes the other's. *(agent)*
- **The clipboard.** The copy of the selected rows follows the same rule, since ADR-0061 gives the copy
  the CSV's conventions. *(agent)*
- **Unchanged.** Date-times stay ISO, numbers, booleans and the formula guard as they are. A value from a
  column's own `exportValue` is written as it comes.
- **A named zone.** If `.scratch/plant-time-zone/issues/07-the-exports-write-the-zones-wall-clock.md` has
  landed, the midnight and the day are the named zone's, through that ticket's seam, and its CSV assertion
  for a column of New York midnights is turned on and passes. If it has not, that ticket keeps this one's
  tests green.
- **ADR-0061** is amended, dated the day of the change. Its line "dates as ISO text" becomes: a column of
  days is written as its local day, other points in time as ISO text. The amendment says why: a day written
  as an instant lands a day off east of UTC and is read as text.
- **Docs.** The Export page's text ("a point in time as a timestamp") and the README's export paragraph
  say what a day and a date-time become.

## Acceptance criteria

- [ ] Tests of the writer under a fixed `TZ` (Europe/Berlin, and Asia/Tokyo for the other side), as the
      XLSX writer's tests set it:
  - a column of local midnights writes `2026-03-17`;
  - the same column with one date at 13:45 writes every date as ISO;
  - an absent value beside midnights leaves the column a column of days;
  - a German and an English export write the same day.
- [ ] `selectionAsText` writes the same day.
- [ ] Every other export test passes unchanged.
- [ ] ADR-0061 carries the amendment.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes under Changed that a column of days exports as `YYYY-MM-DD`.
