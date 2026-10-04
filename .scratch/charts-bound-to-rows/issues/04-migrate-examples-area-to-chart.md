# 04: Migrate: the examples from Area to Chart

**What to build:** The demo pages Area, Axis, Bar, Benchmark, BoxPlot and Chart show their examples - and so their visible source - in the new shape; a plain field becomes a field name.

**Blocked by:** 02 (Expand: `useChart` and `value`)

**Status:** done

- [x] No `accessor` and no free series, axis or `Chart` remain in the batch
- [x] Typecheck and tests green; screenshots unchanged

## Comments

**Delivered 2026-10-04.** The 33 examples of Area, Axis, Bar, Benchmark, BoxPlot and Chart open with `const { Chart, XAxis, … } = useChart(rows);` and read through `value` - a field name wherever the accessor only read a field, a function otherwise (a computed axis, an index, a notch). The box channels and `baseline` take field names too. Only Matrix's row `accessor` remains (Chart/07).

- Chart/07 held two charts over two row sets in one component; each now has its own component and hook.
- Axis/08: the hourly top axis read `HourCount.hour`, but the hook's `XAxis` is typed at the minute readings - an axis cannot take a row type of its own as a series can. It reads `(_, i) => i + 0.5` now (row i is the middle of hour i), the same numbers. Worth a decision before 07: an axis whose series all bring their own `data` has no way to name their fields.
- Outline: the Axis limit and the Area about say `value` / `baseline` instead of "accessor". The Installation about (line 33) still says accessors - that page is 05's.
- `unshown.json`: the four stale "not shown yet" entries for `value` on Area, Bar, Scatter and StateBand are gone; `AreaProps.accessor` is now unused by any example and stands there as (g) deprecated alias until 07 removes it.
- Screenshots: no chart pixel moved; only the Area page head (light, dark) was renewed for its reworded line.

