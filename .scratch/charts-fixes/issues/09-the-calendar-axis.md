# 09 - The calendar axis

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 11)

## Scope

- x limits on a calendar axis are mapped into operating time, for placement and for the extent.
- Explicit `ticks` on a calendar axis are given in wall-clock time and mapped.
- Day and 6/12 h ticks fall on **local** boundaries: the offset logic the schedule keeps as `localOffset` moves into `operatingTime.ts`, is exported, and the schedule imports it from there (its own copy deleted). `charts-essentials` 01 builds the time axis on it.

## Acceptance

- Unit tests (operating time, scene) first, one of them under `TZ=Europe/Berlin`: the day tick sits at local midnight.
- Schedule tests stay green.

## Delivery

Finding confirmed on all three counts; six tests failed first. The charts
unit tests now run under `TZ=Europe/Berlin` as the other three packages' do
(`vitest.config.ts`); every earlier test stayed green under it.

- x limits: `sceneLimitsAndBands.test.ts` (the extent took 26 h wall clock as
  26 h operating time) and `sceneFrame.jsdom.test.ts` (the label's px).
  `scene.ts` maps a limit's value through the axis' calendar (`limitAt`) for
  the extent, the drawing and the label.
- Explicit ticks: `layout.test.ts` - named on the wall clock, mapped, one in
  removed time dropped.
- Local boundaries: `operatingTime.test.ts` (`localOffset`, winter and summer)
  and `layout.test.ts` (half-day ticks at local 00:00 and 12:00, not 01:00 and
  13:00). `localOffset` moved from `schedule/src/snap.ts` into
  `operatingTime.ts`, exported; the layout passes it for the domain's start.
  Marked `ponytail:` - one offset per domain, so across a clock change the day
  ticks after it sit an hour off, as the schedule's fine band always did.

Schedule: `snap.ts` and `timeAxis.ts` import `localOffset` from charts, its own
copy deleted; it resolves charts from source (vitest alias, tsconfig paths),
so no build was needed. Typecheck, 202 tests and both builds green. No schedule
CHANGELOG entry: `localOffset` was never exported there, so callers see nothing.

Screenshots: 2 renewed (`axis--operating-time`, light and dark), viewed - the
ticks read "Mon 12:00" where they read "Mon 13:00". The filtered run also
failed `axis--axes` (dark) on sub-pixel drift of the lines, unrelated and not
renewed.
