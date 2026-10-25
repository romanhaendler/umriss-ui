# The charts' single wishes

Type:       grilling
Status:     resolved
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

## Proposed answer

*Proposed by the agent, 2026-10-25; the maintainer decides. "(agent)" marks a technical call the map lets
the agent make. No wish here is a new chart kind, so ADR-0059's test is not run; the one place it would
apply (a whisker mark of its own) is named and not proposed.*

Already settled elsewhere, only pointed at: **a brush** - `.scratch/chart-range-selection-and-navigator/`
and `.scratch/chart-navigator/` · **a fixed time zone** - [25](25-a-plant-time-zone.md) · **drill-down** -
an example under "Linked views" ([16](16-linked-views.md), `.scratch/linked-views/`) · number and tick
formats - [15](15-number-formats.md) · export and print - [12](12-chart-export-now-that-todataurl-fails.md) ·
a chart below its floor in a widget - `.scratch/scroll-in-a-widget/`.

| Wish | Recommendation | Reason | Spec or size |
|---|---|---|---|
| Legend left/right | **take**, straight to spec | `placement` is `top \| bottom` and the design persona gave up; a side list is how a trend with many series reads. The legend is already DOM laid out beside the plot (plot = container − legend − bands), so it is one more side. Left (agent): the legend's width (its longest name, capped, names wrap) and the width below which it stands above. | S-M · spec A |
| Follow the live edge with pause | **take as an example**, no API | It holds today without fighting the zoom: follow with `setView` (not reported), and `onViewChange` - which then is only the reader's - pauses; a "Live" button resumes. The shakedown's fight came from `setDomain`, which is reported. Only if the maintainer wants it as a promise: a `follow` in the view, ADR-0047 amended (M). | S · spec C |
| Error bars | **take as an example**, in spec B | A thin floating bar (spec B's `baseline` on `Bar`) for the interval plus a `Scatter` for the estimate; the tooltip names both, not "quartile". A confidence band is already `Area baseline`. A whisker mark of its own would be a kind: ADR-0059's test and an ADR - not proposed unless the example fails. | S · spec B |
| Fit line with band | **never** as a feature; an example | A regression is a model the analyst chooses (which fit, which band); the capability record keeps aggregation the application's. The Instead holds: own OLS + `Line` + `Area baseline`, about 12 lines. | S · spec C |
| Point opacity or density | **never** for opacity; density as an example | A scatter is one `Path2D` and one `fill()`; translucency on it does not accumulate, so a million points stay a blob, and a fill per point breaks the million-point budget. Density is measured counts: points counted into cells and drawn as a `Matrix` (a 2D histogram, as `bin()` is for `Bar`, ADR-0054). | S · spec C |
| Colour bar and cell labels for `Matrix` | **take**, decision left | A gradient without its values cannot be read back as a number. Colour bar: the legend's gradient entry names its range and each step's edge. Cell labels: the level in each cell where it fits, none where not. Left (agent): the label's colour on any step without a colour parser (ADR-0011) - a halo, or a text colour per stop. A smooth diverging scale stays **never**: the stops are the steps (`MatrixColoring`, ADR-0011); name more stops. | M · spec D |
| Shared y domain for small multiples | **never**; an example | One line of app code: the same `domain` on every `YAxis`. Equal domains give equal tick labels, so the y bands are equally wide and the plots line up (`data-science.md` 7 confirms a fixed domain aligns them). | S · spec C |
| A gap threshold | **take**, straight to spec | A line bridging an hour without rows draws values nobody measured - the reason smoothing is "never". The chart cannot know the sampling rate, so it is opt-in: a `maxGap` on `Line` and `Area` in the x axis' units (ms on a time axis), a longer step is a **Gap**; a `step` line ends its hold there (agent: name and placement). Off by default, since a historian's compressed data holds across silence. | S · spec A |
| Typed arrays and Arrow as input | **never** for column input; an example; `bin` widened | Rows are what the hook binds (ADR-0048): hits, `onSelect`, the tooltip's `datum` and the data table are per row; columns would be a second data model through every kind. Instead, no object per row: an index array and accessors that read the columns, `(_, i) => y[i]`, on axis and series. The one real gap: `bin(values)` refuses a `Float64Array` in its types - widen to `ArrayLike<number>`. | S · spec A (the `bin` type), spec C (example) |
| A waterfall | **take**, as a channel, not a kind | Stacked bars with an invisible base leak "Basis …", "Summe 0" into tooltip, readout and table - values that are no reading. `baseline` on `Bar`, as `Area` has it: a floating bar from one value to another, a corridor by both edges in tooltip and table, never with `stack` (agent). The waterfall is then a running sum (3 lines) and an example. Also gives range bars (min-max per hour) and error bars. No new kind; **Baseline** in `CONTEXT.md` widens to bars. | S-M · spec B |
| A per-month aggregation helper | **never**; an example | Aggregation is the application's (capability record, "Out"): what changes the number shown is not the chart's to decide. The example is the shakedown's 6-line `perMonth()`. | S · spec C |
| A month tick unit | **take**, straight to spec | `charts.md` 7: bars on `Date` rows get weekly ticks under monthly bars, labelling no bar. Rule: a time axis that carries bars ticks no finer than the bars' step, on its boundaries; explicit `ticks` stay the way out. | S · spec A |
| A tag-aware trend (pens) | **never** as a component; an example | Each part exists: a pen's own scale is a `YAxis` per pen, the pen list a `Table` bound to `hidden`/`toggleSeries`, two periods one line. A pen is a tag of the application's historian, which umriss does not know. The example belongs to the operations scenario. | S-M · spec C |
| Log scale without minor ticks | **never stands** (ADR-0001, 0032, 0059) | The Instead holds; minor ticks and one tick per decade are explicit `ticks` (`log10` of 1-9 per decade, the minors without a label). The recipe goes into the example. | S · spec C |
| Pie and donut via `pareto()` | **never stands** (ADR-0059) | The caveat falls away: a `pareto()` entry carries `share`, so `<Bar value="share">` on an axis in `"percent"` (spec of [15](15-number-formats.md)) shows shares without the cumulative line or a second axis. One line in the Pareto example. | S · spec C |

**Specs these become** (agent):

- **A - small charts additions** (one spec): a side legend, `maxGap`, month ticks under bars, `bin` over
  `ArrayLike<number>`. No ADR; each is a prop or a rule, cheap to keep.
- **B - a floating bar** (one spec): `baseline` on `Bar`, with the waterfall and the error-bar examples. No
  ADR; `CONTEXT.md` **Baseline** amended.
- **C - recipes in the charts demo** (one spec, examples only): follow the live edge, fit line, density as a
  `Matrix`, small multiples, columns as input, per month, pens, log minor ticks, shares from `pareto()`.
- **D - reading a matrix** (one spec): the colour bar and cell labels, with the label-colour decision.

## Answer

Decided 2026-10-25 by the maintainer: the proposed answer above, as it stands. It becomes four specs: small charts additions (A), the floating bar (B), reading a matrix (D) and recipes in the charts demo (C).
