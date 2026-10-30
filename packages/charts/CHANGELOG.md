# Changes to `@umriss-ui/charts`

This document describes what changes for **callers** of the package: exports,
props, behaviour.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. The seven packages are released in step, and a rename
keeps its old name for one further minor, with a warning, before the minor after
it removes the name ([the upgrade promise, ADR-0066](../../docs/adr/0066-one-number-peers-over-the-minor-a-rename-lives-one-minor.md)).
**Whatever changes existing behaviour stands under a heading "Changed" of its
own**, no matter which digit rose, with a `Migration:` line. Whoever reads only
one section before an upgrade reads that one.

From 0.34.0 the packages share one number - five, six from 0.40.0, when the dashboard joined, and seven from 0.47.0, when alarms joined: they are released together, and a package without a change of its own still gets a heading for it.

**Names read forwards.** Where an entry describes a name that has since been
renamed, it is named here as it is called today; names that were removed stand
as they stood.

The versions 0.1.0 and 0.2.0 were reconstructed afterwards, out of the
specs; the document itself came into being only with
`library-audit` 08. They are grouped by unit of delivery, not by commit, and were
never published.

**Release candidates.** `0.3.0-rc.0` and `0.3.0-rc.1` were the two versions on
the registry, under the tag `next`. With `0.3.0` that is over: the tag is gone
and `pnpm add @umriss-ui/charts` is the whole install line. A release candidate
promised nothing a `0.x` does not already fail to promise; it said the
interface was still expected to move before `0.3.0`.

---

## 0.51.0 – A page is what its frame holds: a table fills its pane, the pager says the range (Oct. 2026)

No change of its own; the number moves with the other packages (ADR-0066).

## 0.50.0 – Straightened: dialogs focus without React's internals, tables work per change, the edges 0.49.0 left (Oct. 2026)

No change of its own; the number moves with the other packages (ADR-0066).

## 0.49.0 – The second shakedown: lists that shrink, a flood that scrolls, five things the table lacked (Oct. 2026)

### Added

- **`ChartsWordingProvider`** takes a partial `ChartsWording` and sets it for every chart below it, one inside a dashboard widget included; a chart's own `wording` still wins. Charts still depend on nothing: an application with core and charts sets both providers (ADR-0031 amended).

### Fixed

- **A bar chart's value axis** ends one step above a largest bar that sits exactly on a tick, in the step the data gave, so the bar no longer touches the top; a normalised stack keeps its axis at 100 %.
- **README links resolve on npm**: links to files the package does not ship point to the repository on GitHub.

## 0.48.0 – Released in step with core (Oct. 2026)

No change of its own; the number moves with core's touch scale, now an opt-in (ADR-0079): a `md` control of core stays 32 px under a finger unless the application imports `@umriss-ui/core/touch-scale.css`.

## 0.47.1 – Released in step with the table (Oct. 2026)

No change of its own; the number moves with the table's repaired exports.

## 0.47.0 – Released in step with alarms (Oct. 2026)

No change of its own; the number moves with the new package `@umriss-ui/alarms`.

## 0.46.0 – A floating bar, a legend beside the plot, and recipes (Oct. 2026)

### Added

- **`Bar` takes `baseline`** and floats from it to its value, either way up, so a waterfall is a running sum and one `Bar`, and error bars are a thin `Bar` beside a `Scatter`. In a stack the stack below stays the foot. **`TooltipPoint.baseline`** carries the lower edge of a `Bar` or an `Area` outside a stack.
- **`Legend placement` takes `"left"` and `"right"`:** the names stand in a column beside the plot, at most a quarter of the chart wide, long names wrapping, scrolling where they do not fit; in a chart narrower than 480 px the legend stands above the plot.
- **`Line` and `Area` take `maxGap`**, the longest step between two readings still drawn through (milliseconds on a time axis): a longer step breaks the line or closes the area, a step hold ends `maxGap` after its reading, and a pointer farther than `maxGap` from the nearest reading finds no hit. A stack does not read it.
- **A gradient-coloured `Matrix` shows a colour bar in its legend** - the gradient's steps (hatched under `encoding="marks"`), the range's ends and the inner edges where they fit, in the matrix' `format`; the entry's accessible name gains the range through the new wording entry `levelRange(from, to)`. An assessment colouring keeps its chip.
- **`Matrix` takes `labels`**: each cell writes its level in the tick size, in the text colour over a halo of the ground colour, legible on every stop in both themes and in forced colours; a cell too small for its text, and a hole, stay bare.
- **Recipes in the demo** for what the parts already answer: follow the live edge with a pause (Zoom and pan), a fit line with its band and density instead of opacity (Scatter), columns instead of rows (Chart), small multiples on one y domain, minor ticks on a log axis and a trend with pens (Axis), sums per month and error bars (Bar), shares instead of counts (Pareto). The capability record's "Out" entries point at them.

### Changed

- **On a time axis that carries a `Bar` or `BoxPlot`, the tick step is never shorter than the bars' step**, so monthly bars are labelled by month instead of by weeks no bar stands on.
  - Migration: explicit `ticks` restore the old ticks.
- **The tooltip and the readout of an area corridor name both edges**, "baseline – value", as its data table does.
  - Migration: nothing changes unless a tooltip `render` wants the old text; it reads `yValue`.
- **`bin(values)` accepts any `ArrayLike<number | null | undefined>`**, so a `Float64Array` compiles and counts as a plain array does.
  - Migration: nothing changes.

### Fixed

- **A series whose function changes together with the chart's rows** (new rows memoised on outer columns) no longer gets the development warning about a function that reads a changed outer value.

## 0.45.0 – A chart in a named time zone (Oct. 2026)

### Added

- **`timeZone` on `Chart`** draws every time axis, a calendar axis included, in an IANA zone (ADR-0076): ticks stand on that zone's hours and midnights, and the labels, tooltip, readout, data table and summary write its time. Where the reader's zone is another, the axis title names it. An application on core passes `useFormats().timeZone`.
- **`localOffset(instant, timeZone?)` and `workingTimeTicks(…, offset, timeZone?)`** take the zone as an optional last argument; no existing call changes meaning. **`inDoubledHour(instant, timeZone?)`** says whether an instant lies in the hour a clock change doubles.

### Changed

- **The hour a clock change doubles is ticked twice** on a time axis, each label, tooltip and readout carrying its offset (`01:00 GMT+2`, `01:00 GMT+1`), and ticks below a day stand on the zone's whole multiples in real time.
  - Migration: none needed; only an axis across the autumn change shows the second tick.

## 0.44.0 – A range a reader marks, and a picture of the chart (Oct. 2026)

### Added

- **`onRange` on `useChart` reports a stretch the reader marks** (ADR-0074): `{ axisId, from, to }` once, on release - Alt with a drag where an x axis zooms, a plain drag where none does, and Space on the keyboard (start, then end; Escape or blur cancels). `from` is never after `to`; a category axis reports the first and last category covered (`ChartRange<string>`), a time axis milliseconds, a calendar axis wall-clock instants. A band shows while the pointer is down; a chart with `onRange` holds no range and draws none after release (the application hands it back as `initialView` or a filter). The polite region reads the start and the range; `onRange` without a `Tooltip` warns once in development. Two examples: Mark a range (Zoom and pan) and Mark a range of bars (Bar).
- **`useChart` hands over `toPng()`** (ADR-0075): a PNG of the plot and its axes on the chart's ground, at least twice its CSS pixels, with the legend and its chips, the limits' labels and marks and the axis breaks.
- **A chart prints at the width the printed page leaves it,** its axes where its marks are, and returns to its screen width afterwards.
- **Development warnings,** once each: a series past the palette's last colour without `color` or `tone` repeats an earlier series' colour; a function held for its source text that reads a changed outer value is probed on the first 1,000 rows and warns, naming the series and the two ways out; rows that are not an array read as none, and the warning names what arrived.

### Changed

- **`ariaLabel` on `Chart` is removed;** 0.43.0 renamed it `aria-label`.
  - Migration: write `aria-label` (TypeScript flags every use of `ariaLabel`).
- **`ChartsWording` has three new required keys,** `rangeStarted`, `rangeMade` and `rangeHelp`, in English and German.
  - Migration: a wording written out in full adds them, as it did for `selectHelp`; one built on the shipped wording needs nothing.

## 0.43.0 – A chart's root, and Intl's options for its numbers (Oct. 2026)

### Added

- **A series' `format` and an axis' `tickFormat` also take `NumberOptions`** - the options of `Intl.NumberFormat` plus `decimals` - written in the wording's locale and compared by value, so an equal inline object does not relabel the axis (ADR-0069). On an axis the step's places stay unless the options set digits, so a currency axis reads "€0", "€500", "€1,000". The tooltip, the data table, the limit rows, the readout and the spoken text follow.
- **An example drills down from years to months to days over `onSelect`**, the stack of levels in the application's state: the chart keeps no level (ADR-0056).

