# 07 - The exports write the zone's wall clock

Status: ready-for-agent
Type: task
Size: S

Blocked by: `03-a-table-shows-the-plants-time.md`, `.scratch/table-xlsx/issues/02-the-writer.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

A head-office analyst exports the plant's table under a named Europe/Berlin. The XLSX shows the times and
days the screen shows. The ticket waits for the XLSX writer, which builds the date serials this ticket
moves into the zone.

- **XLSX.** A date's serial is counted from the zone's wall-clock fields, through 02's seam, and the
  column's "all at midnight" test is the zone's midnight. The writer gets the zone from the table, as it
  gets the language.
- **CSV.** Date-times stay ISO with their offset (ADR-0061): an instant is the same for every reader. The
  day-only rule that the map's ticket 23 gives `.scratch/table-xlsx/` (a column whose dates all fall at
  midnight is written as `YYYY-MM-DD`) tests the zone's midnight and writes the zone's day. That rule may
  land after this ticket; if so, this ticket's test is the one that rule's ticket keeps green.
- **README.** The table's export paragraph says which outputs follow the zone and which stay ISO.

## Acceptance criteria

- [ ] Under a named America/New_York in the workspace's Berlin, an instant at 2026-03-17T03:30Z exports as
      the XLSX serial of 16 March 2026 23:30. A column of New York midnights uses the date-only style.
- [ ] The CSV writes the same instant as ISO, unchanged. Where the day-only rule exists, a column of New
      York midnights writes `2026-03-16`.
- [ ] Without a zone, the existing export tests pass unchanged.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes the exports in the zone.
