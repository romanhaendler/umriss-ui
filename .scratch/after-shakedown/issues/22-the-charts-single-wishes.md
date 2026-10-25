# The charts' single wishes

Type:       grilling
Status:     open
Blocked by: 12, 16

## Question

Take, later or never for each charts wish one persona had (`.scratch/shakedown/wishes.md` section 3,
"charts"; proofs in `charts.md`, `data-science.md`, `reports-bi.md`, `operator-screens.md`):

legend left/right · a brush (see `.scratch/chart-range-selection-and-navigator/` and the navigator) · a fixed
time zone (see the map's fog on time zones) · follow the live edge with pause · error bars · a fit line with
band · point opacity or density · a colour bar and cell labels for `Matrix` · a shared y domain for small
multiples · a gap threshold · typed arrays and Arrow as input · a waterfall (~10 lines of stacked bars) ·
drill-down (answered by "Linked views"?) · a per-month aggregation helper · a month tick unit · a tag-aware
trend (pens).

And the "never" items that held with a caveat: a log scale without minor ticks (ADR-0032/0059), pie and donut
via `pareto()` needing the cumulative line and a second axis. A new kind passes ADR-0059's test and gets its
own ADR.