### Changed

- **`Chart` takes the attributes of a `<div>` and a `ref`** (ADR-0068): `ref`, `id` and `data-*` reach the root element - `data-*` was dropped silently before - and `aria-label` and `aria-labelledby` name the plot. A caller's `aria-describedby` now comes after the plot's own summary.
  - Migration: nothing to change for a ref or a class; a test that looked for the caller's description first finds the summary's id first.
- **`ariaLabel` on `Chart` is renamed `aria-label`.** `ariaLabel` stays as a deprecated alias and warns once in development; 0.44.0 removes it. `aria-labelledby` pointing at a heading satisfies the name too.
  - Migration: write `aria-label`, or point `aria-labelledby` at a heading.
- **The built-in number formats no longer write a negative zero:** -0.0004 on a one-place axis reads "0.0".
  - Migration: nothing to change; a test that expected "-0" reads "0".
- **Under a finger the legend entries and the show-all key are hit in a square of 24 px**, and the legend's row gap becomes 10 px so one line's pads do not cover the next line's entries (ADR-0070).
  - Migration: nothing to change; under touch a wrapped legend stands 2 px taller per line.

## 0.42.0 – A chart under test in jsdom (Oct. 2026)

### Added

- **A chart is testable in jsdom.** The new "Testing" section gives the Vitest and Jest lines in full - a charts-only application installs no core - with a setup file whose ResizeObserver reports a fixed size and whose `getContext` stub keeps jsdom quiet; `.` and `./wording/de` carry a `default` condition for Jest's resolver. The release check runs a test of a legend and the data table from those blocks under both runners.
- **The README names `--u-chart-1` to `--u-chart-6`** as the palette a brand changes, beside core's brand file.
- **TypeScript 5.4 or newer**, stated in the Install section (the declarations use `NoInfer`); the release check compiles a strict consumer under 5.4 as well as the current TypeScript.

## 0.41.1 – The documentation runs where the code is (Oct. 2026)

### Changed

- **The documentation is no longer hosted.** The site on GitHub Pages is gone, and the package's `homepage` now names its README on GitHub. The running documentation of this version opens from a checkout of the tag `charts-v0.41.1` with `pnpm install` and `pnpm start`, at `http://localhost:4170/umriss-ui/` - the repository README says how, under "See it running".
  - Migration: nothing to change; a bookmark or link to the old hosted site no longer resolves - open the documentation from a checkout of the tag, as described above.
- **`docs/llms-full.md` in the package stands on its own:** a link to another page points at that page's heading in the same file, a link to a place on the site that the file does not hold keeps only its text, and ADR-0032 is linked at this version's tag.
  - Migration: nothing to change; look at any tool that read `docs/llms-full.md` and followed its links to the site, which now find the heading in the same file.

## 0.41.0 – Limits read as values, and Jest loads the charts (Oct. 2026)

### Fixed

- **A y limit in the tooltip, the readout and the summary is written as a value of its axis**, not rounded to the tick step: a limit of 0.5 on an axis ticking in whole numbers read "1".
- **Jest loads the package.** The development flag read `import.meta`, which a CommonJS test runner cannot parse; it is `process.env.NODE_ENV` now. `@umriss-ui/charts/wording/de` resolves its types under `moduleResolution: node10`.

### Changed

- **Development warnings fire in a Vite dev server** - a chart without `ariaLabel`, for one. They never showed before, because the flag read `import.meta`.

## 0.40.4 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.3 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.2 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.1 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.40.0 – No change of its own (Oct. 2026)

Released with the other five packages under their one number. No change of its
own.

## 0.39.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.38.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.37.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.36.0 – No change of its own (Oct. 2026)

Released with the other four packages under their one number. No change of its
own.

## 0.35.0 – React 19 is the floor, and a zoomed chart draws what it shows (Oct. 2026)

### Changed

- **React 19 is required.** The peers `react` and `react-dom` are `>=19`; `0.34.0` is the last version that serves React 18.

- **The package ships ES2022 syntax.** An application that serves older browsers transpiles it itself.

### Otherwise

- **Bars, a state band and a matrix draw what the view shows.** Zoomed into a small part of the data they still walked every value on each frame, as lines and areas do not. Bars and the state band are now drawn from the slice of their x that can show - where that x ascends; a series whose x does not is drawn whole - and a matrix leaves a cell outside the plot out of its path. Zoomed into a million points a draw takes 0.1 ms for bars and for a state band where it took about 50 ms, and 8 ms for a matrix. Scatter is unchanged: its rows often come unsorted, and every point of such a series is drawn.

---

## 0.34.0 – A view is set, not handed back, and one locale (Oct. 2026)

From this version all five packages carry one number and are released
together.

### Changed

- **Numbers, dates and times follow the wording, not the browser.** Numbers used to be formatted in `navigator.language` and time labels were fixed `en-GB`, so a German browser showed `1.204,5` on an axis under a core `Stat` reading `1,204.5`, and a German application got English month names. The wording now carries the locale as a new field `locale` - `"en-GB"` by default, `"de-DE"` in `@umriss-ui/charts/wording/de` - and every number, date and time the chart formats (ticks, tooltip, data table, what a screen reader hears) follows it. A partial wording without `locale` keeps the default; a `tickFormat` or `format` of your own still wins; the clock stays 24-hour. An application that relied on the browser's language for its numbers passes the German wording, or a wording with its own `locale`.

- **`initialView` is read once, and `setView` is new.** A different `initialView` on a later render is now ignored, as React ignores a changed `defaultValue`; it used to be applied whenever its content differed from the last one handed in. To go to a view later, call the new `setView(view)` that `useChart` returns: it applies a whole view, and what the view leaves out is shown whole again. `setView` is not reported through `onViewChange`, which reports what the reader did, so two charts kept in step by `onViewChange: (v) => other.setView(v)` in both directions do not answer each other. A caller that kept the reported view in state and handed it back as `initialView` writes `setView` instead: restoring a kept view is `setView(kept)`, and the state that mirrors the chart's view becomes `view` from the hook. `Echoes`, the rule that told a view reported and handed back late from one handed in, is no longer exported.

- **Ten exports and one dead member are gone.** `ruleOutlier`, `ruleRun`, `ruleTrend`, `ruleTwoOfThree`, `sigmaFromLimit`, `defaultRules`, `paretoDefaults`, `toWorkingTime`, `mapSeries` and `workingTicks` are no longer exported from the package; nothing in the library or its documentation asked a caller to import them. `ControlChart`'s `rules` prop is unchanged and still takes a `Partial<RuleOptions>`. The static `ChartScene.classTick` is removed as well. `workingCalendar`, `calendarFrom`, `toWallClock` and the other working-time helpers stay.

### Fixed

- **A bound without a finite value is no bound.** A limit of `Infinity` on the lower side, or `-Infinity` on the upper, counted as violated by every value; `@umriss-ui/core` already ignored such a bound, and the two now agree.

---

## 0.16.0 – A stack's total in the data table (Oct. 2026)

### Added

- **The unit tests run against React 18.3.1 and 19 in CI**, and the charts are rendered to a string in a test (`tests-unit/ssr.test.tsx`).

- **A stack's total in the data table.** The table of a stacked chart ends each
  stack's members with a "Total" column (German "Summe"): the sum of the
  stack's members at the row's x, written as the tooltip writes it - a
  normalised stack's members show their shares and its total the sum of the
  readings. A hidden member is out of the total. The charts demo shows it on
  the Tooltip page, "Read a stack's total in the table".

### Changed

- **Every entry begins with `"use client";`.** The built files `dist/charts.js` and `dist/wording/de.js` start with the directive, then the stylesheet import, so a bundler that splits server from client code takes each as client code. The directive is written to the built entries only; the sources are unchanged.

- **Every export is a client component.** A hook called in a Server Component now fails with React's message about a client reference, not one about `useState`.

---

## 0.15.0 – A chosen hit, a histogram, and zoom keys without a tooltip (Oct. 2026)

### Changed

- **A chart with a zoomable x axis is one tab stop even without a
  `<Tooltip>`** (ADR-0030). Its plot is `role="application"` with the role
  description "chart" and takes the focus, so `+`, `-`, Shift+←/→ and `0`
  reach a keyboard. There is no Active point to walk: the arrows without Shift
  do nothing. After a zoom or pan key the polite live region reads the span in
  view ("From 10 to 90."); the summary names the zoom keys and not the walk's.
  A chart with a tooltip, and one with neither, are unchanged.
