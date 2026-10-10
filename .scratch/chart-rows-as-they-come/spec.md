# A chart reads its rows as they come

Status: ready-for-agent
Date:   2026-10-10
Origin: the maintainer's reading of the Bar examples, 2026-10-10 - "too many
extra functions are needed to make the data usable" - and the research that
followed, `docs/research/chart-data-input-2026-10/`. Reopens ADR-0002 and
ADR-0032 in one point each; the decision is to be written down as ADR-0051 by
the first ticket.

## Problem Statement

A developer who has rows - cost centres with a spend, days with minutes late,
services with a response time - cannot hand them to a chart. The x axis reads
numbers only, so before a single bar stands the caller has to

- compute a position for every row (`findIndex`, `(_, i) => i`, or a `place`
  field added to the rows for the chart's sake),
- list every position again as `ticks`,
- and write a `tickFormat` that looks the name up by that position.

Three pieces of code to say "one bar per cost centre". 22 of the 71 examples
and scenarios of the charts demo carry exactly this idiom, on x for bars, boxes
and a Pareto, on y for the rows of a matrix and the lanes of a state band.

Time is the second place. A `time` axis reads milliseconds as a number; rows
that hold a date as the API sent it - an ISO string - or as a `Date` need a
function first. 42 of the 71 files convert instants by hand.

The examples make it look worse than it is, and that is a problem of its own:
58 of the 71 files open with a seeded random generator and a small world of
ledgers and tours, so that in the five Bar examples the chart itself begins
between line 42 and line 83. A reader who came to see how a bar chart is
declared reads a data factory first and concludes that this is what the library
asks for.

The research (17 libraries, October 2026) puts a number on the intuition. No
library examined asks a caller for a per-row index, a tick list and a name
lookup; every one takes the category value itself. Every one accepts more than
milliseconds on a time axis. What umriss asks beyond that - one declared series
per element, sums computed before the chart, rows sorted along a numeric x - is
what the React libraries and most configuration-driven ones ask as well. So the
first two duties lie below the common floor, and only those.

The research also removes the reason the duty was put on the caller. ADR-0002
refused a band scale because it would have needed a second hit model and a
second path from domain to pixel. ECharts, Chart.js and Highcharts do not use
one either: a category is a whole-number position in front of a linear scale,
and the library keeps the map. uPlot stood where umriss stands and moved
("an additional 1-3k with no perf impact"). The affine scale, the sorted
`Float64Array` and the binary search can all stay; what changes is who counts.

## Solution

A chart reads its rows as they come. The caller names the field; the library
finds out what it holds.

- **A category is a value.** `<XAxis value="costCentre" />` over rows whose
  `costCentre` is a string gives one place per distinct category, a tick under
  each and the category as its label. No position, no `ticks`, no `tickFormat`.
  Where the rows hold a key and not a name, `categoryLabel` says what is
  written for it.
  The same holds on y: a `Matrix` whose `value` reads a string has a named row
  per category, and a `StateBand` names its `lane`.
- **The order is the rows' order, or the caller's list.** Categories stand in
  the order in which they first occur. `categories` on the axis fixes the order
  and the extent; a category on the list that no row carries keeps its empty
  place.
- **An instant is a value.** A field holding a `Date` puts its axis in time
  without `time` being said. With `time`, a string is read as an ISO 8601
  instant. Milliseconds stay what they were, and stay the fast path.
- **A place the caller names may be a `Date`.** A fixed `domain` and a limit
  along a time axis take a `Date` as well as milliseconds.
- **Nothing is taken away.** Numeric positions with `ticks` and `tickFormat`
  keep working: they are the numeric axis, and some axes are numeric. The
  change is additive, and the examples move because they are the proof.
- **The examples start with the chart.** An example that draws one mark per
  category writes its rows out as an API would deliver them. A generator stays
  only where the amount is the point.

What stays the caller's, said plainly rather than left as a gap: one element
per series, sums and other aggregates, and rows sorted along a numeric or time
axis.

## User Stories

### Categories on x

1. As a developer with rows that name a category, I want to give the x axis the field that holds it, so that I do not compute a position per row.
2. As a developer, I want every category to get its tick and its name without my listing ticks, so that the axis is declared in one prop.
3. As a developer, I want the category itself to be the tick's label, so that I do not write a lookup from position to name.
4. As a developer whose rows hold a key - a cost centre's number - I want to say once what is written for a category, so that the field stays named by its name and two categories may share a label.
5. As a developer, I want categories to stand in the order my rows bring them, so that a list I sorted myself stays sorted.
6. As a developer, I want to fix the order with a list of my own, so that months stand as months and not as the data happened to arrive.
7. As a developer, I want a category on my list that has no row to keep its empty place, so that a week with a missing day still reads as a week.
8. As a developer, I want a row whose category is not on my list to be left out and named in a DEV warning, so that a typo does not silently add a bar.
9. As a developer, I want a row without a category - `null`, `undefined` or an empty string - to be left out as a point without a place is today, so that incomplete rows do not break the chart.
10. As a developer, I want the rows of a category axis to be accepted in any order, so that two series bringing the same categories in different orders both land in the right places.
11. As a developer, I want a DEV warning where one series names the same category twice, so that I learn of rows I forgot to add up.
12. As a developer, I want several bar series on a category axis to stand side by side and to stack as they do on a numeric axis, so that grouping and stacking need nothing new.
13. As a developer, I want a line on a category axis to stand at the middle of each category, so that a bar and a line mix as they do today.
14. As a developer, I want box plots on a category axis, so that "response time per service" is declared with the service's name.
15. As a developer, I want `pareto()`'s entries to go onto a category axis by their `name`, so that the Pareto example loses its tick list and its lookup.
16. As a developer, I want a series that brings its own `data` to add its categories to the axis, so that "before" and "after" share one axis without a shared index.
17. As a developer, I want hiding a series from the legend to leave every category where it stands, so that the chart does not reshuffle under the reader.
18. As a developer, I want a number field that I mean as a category - a year, a shift number - to become one by a function that returns a string, so that the rule stays "the type decides" and I can still say otherwise.
19. As a developer, I want a string that looks like a number to be a category and nothing else, so that the chart never guesses from what a value looks like.
20. As a developer, I want a DEV error where the series of one axis bring strings and numbers, so that a mixed axis is found at once and not as a strange picture.

### Categories on y

21. As a developer drawing a matrix, I want its `value` to read a string field, so that the rows of the matrix are named by the data and not by an index with a tick list.
22. As a developer, I want the first category of a y axis to stand at the top, so that the matrix reads like the list it came from.
23. As a developer drawing state bands, I want to name the lane a band occupies, so that I do not compute `laneFrom` and `laneTo` and a tick at the lane's middle.
24. As a developer, I want `categories` on the y axis as on the x axis, so that eight vehicles stand in the fleet's order whatever the data's.
25. As a developer, I want a state band named into a lane and a line on a numeric y axis to share a chart as they do today, so that "state under a course" stays one chart.

### Instants

26. As a developer whose rows hold `Date` objects, I want to name that field on the x axis, so that the axis is a time axis without `time` and without `getTime()`.
27. As a developer whose rows hold ISO 8601 strings as the API sent them, I want `time` to read them, so that JSON goes into the chart as it arrived.
28. As a developer, I want a string that is no ISO instant on a time axis to be left out and named in a DEV warning, so that one bad row neither empties the chart nor passes unseen.
29. As a developer with a week of seconds, I want milliseconds to stay accepted and to stay as fast as they are, so that the long-series figures do not move.
30. As a developer, I want to give a fixed `domain` as a pair of `Date`s, so that "today, midnight to midnight" is written as it is thought.
31. As a developer, I want a limit line or band along a time axis to take a `Date`, so that a release freeze is marked without arithmetic.
32. As a developer, I want a working calendar, zoom, the view and `setDomain` to behave exactly as before, so that nothing I keep or restore changes meaning.

### What the reader sees

33. As a reader, I want the tooltip to name the category under the pointer, so that I read "Marketing" and not "1".
34. As a reader using the keyboard, I want the readout and the chart's summary to name the category, so that walking the bars tells me where I am.
35. As a reader of the data table, I want the x column to hold the categories, so that the table says what the chart says.
36. As a reader, I want long category names to wrap and thin out as named ticks do today, so that a category axis is no worse laid out than the idiom it replaces.
37. As a reader, I want a category chart with no rows but a list of categories to show its axis and the empty state, so that "nothing yet" still looks like the chart to come.

### Types

38. As a TypeScript developer, I want a string field and a `Date` field to be accepted by the x axis' `value` and checked by name, so that a category axis is as type-safe as a numeric one.
39. As a TypeScript developer, I want a field that is neither number, string nor `Date` to be refused on an axis, so that an object never becomes a category by accident.
40. As a TypeScript developer, I want a series' `value` to stay a number field, the matrix's row excepted, so that a height cannot be a name.
41. As a TypeScript developer, I want a `value` function on the x axis to return a number, a string or a `Date` without an annotation, so that a computed category is as short as a computed number.

### Examples and documents

42. As a developer reading the Bar page, I want the chart on the first screen of every example, so that I see the declaration before any data.
43. As a developer, I want the rows of a small example written out as an API would deliver them, so that I recognise my own data in them.
44. As a developer copying an example, I want it to run as copied, so that the rule every example already keeps still holds.
45. As a developer, I want the first chart of the installation page to read ISO strings, so that the first thing I learn is that my JSON works.
46. As a developer with long rows - one row per service and hour - I want an example that turns them into one series per service with the platform's own grouping, so that I know the two lines it takes and that it is mine to write.
47. As a developer, I want an example that fixes an order and shows an empty place, so that `categories` is seen once before I need it.
48. As a coding agent reading `llms.txt`, I want the generated text to show the short form, so that generated charts stop carrying the idiom.
49. As a reader of the capability record, I want every new promise listed with what proves it, so that the record stays complete.
50. As a reader of ADR-0002 and ADR-0032, I want both to point at the ADR that reopened them, so that "no category scale" is not read as the current answer.
51. As a reader of the glossary, I want **Category** and **Category axis** defined, so that the word has one meaning in the workspace.
52. As a maintainer, I want every promise that held before to hold unchanged for numeric positions, so that no caller is forced to move.

## Implementation Decisions

### The decision, and the ADRs it touches

- **D1. A category axis is the numeric axis with the library keeping the map.**
  Each distinct category gets a whole-number position; materialisation writes
  that position into the x channel, as it writes working time there today
  (ADR-0001). Scale, step, hit-testing, stacking, zoom and downsampling read
  numbers and do not change. This is what ADR-0002 already draws; the ADR's
  consequence "labelled categories must be supplied as numeric positions with
  a `tickFormat` that names them" is what falls.
- **D2. ADR-0051 records it and supersedes in part.** ADR-0002 stands in its
  title and its architecture - bars sit on a numeric axis, no band scale - and
  loses that one consequence. ADR-0032 keeps "no log scale" and "no band
  scale" and loses "for categories, their index on x". Both receive a pointer;
  neither is rewritten (ADR-0032: "superseded, not edited").
- **D3. Additive.** Numeric positions with `ticks` and `tickFormat` remain a
  supported way to label an axis, because a numeric axis with named ticks is a
  real thing (an hour axis, a lane grid). Nothing is removed or deprecated;
  the charts get a minor version.

### What kind an axis is

- **D4. The type of the value decides, never its content.** Per axis, in this
  order: `categories` given - a category axis; `time` or `calendar` given - a
  time axis; otherwise the first value read that is a place decides: a string
  makes a category axis, a `Date` a time axis, a number a numeric axis. A
  string that looks like a number is a category; a number that looks like a
  year is a number. No heuristics on content - the research names them as the
  commonest trap of the libraries that guess (Plot's integers between 1500 and
  2500, Vega-Lite's refusal to infer at all).
- **D5. One kind per axis.** Where the series of an axis bring values of
  different kinds, DEV reports it naming the series; in production the values
  that do not fit the axis' kind are not placed. A number on a category axis
  is not a position.

### Categories

- **D6. Order.** Without `categories`: first occurrence, the series taken in
  registration order and each one's rows in the order given. With
  `categories`: the list, complete - it is the order and the extent.
- **D7. Hidden series keep their categories.** The categories of an axis come
  from every series registered on it, shown or hidden.
- **D8. Empty places and strangers.** A listed category without a row keeps
  its place. A row whose category is not on the list is not placed, and DEV
  names it. A row whose category is `null`, `undefined` or `""` is not placed,
  silently, as a point without a place is today.
- **D9. Row order is free on a category axis.** The materialised series is in
  axis order whatever order the rows came in; a hit, the tooltip and a `value`
  function's `index` refer to the caller's row. On numeric and time axes the
  rows stay sorted by the caller and the DEV check stays - the line Highcharts
  draws as well, and the one that keeps a control chart's baseline an index
  range of its rows.
- **D10. Twice the same category in one series** is drawn as two equal x
  values are today, and DEV names the series and the category.
- **D11. The category is its label, unless `categoryLabel` says otherwise.**
  Both axes take `categoryLabel`, a function from the category to what is
  written for it; it is compared as `tickFormat` is. It exists so that a row
  holding a key does not push `value` into its function form - the weaker one,
  compared by source text (ADR-0048) - and so that two categories may share a
  label. `tickFormat` keeps its one job, a number or an instant, and with
  `ticks` and `tickCount` does not apply to a category axis; given there, DEV
  says so. A second prop rather than a second meaning of the first, as a
  channel is named and never overloaded (ADR-0011).
- **D12. Extent and view.** A category axis spans its positions with half a
  step at either end. `zoomable` works as on any axis; the view holds spans in
  positions, as numbers, and is not translated when the categories change. A
  fixed `domain` pair on a category axis is positions.
- **D13. On y.** A y axis reads no value (ADR-0048); it becomes a category
  axis through the series bound to it: a `Matrix` whose `value` reads strings,
  or a `StateBand` given a `lane`. `YAxis` takes `categories` as `XAxis` does.
  The first category stands at the top.
- **D14. A state band's lane by name.** `StateBand` gains `lane`, a category
  of its y axis; the band occupies that category's place, as wide as a bar is.
  `laneFrom` and `laneTo` stay for a numeric axis; a band takes one way or the
  other. The state itself stays a number (ADR-0007).

### Instants

- **D15. A `Date` implies time.** A value that is a `Date` is read as its
  milliseconds, and its axis is a time axis as if `time` had been set.
- **D16. With `time`, a string is an ISO 8601 instant,** read by the
  platform's parser. What does not parse is not placed, and DEV names the
  series and the row. Without `time` a string is a category (D4) - a time
  axis from strings is always said. The platform's rule is the rule, and the
  prop's comment states it: a date with a time and no offset is local time, a
  date alone is UTC. Where every category of an axis reads as an ISO instant
  with a time, DEV asks whether `time` was meant - the one place content is
  looked at, and only to warn.
- **D17. Numbers stay the fast path.** The reading of a `Date` or a string
  happens once, in materialisation. The figures of the capability record for
  long series are promised for numbers.
- **D18. Places the caller names.** A fixed `domain` pair on a time axis and
  the values of `LimitLine` and `LimitBand` along a time axis take a `Date` as
  well as a number. The view, `setDomain`, `zoomLimits`, the working calendar
  and what `tickFormat` is handed stay milliseconds: they are kept, compared
  and serialised.

### Types

- **D19. What `value` accepts.** On `XAxis`: a field holding a number, a
  string or a `Date` (or absent), or a function returning one of them. On
  `Matrix`: a number or a string field. On every other series, and on every
  named channel (ADR-0011), a number as today. The forms are exported as
  types, at the end of the entry by the workspace's rule for new exports.
- **D20. The field name is still compared by its name** and a function by its
  source text (ADR-0048); nothing about identity changes.

### What the reader is told

- **D21. One label path.** The tooltip's x, the keyboard readout, the summary
  for screen readers and the data table's x column write a category axis'
  values as the tick labels write them - the category, or what `categoryLabel`
  makes of it - and a time axis' as today.

### The examples

- **D22. No example names a category through positions.** All 22 files that
  carry the idiom move: Bar, BoxPlot, Pareto, the matrix's rows, the state
  bands' lanes, and scenarios 02, 03 and 04.
- **D23. Small examples write their rows out.** An example that draws one mark
  per category - the Bar, BoxPlot and Pareto examples and the charts of
  scenario 03 - holds its rows as literals, shaped as an API would deliver
  them, with the numbers it draws today so that a moved picture is the axis'
  doing. A generator stays where the amount is the point: a day of minutes, a
  week of seconds, the benchmark.
- **D24. Instants as they arrive.** The installation page's first chart reads
  ISO strings; one example on the Axis page reads `Date`s; the long series
  keep milliseconds.
- **D25. Two new examples.** On the Axis page, `categories`: a fixed order and
  an empty place. On the Chart page, series from long rows: the platform's
  grouping and one series per group, each with its own `data`.
- **D26. Every example still runs as copied.** The own-data rule is not
  loosened.

### Documents

- **D27.** ADR-0051; the pointers in ADR-0002 and ADR-0032; **Category** and
  **Category axis** in the glossary, and the glossary's sentence on the lane
  extended by the named lane; the capability record's rows; the charts'
  changelog; the props comments of the axes, `Matrix` and `StateBand`. The
  text for coding agents follows from the demo.

## Testing Decisions

A good test here states what a caller hands in and what a reader is told:
rows and a declaration in, tick labels, tooltip text, table rows and hits out.
It does not ask which array holds the map or when it is built. The seams are
the three that exist; none is added (confirmed with the maintainer,
2026-10-10).

- **The chart mounted through `useChart`, in jsdom** - the highest seam, and
  the one most of the stories are proved at. Prior art: the jsdom tests that
  mount with the shared chart helper and read the tooltip, the readout and the
  data table (tooltip format, data table, stacking, keyboard). The axis labels
  are HTML, so tick labels are read as text. Covered here: the category as
  tick label, tooltip, readout, summary and table cell, and the same through
  `categoryLabel`; order by first
  occurrence and by `categories`; an empty place; a stranger and a duplicate
  with their DEV warnings; a hidden series keeping its categories; grouped and
  stacked bars and a line on a category axis; the matrix's named rows and
  their order from the top; a state band in a named lane; a `Date` field
  without `time`; ISO strings with `time`; an unparseable string; a `Date` in
  `domain` and in a limit; a mixed axis reported.
- **The types, compiled** - prior art: the file of `@ts-expect-error` lines
  for `useChart` and `value`. The line that today refuses a string field on
  the x axis turns into an accepted one; new lines hold what D19 refuses: an
  object or boolean field on an axis, a string field as a bar's height.
- **Materialisation, as a pure module** - prior art: its unit tests over
  typed arrays and extents. Covered here: positions from categories, the
  series in axis order from rows in any order with the row index kept,
  placeless categories as gaps outside the extent, instants from `Date` and
  from strings, and the channels a kind does not use still `null` (ADR-0011).
- **The demo** - the smoke test over every page and example, the own-data
  check, and the screenshots. Pictures of the migrated examples are expected
  to move at the axis and nowhere else; each moved baseline is looked at
  before it is accepted. The interaction suite keeps passing unchanged, which
  is the proof that hits and keys did not notice.
- **The full check before release** as the workspace runs it: lint, types,
  unit, build, visual.

## Out of Scope

- **A band scale and a log scale.** Every scale stays affine (ADR-0001); a
  category axis is positions on it.
- **Series derived from a field of long rows.** One element per series stays.
  All nine React libraries examined ask the same, and the platform groups rows
  in one call; D25 shows it. It is the first thing to reopen if the examples
  still read as heavy.
- **Aggregation in the chart.** Sums, counts and means are computed before the
  chart, for the reason ADR-0032 gives for the pivot. Only the two grammars
  aggregate, and Plot argues it for exploration.
- **Sorting rows along a numeric or time axis.** The caller's, with the DEV
  check; see D9. The research report ranks "notice and sort, keep sorted as
  the fast path" third and calls the bare message the weakest of the three
  ways. It is left out because a control chart's baseline is an index range
  of the rows as given, and because no example sorts for the chart's sake;
  it is the second thing to reopen.
- **Sorting categories by value.** `pareto()` does it for the case the
  library knows; otherwise the rows' order or `categories`.
- **A limit at a category,** and `categories` or a named lane on `LimitBand`.
- **States by key.** A state stays a number (ADR-0007); a row that holds the
  state's name maps it in `value`.
- **Horizontal bars, pie and the rest of ADR-0032's list.** Untouched.
- **`@umriss-ui/schedule` and `@umriss-ui/core`.** The schedule takes only the
  charts' arithmetic (ADR-0022); core's demo has two charts and neither
  carries the idiom.
- **Rewriting every example's data.** D23 names the examples that move. The
  other generators stay; whether the examples of long series should share less
  of a world is a question for the demo, not for this spec.

## Further Notes

- **The research** stands in `docs/research/chart-data-input-2026-10/`: the
  React libraries, the grammars and configuration-driven libraries, the
  mechanics of category and time axes in the canvas libraries, and what
  callers report. Three findings carry this spec: no library asks for the
  index idiom; ECharts, Chart.js and Highcharts keep a category as a whole
  number in front of a linear scale; and the most-reacted comment found on
  the subject (192 reactions, on a Recharts issue) is a workaround for time as
  `getTime()` numbers with a tick formatter. The report that draws them
  together was written in German for the maintainer and is not in the
  repository; where it and this spec differ - it would also sort numeric rows
  and sees a series channel as a later ADR - Out of Scope says why. What the
  research did not find:
  survey data on why developers choose a chart library, and any written
  defence of wide rows by the React libraries - the spec leans on neither.
- **`useChart(rows)` is not in question.** Recharts 3.8 (March 2026) arrived
  at a factory returning typed components for the reason ADR-0048 gives, and
  Chakra ships a hook of the same name. The declaration is mainstream; the
  numeric-only axis was the outlier.
- **Where the cost sits,** by the other libraries' own account: not in the
  scale but at the edges - what a number means on a category axis (D5 answers
  it: nothing), duplicates and series covering different categories (D8,
  D10), and zoom on categories (D12 keeps positions and adds no snapping).
- **The tickets,** each ending green and shown by an example
  (`issues/`):

  | Ticket | Scope | Blocked by |
  |---|---|---|
  | 01 | ADR-0051 and the glossary; a category on x by first occurrence, rows in any order; one Bar example as the tracer | - |
  | 02 | `categories` and `categoryLabel`: order, empty places, strangers | 01 |
  | 03 | Categories on y: the matrix's rows, the state band's `lane` | 02 |
  | 04 | Instants: `Date`, ISO strings with `time`, `Date` in `domain` and limits | 01 |
  | 05 | Examples: Bar, BoxPlot, Pareto, with their rows written out | 01 |
  | 06 | Examples: the months, the scenarios, series from long rows | 02, 03 |
  | 07 | Documents and release | 01-06 |

- **The one place that is more than a reading rule** is D9: how a hit and a
  `value` function's `index` find the caller's row once a series is held in
  axis order. Ticket 01 settles it first.
