# 01 - Time axis

Status: done
Type: task

Spec: `.scratch/charts-essentials/spec.md` - row 01 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `src/time.ts` (new): `timeStepFor` (minute 1-30, hour 1-12, day 1/2/7/14,
  month 1-6, then years 1-2-5), `timeTicks` - candidates built from the local
  calendar fields, so ticks stay on the local clock across a clock change,
  weeks on Mondays, months on the first - `timeDomain` ("nice" = the step's
  local boundaries), `timeLabels` and `timeText` (`17 Mar 15:23`, the tooltip's
  x value).
- `XAxis time?: boolean` → `AxisConfig.time` → `AxisInput.time`; compared in
  `updateAxis`. A calendar implies it: the calendar axis now takes its
  candidates from `timeTicks` (instead of `operatingTicks` with one offset for
  the whole domain - the ponytail note in `layout.ts` is gone with it) and the
  same labels; `dd.MM. HH:mm` is gone. `tickFormat` still gets the wall clock.
- Level change: the clock level carries the date on the first tick of a new
  day, the day level the year on the first tick of a new year.
- Tests: `tests-unit/timeAxis.test.ts` (15, written first and failing);
  the `dd.MM.` test in `layout.test.ts` rewritten to the new labels.
- Example `Axis/04-time.tsx` (hall temperature over a day, `hallTemperature`
  in `demo/data.ts`); 2 new screenshots (light, dark). No existing picture
  renewed: the operating-time example has its own `tickFormat` and the same
  12 h ticks as before; its occasional failure is the known sub-pixel drift
  (passes on repeat).
- `operatingTicks` stays exported, unused inside the package now; 07 may
  decide about it.