- **The summary names the labelled limits.** A chart with a `LimitLine` or
  `LimitBand` that has a `label` adds "Limits: Objective 300 ms, Warning band
  250 ms – 300 ms." to the text the plot is described by - each value in its own
  axis' format, a band's two edges as one value. A limit without a label is left
  out; a chart without labelled limits reads as before. The wording has a new
  entry, `limitList`, so a custom `ChartsWording` needs it.

### Added

- **`bin()`**, the arithmetic behind a histogram: `bin(values, { width, count,
  domain })`, or `bin(rows, value, options)`, returns rows with `from`, `to`,
  the middle `x` and `count` for a `Bar` on a numeric x axis. The edges are on
  the 1-2-5 grid of the ticks; a value on an edge falls into the bin that edge
  starts, the last bin is closed, and what is not a finite number is skipped.
  A given `domain` is taken as it is, and values outside it are left out.
  Exports `Bin` and `BinOptions`. One example, "Count readings into a
  histogram", on the Bar page.
- **`<Tooltip limits />`**, off by default: the built-in tooltip adds one row
  per labelled limit of the hit's y axis, its label and value in that axis'
  format, and what a key reads out says the same. One example on the Tooltip
  page.
- **`onSelect`**, an option of `useChart(rows, { onSelect })`: a click or a tap
  on a hit, and Enter on the Active point, call it with the hit - the
  `TooltipHit` a custom tooltip's `render` receives, typed at the row. Once per
  click; the end of a drag that pans does not report, a double click reports on
  its first click and then resets the zoom as before. The chart holds no
  selection and draws none: what is chosen is the application's state. It
  needs a `<Tooltip>` for its hits (the development build warns without) and
  the hit does not travel over `syncId`. Where it is given, the summary names
  Enter; the wording has a new entry, `selectHelp`, so a custom
  `ChartsWording` needs it. `ChartOptions` takes the row type as a parameter
  (`ChartOptions<Z>`, default `unknown`). One example, "Choose a hit", on the
  Tooltip page.

---

## 0.14.0 – A chart reads its rows as they come (Oct. 2026)

A chart takes rows as an application has them (ADR-0052). A category is a
value: `<XAxis value="costCentre" />` over rows that hold a name gives every
distinct one a place, a tick and its label - no position computed per row, no
`ticks` listed, no `tickFormat` that looks the name up. An instant is a value:
a `Date`, or with `time` the ISO string an API sends. Numeric positions with
named ticks keep working as they did; nothing is taken away.

### Added

- **A category on the x axis.** `XAxis value` reads a string field or a
  function returning a string.
  - Every distinct category gets a place, in the order the rows first bring
    them - the series in the order they are declared, a hidden one included.
  - The category is its label: under the tick, in the tooltip, the keyboard
    readout, the summary and the data table.
  - The rows may come in any order; a hit and a `value` function's `index`
    still name your row. A row without a category is left out.
  - The type decides, never the content: `"2024"` is a category, `2024` a
    number. One axis has one kind; DEV names a series that brings the other.
  - Bars stand side by side and stack, a line stands on the middle of a
    category, zoom works in places.
- **`categories` on `XAxis` and `YAxis`**: your own list, which is the order
  and the extent. A category no row carries keeps its empty place; a row whose
  category is not listed is not drawn, and DEV names it.
- **`categoryLabel` on `XAxis` and `YAxis`**: what is written for a category
  where the rows hold a key and not a name. Two categories may share a label.
- **Categories along y.** `Matrix value` reads a string field, and the y axis
  lists a row per category; the tooltip names a cell's row. `StateBand lane`
  names the band's lane, a category of its y axis - instead of `laneFrom` and
  `laneTo`, which stay for a numeric axis; the compiler refuses both at once.
  The first category stands at the top. A series of numbers on a y axis that
  has categories is not drawn: one axis has one kind.
- **A `Date` on the x axis** puts the axis in time without `time`.
- **ISO 8601 strings with `time`.** A date with a time and no offset is local
  time, a date alone is UTC - the platform's rule. A string that is no instant
  is not drawn, and DEV names its row.
- **A `Date` where you name a place in time**: a fixed `domain` pair on
  `XAxis`, `value` on `LimitLine`, `from` and `to` on `LimitBand`.
- **Types**: `AxisValue`, `AxisField`, `OneLane`.

### Changed

- **A category axis spans its places with half a step at either end**,
  whatever stands on it. A line over categories therefore begins half a step
  inside the plot, where a line over the positions 0, 1, 2 began at its edge.
  Only an axis that reads categories is affected.
- **`tickFormat`, `ticks` and `tickCount` do not apply to an axis that reads
  categories**; DEV says so. They keep their job on a numeric and a time axis.

---

## 0.13.0 – A chart fills its frame, never below its floor (Oct. 2026)

### Changed

- **A `Chart` without `height` fills its frame** and never goes below 300 px
  (ADR-0050). Standing alone in a block it is 300 px tall, as before. In a
  frame taller than that - a stretched grid cell, a card the grid stretches, a
  container of definite height - it now takes that height, and follows the
  frame both ways as it grows and shrinks. A number still means a fixed height;
  a different floor goes through `style={{ minHeight }}`. The descriptions of
  `height` and `style` say so.

---

## 0.12.0 – A chart that is loading says so (Oct. 2026)

A chart takes `loading`, as the table does (ADR-0042). Over a course already
drawn, the course stays and dims. Over nothing to show, a silhouette of the
chart to come stands in the plot and shimmers, where the chart used to say
"No data" before the first rows. A chart without `loading` behaves exactly as
before.

### Added

- **`Chart loading`.** Over a course already drawn:
  - The course stays and dims after `--u-delay-stale`. A limit's label dims
    with its line; the axes stay as they are.
  - The plot takes no pointer until the answer is in: no tooltip, no drag, no
    wheel zoom. An open tooltip and a drag under way end when the reload
    begins.
  - A chart in a `syncId` group neither shares a position nor draws one.
  - The keys still walk and zoom, and the legend and "Show all" stay usable:
    they change the view, not the data.
  - Leaving, the course comes back at once.
- **The silhouette.** Over nothing to show (no rows, only gaps, or every
  series hidden), a quiet outline of the chart to come stands in the plot:
  - Columns for a bar or box plot, a soft wave for a line or scatter, the wave
    filled for an area, strips otherwise. The first series in drawing order
    decides.
  - One band sweeps across every shape at a constant speed, whatever the
    chart's width.
  - While it stands, `empty` waits, and the axes show no ticks: before its
    rows a chart has no range.
  - When the answer is laid out, the silhouette fades out and the course
    fades in. "No data" never shows in between.
  - With reduced motion it stands still and goes at once. Under forced colours
    its shapes take `GrayText`.
- **The plot is `aria-busy`** while the chart is loading, from the server's
  HTML on. The silhouette is hidden from a screen reader.
- **Four tokens** on `.uc-root`, each falling back on core's where it is
  loaded:
  - `--uc-delay-stale` (`--u-delay-stale`, 200ms): how long a reloaded course
    waits before it dims.
  - `--uc-silhouette`: the shapes' colour, 10 % of the text colour.
  - `--uc-ease-swell` (`--u-ease-swell`): the band's easing.
  - `--uc-fade` (`--u-duration-medium` and `--u-ease-out`): the fade between
    silhouette and course.

  The plot's `data-stale` and `data-arriving` are not part of the styling API
  (ADR-0045).

---

## 0.11.0 – A chart bound to its rows, with a view of its own (Oct. 2026)

Two efforts in one break, released together with `@umriss-ui/table` and
`@umriss-ui/schedule`. A chart is declared through `useChart(rows)`, as a
table is through `useTable`, and every series and axis reads its rows through
`value` - a field name the compiler checks, or a function (ADR-0048). And the
chart holds its own **view**: the span each zoomable x axis shows and the
hidden series, taken as a start and reported whole (ADR-0047) - zoom, the
legend's toggle and a way back cost a caller no state of its own any more. The
old shape is removed, not deprecated; the table below says what stands in
each place.

### Changed

**Moving over.** Every export and prop that went, and what stands in its
place:

