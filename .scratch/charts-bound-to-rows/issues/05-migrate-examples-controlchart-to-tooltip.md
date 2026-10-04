# 05: Migrate: the examples from ControlChart to Tooltip, and the scenarios

**What to build:** The demo pages ControlChart, Installation, LimitLine, Line, Matrix, Pareto, Scatter, StateBand and Tooltip, and the charts' scenarios, show the new shape.

**Blocked by:** 02 (Expand: `useChart` and `value`)

**Status:** done

- [x] No `accessor` and no free series, axis or `Chart` remain in the batch
- [x] Typecheck and tests green; screenshots unchanged

## Comments

Delivered. Every example of ControlChart, Installation, LimitLine, Line, Matrix, Pareto, Scatter, StateBand and Tooltip, and the five scenarios, opens with `const { Chart, XAxis, YAxis, ... } = useChart(rows);` and reads through `value`: a field name where the accessor only read a field, a function otherwise, its parameter no longer annotated. Left as they are, as agreed: `ControlChart`'s `accessor` (07 gives it `value`) and the matrix's row `accessor`; the matrix's colour `value` is a field name now. A scenario with two charts over different rows puts each chart in a small component of its own (scenarios 02-05); scenario 01's two charts share one hook, they read the same rows. Pareto's `entries as ParetoEntry[]` cast went: `useChart` takes readonly rows.

Line/03's instance axis no longer names a value: it read `replicas` of the step series' own rows, which the axis, typed at the chart's rows, cannot name. A y axis' value is read by nothing (only the x axis' runs in materialisation, scene.ts), so nothing changes - for 07 to decide whether a y axis takes `value` at all.

Prose: the Installation page's about text and its first lead (left over from 02), Line/01's lead and StateBand's about text and its first lead say `value` now. `demo/unshown.json`: `accessor` on XAxis, YAxis, Line, Bar, Scatter and StateBand and `ChartProps.data` are listed as (g) deprecated aliases until 07 removes them - no example shows them any more.

Tests: typecheck, 730 unit tests and lint green; charts visual suite green after renewing 18 pictures, all on pages whose wording changed (the chart pixels themselves are unchanged; the shifted text moves the plots below it by a subpixel): page heads installation and stateband, examples installation--first-chart, installation--in-its-container, line--one-series, stateband--one-vehicle, --under-a-course, --one-lane-each, and forced-one-vehicle - each light and dark. The scenarios' pictures are unchanged.
