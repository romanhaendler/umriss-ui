# 05 - alignTicks

Status: done
Type: task

Spec: `.scratch/charts-long-series/spec.md` - row 05 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `YAxis alignTicks?: boolean`. Pure: `alignedTicks(min, max, domain, ticks)`
  in `ticks.ts` - from the first axis' ticks it takes the count and its
  margins in steps (zero on a `"nice"` axis), then climbs the 1-2-5 steps from
  the smallest that could hold the extent to the first whose grid does; the
  domain's ends are cleaned of float noise, the ticks rounded to the step.
  `null` without two ticks - the axis then lays out as before.
- `computeLayout` lays out the first y axis in registration order first; an
  aligned axis takes its domain and ticks from `alignedTicks`, a fixed domain
  widened from itself and any other from the extent, and formats with the
  aligned step unless it has a `tickFormat`. `tickCount` does not apply to it;
  on the first y axis `alignTicks` changes nothing.
- The DEV warning about several grids no longer says there is no alignment.
- Tests first: 4 in `ticks.test.ts` (smallest step, decimals without noise, a
  grid with margins by the shares of the domain, a constant extent and too few
  ticks), red before the function existed; 3 in `layout.test.ts` (every
  aligned tick on a row of the first, the first on either side; extent inside
  and 1-2-5; nothing without it).
- Example `Axis/07-aligned-ticks.tsx` - kiln temperature and gas on one grid;
  2 new screenshots.