| Was | Is |
|---|---|
| `import { Chart } from "@umriss-ui/charts"`, `<Chart data={rows}>` | `const { Chart } = useChart(rows)`, `<Chart>` without `data` - one `Chart` per `useChart`, a second chart is a second call |
| `import { XAxis, YAxis }` | `const { XAxis, YAxis } = useChart(rows)` |
| `import { Line, Area, Bar, Scatter, StateBand, Matrix, BoxPlot }` | the same names from `useChart(rows)`; a series with its own `data` is still one, typed by that `data` |
| `ChartProps<T>`, `ChartProps.data` | `ChartProps`, without a type parameter and without `data` |
| `accessor={(d: Row) => d.a}` on `Line`, `Area`, `Bar`, `Scatter`, `StateBand` | `value="a"` - a field name of the row, or a function where a field does not suffice; required |
| `XAxis accessor` | `XAxis value`; an axis over series that bring their own `data` names their row: `<XAxis<Row> value="t" />` |
| `YAxis accessor`, `YAxisProps<T>` | nothing - along y the series place their rows; `YAxisProps` has no type parameter |
| `Matrix accessor` (the row) | `Matrix value`, as the y position on every kind |
| `Matrix value` (the colour) | `Matrix level`; `MatrixSeriesConfig.value` is `MatrixSeriesConfig.level` |
| `TooltipPoint.value` of a matrix cell (its colour) | `TooltipPoint.level`; `yValue` stays the cell's row |
| `ControlChart accessor` | `ControlChart value`, a field name or a function |
| `hidden` on every series kind, `SeriesBase.hidden` | the view's `hidden`, by the series' `name`: `initialView: { hidden: ["…"] }`, or `toggleSeries`, `showOnly`, `showAllSeries` from `useChart` |
| `Legend onToggle` | nothing - the legend toggles by itself; the change arrives in `onViewChange` |
| `XAxis onDomainChange` | `XAxis zoomable`; the span arrives in `onViewChange` as `view.domains[axisId]` - a lone x axis is `"x"` |
| a zoomed `XAxis domain` handed back (controlled) | `initialView: { domains: { x: span } }` or `setDomain("x", span)`; `domain` stays the axis' configuration and is a zoomable axis' start |
| clamping the proposed domain in the handler | `XAxis zoomLimits={{ min, max }}`; without it at most the data's extent or the axis' own `domain`, whichever is wider, at least three data steps; a span equal to the axis' own domain is no part of the view |
| `AxisConfig.onDomainChange` | `AxisConfig.zoomable`, `AxisConfig.zoomLimits` |
| the type `Accessor<T>`, `ListAccessor<T>` | `ValueFunction<T>`, `ListFunction<T>` - the function form of `Value<T>` and `ListValue<T>`, same shape |

- **`Chart`, the axes and the series kinds are no exports of their own.**
  `useChart(rows)` hands them out, typed at the row; their props stay public
  types. `Tooltip`, `Legend`, `DataTable`, `LimitLine` and `LimitBand` read no
  row and are imported as before. A `Chart` taken from one `useChart` and
  drawn twice at once warns in DEV: it holds the view, and two charts are two
  calls.
- **`value` replaces `accessor` everywhere**, and is required on every series
  kind and on `XAxis`. A field name is checked by the compiler against the
  row's number fields; it is compared by its name, so a switched name
  redraws. A function is compared by its source text, as `accessor` was (see
  `docs/capabilities.md`, "Known limits"). The named channels - `baseline`,
  the box's five numbers, `mean`, `count`, the notch, `outliers` (a list
  field) - take a field name as well.
- **The legend toggles by default.** Every entry of a named series is a
  button with `aria-pressed`; a click hides or shows the series at once, a
  state's entry every band showing it. A series without a `name` cannot be
  hidden and its entry stays text. A legend that should not toggle has no
  switch; a caller who kept the legend static by leaving out `onToggle` now
  gets the buttons.
- **A zoom is the chart's own.** Wheel, pinch, drag and the keys move the
  span on an `XAxis zoomable` at once, within `zoomLimits`; nothing is
  proposed to the caller any more. The double click and the key `0` go back
  to the axis' own `domain` - before, they proposed the whole data range. A
  pan keeps its width and is not clamped; a view handed in or set is taken as
  given.
- **`ChartsWording` has three more keys**: `legendHelp`, `allShown` and
  `showAll`. A complete wording object of one's own needs them; a
  `Partial<ChartsWording>` handed to `Chart wording` does not. `zoomHelp`
  says what `0` does now: "0 goes back to the axis' own span." / "0 kehrt
  zum eigenen Bereich der Achse zurück."

### Added

- **`useChart(rows, { initialView, onViewChange })`** - the chart and its
  parts over the rows, each keeping its identity over the renders, with the
  chart's view and its setters: `view`, `domains`, `setDomain(axisId, span |
  null)` (`null` = the axis' own `domain`), `hidden`, `toggleSeries(name)`,
  `showOnly(name)`, `showAllSeries()`.
  - `initialView` is the view to start from, and to go to whenever one
    differing in content from the last one handed in arrives; the same view
    again changes nothing, and what it leaves out is reset. Axis ids and
    series names the chart does not carry fall out. **A known limit:** a view
    handed in that equals one the chart reported less than a second ago, and
    that has not come back yet, is taken for the chart's own report coming
    back late and is not applied - so that two charts in step do not jump back
    mid-pan. An application that restores a just-reported view within that
    second sees no change.
  - `onViewChange(view)` hears every change of the view once, always the
    whole view, a pan or zoom at most once per frame; not the view the chart
    starts with. Charts keep in step by handing each other what they report;
    `syncId` keeps sharing the pointer only.
- **`XAxis zoomable` and `zoomLimits: { min, max }`** - zoom and pan by Ctrl/⌘
  + wheel, pinch, drag, a horizontal or Shift wheel and, with the focus on the
  chart, + − Shift+←/→ and 0; without `zoomable` nothing zooms and the plain
  wheel stays the page's.
- **'Show all'**: once a zoomable x axis shows a span of its own, a quiet
  button over the plot area's corner (top right; bottom right under a legend
  or the data key above) brings every zoomed axis back, reported once, and
  goes. A tab stop of its own after the plot's, handing the focus to the plot
  as it goes; its label is the wording's `showAll` ("Show all" / "Alles
  zeigen"); `--uc-*` tokens only, kept under forced colours, no transition
  under reduced motion.
- **The legend's gestures**: a double click, Alt/⌥+click or Shift+Enter on
  an entry shows only that series (a state's entry: its bands), and on the
  only one visible shows all again. Whatever would hide every series shows
  all instead, and the polite live region says so (`allShown`); the plot's
  summary names Shift+Enter (`legendHelp`). A view handed in is taken as
  given and may hide every series.
- **Types**: `ChartParts`, `ChartOptions`, `ChartView`, `AxisSpans`,
  `ZoomLimits`, and the forms a value takes - `Value`, `NumberField`,
  `ListValue`, `ListField`.
- **`Echoes`** - the rule that tells a view reported and handed back late
  from one handed in, which `@umriss-ui/schedule` takes from here (ADR-0022)
  instead of a copy of its own.
- **The demo** has the pages 'Zoom and pan', 'Legend' (split from 'Tooltip &
  Legend', which is 'Tooltip' now) and 'View' (a view kept across a reload
  and restored), all in the rubric Chart. The zoom and legend examples moved
  there; their old anchors - `/axis/#zoom-and-pan`, `/axis/#visible-domain`,
  `/chart/#cursor-sync`, `/tooltip/#toggling-legend`,
  `/tooltip/#legend-placement` - land on them. Every example declares its
  chart through `useChart` and `value`.

---

## 0.10.0 – Every export explained, and a limit's colour at its label (Oct. 2026)

The package explains itself where it is used: every export carries a comment,
every default a `@default` tag, and the demo lists all of it in an API index
(ADR-0044). Every prop of a props table is shown by an example or named as
an exception. A limit's own `color` reaches its label, as a stroke before the
text, and on an x axis the label leaves no tick label half covered (see
Fixed).

### Added

- **Every export carries a comment**, the German wording's included: what a
  component, a function, a constant or a type is for. The editor shows it on
  hover, from the package's `.d.ts`. Nothing else changes.
- **A prop's default stands in a `@default` tag**, no longer in a sentence of
  its comment: `Chart height` is `300`, `LimitLine role` `"specification"`,
  a series' `color` the palette's. The editor shows the tag on hover. Nothing
  else changes.
- **A prop's comment cites no requirement number**: "Binding to a y axis."
  ends there; the number stands in a `@remarks` tag. Nothing else changes.
- **The demo has an API index**: `/charts/api/`, the last entry of the
  sidebar, lists every export of `@umriss-ui/charts` and of
  `@umriss-ui/charts/wording/de` under its import path, grouped as components,
  functions, constants and types, alphabetical - each value with its comment
  and its declaration, each type with a link to its table or its definition,
  and the pages that use it. `DEFAULT_CHARTS_WORDING` and its German twin link
  their table on core's Language page. A hook or a function a page names, in
  its text or its import line, leads to its entry. `docs/llms-full.md` ends
  with the same index, in place of the appendix "The rest of the API". The
  library is unchanged.
- **`docs/llms-full.md` defines every type a props table names**: a type
  without a table of its own (`Accessor`, `MatrixColoring`) stands under
  "Types on this page" of each page that names it, with its comment and its
  members or its declaration.
