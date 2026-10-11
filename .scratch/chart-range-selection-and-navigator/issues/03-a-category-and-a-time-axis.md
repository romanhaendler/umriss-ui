# 03 — A category axis and a time axis

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: decisions R8, R9, R12, R14; user stories 5-7

## What to build

A range is reported in the values of the axis it was made on, for the pointer
(ticket 01) and the keyboard (ticket 02) alike.

- **Category axis (ADR-0052).** `from` and `to` are the first and the last
  category covered, as the strings the rows hold. The covered ones are those
  whose place, half a step either side, the dragged stretch touches; a
  stretch inside one place reports that one twice. `Categories` in
  `scene.ts` (`names`, `place`) is the map; along x place `i` is `names[i]`.
  The caller knows the order from its `categories` list or the rows' first
  occurrences - the ticket does not add it to the report.
- **Time axis.** Milliseconds, as the x channel holds them.
- **Calendar axis.** Wall-clock instants through the mapping the axis uses
  (`workingTime.ts`, `toWallClock`); an end in removed time lands at the edge
  the mapping gives. Check what the clamped mapping does at the ends of the
  plot before relying on it.

Where ticket 01 reported places or working time, this ticket turns them into
these. Tickets 01 and 02 are not released without it.

## Acceptance

- [ ] Mounted: on a category axis a drag over three bars reports the first and
      the last category, in the order of the axis, also with `categories`
      given; a drag inside one place reports it twice; the keyboard reports
      the Active point's category.
- [ ] Mounted: on a time axis the report is milliseconds; on a calendar axis a
      drag across a weekend reports instants whose difference is the wall
      clock's, not working time's.
- [ ] Mounted: a numeric axis is untouched (ticket 01's tests pass unchanged).
- [ ] Type test: a category axis' `from` and `to` are strings, a numeric one's
      numbers.
- [ ] Typecheck and the charts' unit tests pass.