- **Every token listed**: core's Theming page lists the 29 `--uc-…` tokens
  of the chart's root, with the core token each one takes, and the
  Installation page links there. The tokens themselves are unchanged.
- **The Chart page says what a screen reader meets**: a section
  Accessibility after Keyboard names the plot's role and name, the summary,
  the readout after a key, the label to pass and what forced colours change.
  Every other page with a chart in its examples - Installation, Axis, the
  series, the limits, Tooltip & Legend and Benchmark as well as Line - has a
  Keyboard section linking the Chart page's keys. In the demo, the Markdown
  twins and `docs/llms-full.md`; the chart is unchanged.
- **Every prop of a props table is shown, or named as an exception**: new
  examples for shares of the whole over time (`normalize`), moments and
  windows along time (a limit's `orientation="x"` and `color`), specification
  and control limits side by side (`role="control"`), the rules of a control
  chart (`rules`, `zoneLines`, `onViolations`) and every kind of series on a
  second axis (`xAxisId`, `yAxisId`); existing examples now show `dash` on an
  area, `hidden` from a legend's `onToggle` on a stack and a state band, and
  `format` on a matrix. The 20 props left without an example are
  pass-throughs and twins of a prop shown on a sibling type; the demo's list
  says so for each. The charts are unchanged.

### Fixed

- **A limit with a `color` of its own marks its label with it**: a short
  stroke before the text, in the limit's colour and its line's pattern
  (dashed for a specification, solid for a control limit, dotted for a
  zone). The text stays in the axis's text colour, legible in both themes,
  which a colour chosen for a line need not be. The label kept the
  severity's colour before - a "Release freeze" in alarm red beside its
  own-coloured line. Without `color` the severity and the role colour the
  text as before, with no stroke.
- **On an x axis a tick label a limit's label reaches over gives way**, as on
  a y axis; it stood half covered before. Its tick mark stays.

---

## 0.9.0 – A box plot (Oct. 2026)

### Changed

- **`MaterializedSeries` has a required field `box`** - null for every kind
  but the box. Code that builds a `MaterializedSeries` itself adds `box: null`.

### Added

- **`BoxPlot`** - a box per x from five numbers the caller brings: `median`,
  `lowerQuartile`, `upperQuartile`, `lowerWhisker`, `upperWhisker`. It stands
  on the numeric x axis as a bar does, `boxWidth` a fraction of the step;
  boxes and bars on one x axis share the step side by side. A missing median
  is a gap. The tooltip, the readout and the data table read the five numbers
  top to bottom as drawn, in `format` or the y axis' `tickFormat`; the arrows
  walk box to box, the marker on the median of its own box. The library
  computes no statistics.
- **`BoxPlot outliers`** - the values beyond the whiskers, an array per box
  (ADR-0040): drawn with their box in its colour, one beyond three IQR as a
  ring, read in its tooltip and table row as a count and the first five
  values. They pull the y axis and hide with their box.
- **`BoxPlot mean`, `notchLower` + `notchUpper`, `count`** - a mean drawn as
  a small ×, a notch as a waist in the box, and n; each read in the tooltip
  and the table only where given. One notch bound alone, and numbers out of
  order, warn once in DEV.
- **`ChartsWording`** gains `mean`, `notch`, `count`, `outliers` and
  `outlierList`, and `upperWhisker`, `upperQuartile`, `median`,
  `lowerQuartile` and `lowerWhisker`; German in `wording/de`.
- **`MaterializedSeries.box`** holds a box's further numbers; null for every
  other kind. **`TooltipPoint.box`** carries them to a custom `render`.

---

## 0.8.2 – Room on a phone (Sep. 2026)

### Changed

- **X labels never overlap.** Generated ticks ask for fewer steps first; named
  ticks - categories - keep every k-th label. A time axis shows at least two
  labels. The axis range does not change.
- **A time axis widens only to whole hours or days of its step**, not to the
  next round step: on a phone a day's work no longer stretched over 24 hours.
- **Axes with named ticks widen to those ticks**, not to a hidden
  round-number grid: bars and matrix cells fill their plot.

- **Category names break onto a second line before any is left out**; only
  then does the axis keep every k-th name, on one line and then on two.
- **Limit labels stand inside the plot** at its far edge when beside it they
  would take more than a fifth of the chart's width - on a phone they had
  left the plot a third of the card.
- **A time axis with fewer than four ticks tries a finer step** where its
  labels still keep apart, unless the caller set `tickCount`.

### Fixed

- **Markers on the plot's edge are drawn whole**; lines, areas, bars, bands
  and limits stay clipped to the plot.
- **Limit labels on one axis keep apart**, in their order; a tick label a
  limit label would half cover gives way, its tick mark stays.

---

## 0.8.1 – Found by search (Sep. 2026)

### Fixed

- **The package's description and keywords say what it is in the words a
  search uses**, and the demo it links to addresses every page by a path
  (`…/charts/<page>/`) instead of a hash, with the page's text readable before
  the demo starts. Old `#/<page>` links still land. Nothing in the package's
  code changed.

---

## 0.8.0 – Working time (Sep. 2026)

### Changed

- **Operating time is working time** (ADR-0035). The calendar axis and its
  pure modules speak of working time, not of a plant's operating time. A hard
  cut, without deprecated aliases — rename on upgrade:

  | Before | After |
  |---|---|
  | `operatingCalendar()` | `workingCalendar()` |
  | `toOperatingTime()` | `toWorkingTime()` |
  | `toOperatingTimeClamped()` | `toWorkingTimeClamped()` |
  | `operatingTicks()` | `workingTicks()` |
  | `operatingTimeTicks()` | `workingTimeTicks()` |
  | `OperatingCalendar` | `WorkingCalendar` |
  | `OperatingInterval` | `WorkingInterval` |
  | `OperatingTimeTick` | `WorkingTimeTick` |
  | `OperatingTimeTick.operatingTime` | `WorkingTimeTick.workingTime` |
  | `RemovedSpan.operatingTime` | `RemovedSpan.workingTime` |

  `calendar` on `XAxis`/`YAxis`, `CalendarInput`, `calendarFrom`,
  `toWallClock`, `breaks` and `removedIntervals` keep their names.

## 0.7.0 – Data table, marks and stacks (Sep. 2026)

### Added

- **The focus rings under forced colours** (forced-colors 01): the plot's,
  the legend entry's and the data panel's ring carry `outline: 2px solid
  transparent` beside the box-shadow, which forced colours drop.
- **`docs/llms-full.md`**, the package's documentation as one Markdown file for
  a coding agent, in the npm package and pinned to its version: every demo page
  with its import line, its examples' source, its props tables and why it is
  built as it is, and the declaration of every other export. The same text
  stands online as <https://romanhaendler.github.io/umriss-ui/charts/llms-full.txt>,
  with an index of the pages beside it (`llms.txt`).
- **`<DataTable />`** (charts-alternatives 01): the chart's values as a table,
  on demand. It puts a disclosure key - "Show data", "Hide data" - at the end
  of the legend, or on a line of its own without one, and the key lays a plain
  `<table>` over the plot area: the visible domain, the x in the first column,
  then one column per visible series, each value in the format the tooltip
  writes it in; a state band names its states, a matrix gets a table of its
  own. Above 500 rows it lists the downsampled course - the first, lowest,
  highest and last value of each stretch - and its caption says how many
  readings the rows stand for. The plot keeps its size beneath and is hidden
  while the table is open.
- **`Chart encoding="marks"`** (charts-alternatives 02): series told apart
  without colour. Each series takes a dash pattern and a marker shape - a
  line, an area's outline, a scatter's points - or a hatch across its fill - a
  bar, an area -, chosen by the same palette place as its colour, the first
  plain; a caller's own `dash` wins. A state band hatches each state by its
  name, a matrix each step of its colouring, a limit band
  is hatched in its colour. The legend's chips draw the same marks. The
  default, `"color"`, changes nothing.
- **Forced colours** (charts-alternatives 03): under `forced-colors: active`
  (the Windows contrast mode), which forces every element but no canvas, the
  chart forces itself - its theme resolves to the system colours (`CanvasText`,
  `Canvas`, `GrayText`, `Highlight`), a caller's colour becomes `CanvasText`,
  and encoding by marks switches on whatever `encoding` says. `ResolvedTheme`
  gains `forced`.
- **`stack` on `Bar` and `Area`** (charts-stacking 01, 02): series with the
  same id on the same axes stand on the ones registered before them. Stacked
  bars take one place in their group; a gap stacks as zero and stays a gap;
  negative values stack downward from zero, apart from the positive. The
  tooltip and the readout name each series' own value and add the stack's
  total as the last row; the data table lists the own values. An area's
  `baseline` is not read in a stack. `TooltipPoint.yValue` of a stacked point
  is its own value, not its top; a tooltip `render` gets no total and sums the
  points itself.
- **`normalize`** (charts-stacking 03): on any member of a stack, every x sums
  to 100 % - each value its share -, and the y axis reads in percent unless it
  has a `tickFormat`. The total stays the readings' sum, in the series'
  `format`.

### Changed

- **`ChartsWording`** gains `showData`, `hideData`, `positionColumn`,
  `rowColumn`, `tableCaption`, `downsampled`, `stackTotal` and `percent`,
  German beside them. A
  `Partial<ChartsWording>` passed to `wording` keeps working; a register of
  one's own typed as the whole `ChartsWording` has to add them.
- **A state's hatch follows its name** (charts-alternatives 04), no longer its
  place in the state list: the first name to come across the chart's bands is
  plain, the next rising, and so on. Two bands that list one state at
  different places hatch it alike, and the legend, which shows it once, agrees
  with both. A single band is hatched as before.
- **An area's legend chip shows its hatched fill** under encoding by marks
  (charts-alternatives 04): the faint fill with its hatch, the dashed outline
  along its top - as the plot draws it.
- **The data table thins a state band to its changes** (charts-alternatives
  04): above 500 rows a band keeps its first reading and each where its state
  changes - the positions the keyboard walks -, not its lowest and highest
  state code, which say nothing about a band.
- **Stacked segments are parted by a line** (charts-stacking 04): 1px in the
  ground's colour - `Canvas` under forced colours - between two stacked bars
  and below each stacked area's outline, in both encodings.

### Fixed

- **The tooltip's chips under forced colours** (charts-alternatives 04): the
  contrast mode forced their background away and only the names stayed. They
  now draw the legend's marks - a dash and marker, a hatch - in the system
  colours.

---

## 0.6.0 – By keyboard and screen reader (Sep. 2026)

### Added

- **A chart with a `<Tooltip>` is one tab stop** (ADR-0030). Its plot area
  takes the focus as `role="application"` with a role description, and the
  keys walk its **Active point**: ←/→ from position to position, Home/End to
  the ends of the visible domain, PageUp/PageDown by a tenth of it, ↑/↓ to
  the next series, which is emphasised and read first. A matrix walks cell by
  cell. Escape clears the point, leaving the chart clears it too.
- **The Active point is one for pointer and keyboard**: the last input wins,
  the tooltip, markers and `syncId` crosshair are the pointer's own.
- **A polite readout** speaks what the tooltip shows once the keys rest - never
  after a pointer move - and **a summary** describes the plot: its series, the
  visible stretch, each series' range in it and the keys.
- **Zoom and pan by key** where the x axis has `onDomainChange`: `+`/`−` zoom
  around the Active point, Shift+←/→ pan by a tenth, `0` asks for the data.
- **`wording` on `Chart`** with the new `ChartsWording` register and
  `DEFAULT_CHARTS_WORDING` (ADR-0031); German as `GERMAN_CHARTS_WORDING` from
  the subpath **`@umriss-ui/charts/wording/de`**. `empty` keeps winning over it.

### Changed

- **A chart with a tooltip no longer reports `role="img"`**: it is an
  application a screen reader enters. Without a tooltip nothing changed.
- A chart renders two visually hidden elements beside its plot area - the
  readout and the summary - and the plot's `aria-describedby` points at the
  summary.

---

## 0.5.0 – Tokens for type and motion, a legend that answers (Sep. 2026)

### Added

- **Four `--uc-*` variables** an application may override like the others:
  `--uc-size-tooltip` (12px), `--uc-leading-label` (1.25, axis labels),
  `--uc-leading-text` (1.35, legend and tooltip) and `--uc-radius-chip` (2px,
  the colour chips). They carry the values that stood written out before;
  nothing moves. The tooltip's head now follows `--uc-size-tick`, which had the
  same value.

### Changed

- **A toggling legend entry answers the pointer.** With `onToggle` an entry is a
  button; it now takes a quiet surface under the pointer and a stronger one
  while pressed (`--uc-color-hover`, `--uc-color-pressed`, new variables on
  core's `--u-color-surface-sunken` and `--u-color-surface-pressed`), and fades
  them on `--uc-transition-state` (core's `--u-transition`). Before, only its
  cursor changed. A plain legend is unchanged.

- **The tooltip fades on `--uc-transition`**, a new variable: its own 80 ms,
  on core's `--u-ease-out` where core is loaded and on the same curve written
  out where it is not. It ran on the CSS keyword `ease-out` before.

---

## 0.4.1 – The axis band after the web font (Sep. 2026)

### Fixed

- **An axis band no longer keeps the width of the fallback font.** A chart
  laid out before its web font had arrived remembered the wider band under the
  hysteresis and kept it - the plot stood up to seven pixels too far in,
  or not, depending on which came first. The band is now measured anew once the
  font is there, and on a change of theme.

---

## 0.4.0 – The charts examined (Sep. 2026)

The result of a review of the whole package (`.scratch/charts-review/spec.md`),
delivered in three parts: the bugs it found and the removal of `Span`
(`charts-fixes`), what a plant screen expects of a chart
(`charts-essentials`), and long courses (`charts-long-series`). **`Span` is
gone** - occupancy is drawn by `@umriss-ui/schedule` (ADR-0026).

### Changed

- **`Span` is removed** (breaking, ADR-0026). Occupancy - jobs on machines,
  idle time, double bookings - is drawn by `@umriss-ui/schedule`, with lanes,
  groups and editing. With it go `SpanProps`, `SpanSeriesConfig`, the series
  kind `"span"`, the second x channel `x1` of `MaterializedSeries` and
  `open` in a tooltip point's `segment`.
- **A state band and a matrix take no palette colour.** They colour themselves,
  and each used up a place of the palette all the same: a line after a state
  band came out in the palette's second colour, after three bands in its
  fourth. It now gets the first. A series without a `name` counts its position
  among the series that take a colour.
- **The working-time axis labels in en-GB by level.** Without a
  `tickFormat` it wrote every tick as `dd.MM. HH:mm`; it now labels as the
  time axis does - `15:00`, and the date on the first tick of a new day,
  `17 Mar 06:00` - and the tooltip's x value as `17 Mar 15:23`. Its ticks
  stand on the same local boundaries, across a clock change too.
- **Lines and areas downsample on their own.** Above two points per pixel
  column of the plot they draw four per column - where the course entered it,
  its lowest and highest value, where it left - and a gap in a column stays a
  gap. They draw only the window of the x domain, and one point beyond each
  edge. The picture is the same; three lines of 1,000,000 points draw in about
  8 ms instead of 47. Bars and scatters are never thinned, and the tooltip
  still searches every point.
- **A caller's colour is resolved for the canvas.** A series' `color`, a
  state's, a limit's and a gradient stop reached the canvas as the text they
  were given: `var(--…)` or `light-dark(…)` drew nothing, or in the colour
  drawn before. They now go through the theme's probe as the palette does,
  and are resolved anew when the colour scheme changes.
- **A state band's last state ends at the latest reading.** It ran to the end
  of the x domain - with `domain="nice"` a rounding of the axis, and with
  `domain="data"` nothing at all. It now ends at the last x of any visible
  series on its x axis; where the band reports last, one median step of its
  own x values after its last point; never beyond the domain. The band's x
  extent reaches that step too. The last state is no longer hit beyond it.
- **The first tick of a time axis carries its date.** A clock tick names the
  day, a day tick the year - a zoomed axis whose first tick is a midnight, or
  that crosses none, named no day at all.

### Added

- **`TooltipPoint.xValue`**: a point's own x value. With several x axes it can
  differ from the hit's.
- **`localOffset(instant)`**: the time zone's offset at an instant, as the
  shift of a tick grid onto local time. It moved here from
  `@umriss-ui/schedule`, which takes it from here now.
- **`XAxis time`**: the values are instants. Ticks on local boundaries from
  the minute to the month, labels by level in en-GB with a 24-hour clock -
  `15:00`, `17 Mar`, `Mar 2026` - and the date on the first tick of a new
  day. `domain="nice"` widens to the step's boundaries. A `tickFormat` is
  handed the instant, which is how the axis speaks German. `calendar` implies
  `time`.
- **`format` on `Line`, `Area`, `Bar`, `Scatter`, `Matrix` and
  `ControlChart`**: `(value: number) => string`, the value as the tooltip
  writes it - "806.4 °C" without a render prop. Without it the y axis'
  `tickFormat`, then the default; a matrix' value has no axis format and goes
  to the default. `ControlChart` passes it on to its line and its violations.
- **`Line step`**: sample-and-hold. Each value holds as a horizontal until
  the next sample and jumps there - a set point, a digital signal. A gap ends
  the hold at its x. The tooltip reports the sample the hold began with, not
  the nearer one after it.
- **`hidden` on `Line`, `Area`, `Bar`, `Scatter`, `StateBand` and `Matrix`**,
  controlled: a hidden series is not drawn, not hit and does not count for its
  axes' extent - a fixed `domain` keeps the axis still. Its legend entry stays,
  struck through with a faint chip. A hidden bar leaves no empty place in its
  group.
- **`Legend onToggle(name)`**: with it every entry is a button
  (`aria-pressed`) that hands the caller the series' name, or a state's label.
  Without it the legend is not clickable, as before.
- **`Chart empty`**: what the plot area says when no visible series has a
  point to show - no data, only gaps, or every series hidden. Default
  `"No data"`, centred; axes and frame stay. Before, such a chart drew an
  empty frame on [0, 1] and said nothing. A time axis over less than a minute
  - the [0, 1] of an axis without data - draws no ticks.
- **`tone` on `Area`, `Bar` and `ControlChart`**, as on `Line` and
  `Scatter`: a role the theme resolves. On `ControlChart` it colours the line;
  the violations stay "alarm".
- **`Area dash`**: a dash pattern for the outline, in CSS pixels; the fill
  stays whole.
- Every size prop's comment names its unit (CSS pixels, a fraction of the
  step, domain units of the axis).
- **`XAxis onDomainChange`**: zoom and pan, controlled. Ctrl or ⌘ with the
  wheel - and a pinch - zoom around the pointer; a drag, a horizontal wheel or
  Shift with the wheel pan; a double click proposes the whole data range. The
  axis only proposes a domain in its own units; the caller passes it back as
  `domain`, clamped as it likes. Without a handler nothing zooms, and the
  plain wheel always scrolls the page.
- **`YAxis domain="visible"`**: the extent of what the series show inside
  their x axis' domain, widened to ticks as `"nice"` is - a zoomed hour gets
  the hour's range, not the week's. A fixed foot (area, bar) and the limits
  count as before; where the x domain is not fixed, every point is shown and
  counts.
- **`Chart syncId`**: charts with the same id share the pointer's x
  position, in domain units. Each draws its crosshair there, on its x axis of
  the same id or its first; the tooltip stays with the chart under the
  pointer. Zoom is not shared - pass every chart the same controlled
  `domain`.
- **`YAxis alignTicks`**: on a further y axis, take the first y axis' tick
  count and widen this axis' domain until its ticks stand on that one's grid
  lines, the steps still 1, 2 or 5. One grid then serves two quantities. The
  DEV warning about several grids names it.

### Fixed

- **The sortedness check sees every series.** In DEV it ran for the first
  series only, and warned falsely where that was a matrix, whose cells run
  row-major. It now checks every series but the matrix, once per change of its
  data, and names the series it warns about.
- **A matrix explains its own colours.** Its legend entry showed a palette
  colour it never draws; it now shows the gradient's steps or the limit set's
  three colours, and the tooltip's chip shows the colour of the cell.
- **A state several bands share highlights all of them.** Hovering "Fault" in
  the legend of three machines highlighted the first band only.
- **The tooltip writes a value in its axis' format.** It formatted every value
  with a fixed default, so beside ticks reading "40 %" the tooltip wrote a
  bare "42". A value now takes its y axis' `tickFormat`, and the default only
  without one. A point on another x axis than the header's names its own x
  value, in its own axis' format, beside its name.
- **An infinity is a gap.** `±Infinity` out of any accessor - y, baseline,
  a matrix' value, x - entered the extent, which was then no longer finite, and
  the axis fell back to [0, 1] with every other value pressed against its edge.
  It is now treated like `null` or `NaN`: a gap, outside the extent. An x
  that is no number - an infinity or `NaN` - takes the place of the point
  before it, so that the x values stay ascending; in the middle of a series,
  or as `-Infinity`, it used to raise a false DEV warning about unsorted data
  and mislead the hit test.
- **A point between two gaps is drawn.** On a line it was a lone move of the
  pen and drew nothing, and above 60 points `markers="auto"` drew no marker for
  it either - a reading a gap isolates vanished. It now always keeps its marker;
  only `markers="never"` drops it. On an area it is a stroke from its foot to
  its value, with or without an outline.
- **A control chart reports its violations once per change.** An inline
  `accessor` or `origin` recomputed the limits on every render, and
  `onViolations` was called after each - a caller that kept the violations in
  state rendered forever. The accessor is now compared by its source text, the
  origin by its values, and `onViolations` is called only when the violations
  differ in content.
- **A limit on the x axis finds its axis.** `LimitLine` and `LimitBand` with
  `orientation="x"` and no `axisId` looked for an axis "y" among the x axes,
  found none and drew nothing, silently. Without an `axisId` a limit now binds
  to the first axis of its orientation - an `<XAxis id="time">` too - and an
  unknown `axisId` is a DEV error, as it is for a series.
- **The working-time axis stands on the local clock.** Its day and half-day
  ticks fell on UTC's midnight and were labelled in local time - "01:00"
  where a day begins, in CET. They now fall on local midnight and noon. Explicit
  `ticks` and the value of an x limit are named on the wall clock, like the
  data, and mapped into working time as the data are; before, both were taken
  as working time and landed far off, or pulled the axis out of shape.
- **Hit testing where areas and points meet.** Under `mode="nearest"` a state
  band or a matrix cell under the pointer counted as distance zero and beat
  every point; a point within 12 px of the pointer now wins, and the area
  answers where none is. A chart of bands or cells only pinned crosshair and
  tooltip to the beginning of the section; they now stay with the pointer. And
  a scatter under `"nearest"` was hit by x alone - the sample straight above
  the pointer beat the one beside it; it is now measured in x and y.
- **Change detection.** An inline `calendar` array is new on every render, and
  was compared by reference: every render mapped every point again. It is now
  compared by its intervals. Functions are compared by their source text, and
  every native or bound function reads the same - two bound
  `Intl.NumberFormat#format` counted as equal, and swapping one for the other
  left the axis in the old format. Such a function is now compared by identity.
  The known limit stays and is now documented at the props: two functions of
  the same text that read different captured values count as equal.
- **A control chart over a constant reference window finds no outliers.**
  Sigma is 0 there, the limits lie on the centre line, and every value off it
  was an outlier - and two of three beyond "two sigma". Both rules now find
  nothing without a spread, and DEV warns that the limits are degenerate - for
  a given sigma of 0 or below as well, where the rules find nothing either.
- **`Chart.height` says its default.** The comment promised the host's height;
  the default is and was 300.
- **A matrix buckets its cells once per change**, not on every redraw of the
  series layer - a legend hover redraws it - and its tooltip chip no longer
  scans every cell on each pointer move.
- **Hovering a hidden series' legend entry dims nothing.** It highlighted the
  series that is not drawn, and every visible one was dimmed.
- **A time axis over years labels a year as `2026`**, by level, not as
  `Jan 2026`.
- **The legend's focus ring couples through `--uc-focus-ring`**, like every
  other value of the stylesheet, with `--u-focus-ring` and a literal behind
  it.
- **A downsampled course keeps a gap at the end of a pixel column.** Only the
  first gap of a column was kept: a column running gap - points - gap lost the
  second, and the line bridged to data far away.
- **The cursor sync.** A chart without a `Tooltip` shared no position; it now
  shares the pointer's x. A chart that leaves its group - another `syncId`, or
  unmounted - no longer keeps the crosshair the group last sent it.
- **An x limit's label stays inside the container** at the right edge, as a
  tick label does; it ran past it.
- **No hover marker outside the plot.** At a zoomed edge the nearest reading
  can lie beyond it, and its marker stood on the axis.
- **The tooltip header on a time axis carries the seconds** where the
  readings under the pointer lie less than a minute apart - readings a second
  apart shared one header. Otherwise it stays `17 Mar 15:23`.
- **A double click proposes no domain without width.** Over a single point
  the data range is one value; the double click handed it to
  `onDomainChange` all the same, where a wheel step checks for that.

---

## 0.3.2 – Phones, touch and a review (Sep. 2026)

### Fixed

- **A tap shows the tooltip.** On a touch screen the tap that lands on the plot
  shows what lies there, and the finger lifting no longer takes it away again;
  a tap outside the plot ends it.
- **A limit's label fits its y axis band.** The band is as wide as the widest
  limit label on it, so a label such as "Warning limit" is no longer clipped at
  the edge of the chart and no longer covers the tick labels.
- **The tooltip follows new data under a resting pointer.** Live data or a
  resize moved the series away beneath the hover marker, and the tooltip went on
  naming the values of before; the hit is now asked again with every new layout.
- **A web font that arrives late re-measures the axes.** Labels measured in the
  fallback font no longer overflow their band once the real font is there.
- **A resize there and back within one frame** lands on the last size, not the
  first.
- **A span's `height`** now widens the y axis anew when it changes, and a
  covering span is hit where it is drawn - moved within its lane - not where it
  would lie unmoved.
- `LegendProps.placement` said the legend stands below the plot without a
  value; it stands above it, as it always did.

---

## 0.3.1 – The README catches up (Sep. 2026)

Nothing in the code changed; the README counts four packages sharing the design
language, not three.

---

## 0.3.0 – Arithmetic with a second consumer (Sep. 2026)

From `.scratch/schedule/spec.md` (ADR-0022): `@umriss-ui/schedule` takes its
time arithmetic from here, so what it uses is public now.

### Added

- **`resolveColours(root, colours)`** — any CSS colours, tokens and
  `light-dark()` included, resolved to values a canvas can draw in the scheme
  that applies at `root`. **`subscribeTheme(notify)`** tells a canvas when to
  resolve again.
- **`toWorkingTimeClamped`** — wall clock to working time without `NaN`: a
  time in removed time lands on its seam.

### No longer a release candidate

The tag `next` is gone: `0.3.0` publishes to `latest`, and
`pnpm add @umriss-ui/charts` is the whole install line. Nothing in the package
changed for that — the candidates 0.3.0-rc.0 and 0.3.0-rc.1 are what this is,
with the arithmetic above added for `@umriss-ui/schedule`, which now stands on
it in a released version of its own.

---

## 0.3.0-rc.1 – Styles that load themselves, and touch nothing else (Sep. 2026)

Delivery report for `.scratch/styles-without-side-effects/spec.md`, the charts'
share (ADR-0021).

### Changed

- **No stylesheet import any more.** `dist/charts.js` imports its own
  stylesheet; `@umriss-ui/charts/styles.css` stays exported and is optional.
- **The classes are `uc-*`.** Every `kc-*` class of the DOM - `.kc-root`,
  `.kc-plot`, `.kc-axis`, `.kc-tooltip` and the rest - is `uc-*`. A selector an
  application wrote against them changes its prefix.
- **Cascade layer.** The rules lie in `umriss.components` and select only the
  chart's own elements.
- **Light and dark follow `color-scheme`.** Canvas colours are resolved through
  the browser, so a `light-dark()` token draws in the scheme that applies. The
  resolved theme is read anew when an attribute of `<html>` changes (a
  `style="color-scheme: …"`, a class) or the system preference does;
  `invalidateTheme()` stays for a switch on another ancestor.

---

## 0.3.0-rc.0 – One language, one scope (Sep. 2026)

Delivery report for `.scratch/english-and-umriss-ui/spec.md`, the charts' share.

- **The package is called `@umriss-ui/charts`.** The npm scope moved from
  `@umriss/*` to `@umriss-ui/*`, which is the org actually secured for this
  library. The sibling package `@umriss/ui` is `@umriss-ui/core` and lies at
  `packages/core`; `@umriss/table` is `@umriss-ui/table`. Nothing was ever
  published under the old names — all three returned 404 from the registry — so
  there is no alias and no deprecation window, and the version number stays where
  it is.
- **Every identifier and every document in the workspace is English** (ADR-0018,
  which supersedes ADR-0015). For a caller of this package that changes little,
  because its exported names were English already; what changed is the inside —
  the pure modules' internal identifiers, the long prose headers that carry the
  design reasoning, and the demo. The headers were translated, not shortened.
- **The library ships two wordings, English by default** (ADR-0019). That
  concerns `@umriss-ui/core`, whose German moved to the subpath
  `@umriss-ui/core/wording/de`. This package is untouched by it and stays
  untouched by it: it has no text layer at all, and every string it draws comes
  from the caller — the one reason `pareto` has no default name for its remainder
  and `ControlChart` no default labels.
- **`@umriss-ui/charts` still depends on nothing**, and will keep depending on
  nothing (ADR-0016). "Core" names the package one installs first, not a layer
  this package sits on.
- The licence is MIT, and a `LICENSE` file ships in the package.

### Changed — the limit model's values

`Verdict` is `"ok" | "unknown" | "warning" | "alarm"`, `Severity` is
`"warning" | "alarm"`, `Side` is `"upper" | "lower"`, and the fields of `Limit`,
`LimitSet` and `Assessment` are `value`, `side`, `severity`, `limits`, `target`,
`verdict`, `limit`, `excess`, `deviation`.

ADR-0006 holds this model twice — once here, once in `@umriss-ui/core` — and the
copies are pinned together by a runtime conformance test that compares both
results structurally rather than importing either. The two packages, the shared
case table and that test therefore moved in a single commit; a divergence stays a
red test and not a report from the field.

`--uc-color-alarm` is unchanged. What moved beside the model is
`.uc-limit-label[data-severity="warnung"]`, which now reads `"warning"` — the
same word `tone` has carried all along.

## 0.3.0-rc.0 – Where the library contradicted itself (Sep. 2026)

Delivery report for `.scratch/library-audit/spec.md`, tickets 03 and 05.

### Changed

**The package brings no text along any more.** It has no text layer, and four
German defaults stood there regardless:

- `ControlChart` no longer labels the control limits without being told to —
  previously `"OEG"` and `"UEG"`. Whoever wants the labels passes
  `labelUpper`/`labelLower`.
- The scatter of the violations was called `` `${name} – Regelverletzung` ``. It
  is now called what `violationName` says, and without a statement not at all —
  a `Legend` then carries it as "Series n".
- `pareto` has no default name for the remainder any more (previously
  `"Sonstige"`). Whoever names `collectRank` names `remainderName` with it — in
  the type (`ParetoSettings`) and in DEV as an error. `paretoDefaults` no longer
  contains `remainderName`.
- The labelling of a working-time axis without a `tickFormat` of its own is
  `dd.MM. HH:mm`, set by hand. Previously it came out of
  `toLocaleString(undefined, …)` and looked different on every machine.
- `"Series n"` remains the last resort for a series without a `name`, but warns
  once in DEV.

**A series keeps its colour.** The palette followed the position in the
registration; a series that unregistered and registered again landed at the back,
and every series of the chart changed colour. The palette now follows the `name`:
on first mounting as before in JSX order, after that a returning series gets its
colour back. A series without a `name` still takes the colour of its position and
warns in DEV when that shifts. Drawing happens unchanged in registration order.

**`role="img"` and `aria-label` stand at the plot area** (`.uc-plot`), no longer
at the root. The root contains the legend, and the descendants of an image are
presentation to a screen reader — the legend was unreachable. Whoever looked for
the role at `.uc-root` finds it one level deeper.

### New

- `ControlChart violationName`.
- The type `ParetoSettings`: what a call of `pareto` may specify.

## 0.2.0 – Limits, states, instruments (Aug. 2026)

Delivery report for `.scratch/judging-values/spec.md`,
`.scratch/shopfloor-instruments/spec.md` and
`.scratch/plant-at-a-glance/spec.md`, the charts' share. The decisions stand in
ADR-0006 to ADR-0011.

### New

- **Three series kinds:** `StateBand` (one state per interval, ADR-0007),
  `Matrix` (one value per cell, with `DEFAULT_GRADIENT` as the colouring) and
  `Span` (an interval with an explicit end on a lane).
- **`LimitLine` and `LimitBand`:** a limit as a rule with severity and role
  (specification, control limit, zone), which draws the value range of its axis.
- **`ControlChart`:** the control chart as a composition out of `Line`,
  `LimitLine` and `Scatter` (ADR-0008), and with it the pure modules
  `controlLimits`, `zones`, the four rules and `violations`.
- **The working-time axis:** `calendar` on `XAxis`/`YAxis` and the pure modules
  out of `workingTime.ts` — wall clock ↔ working time, ticks, breaks.
- **`pareto`** as a pure module.
- **The limit as a rule:** `assess` and `verdictWeight` with their types — the
  same rule as in `@umriss-ui/core`, deliberately there twice (ADR-0006).

Nothing changes in the behaviour of the four existing series kinds.

## 0.1.0 – Takeover state and mixed series kinds (Aug. 2026)

The number stood at `0.1.0` the whole time; it covers the takeover state
(packages C.1–C.7) and `.scratch/mixed-series-kinds/`.

### New

- `Chart` with two canvas layers and one HTML layer above them, `XAxis`/`YAxis`
  with axis bands on all four sides, `Tooltip`, `Legend`, `LinearScale` and
  `invalidateTheme`.
- Four series kinds mixable within one chart: `Line`, `Scatter`, `Area` with a
  baseline, and `Bar` on the numeric X axis (ADR-0002).

### Changed

**`LineChart` is called `Chart`** and is generic over the series kinds within it
(`mixed-series-kinds` 01). The takeover state knew only lines.
