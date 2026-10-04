/* The outline of the demo of @umriss-ui/charts - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. The shape comes from the
   shell (`@umriss-ui/demo`), which all demos share (ADR-0020).

   One page per thing a reader looks up by name - the same rule core and table
   follow. "Axes and area" is not something anybody imports; `XAxis`, `Line`
   and `ControlChart` are. A rubric sorts the sidebar and stands in no address
   (CONTEXT.md, "Rubric"). Getting started comes first, after the scenarios
   page that opens the demo (.scratch/demo-rework/spec.md).

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else. */

import { addresses, apiIndexRubric } from "@umriss-ui/demo/outline";
import type { Moved, Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What to know before the first chart.",
    pages: [
      {
        id: "installation",
        name: "Installation",
        sentence: "Install the package, draw a first chart and size it in its container. Read this once before the component pages; everything after it assumes it.",
        about: [
          "The command installs the package alone: React 18 or 19 is its only peer and stays the application's own, and the package depends on nothing else. The stylesheet comes with the JavaScript, so there is nothing to import - `@umriss-ui/charts/styles.css` is there for setups that link stylesheets by hand. Its colours, type and sizes are `--uc-` tokens that fall back onto core's; [core's Theming page](https://romanhaendler.github.io/umriss-ui/core/theming/#charts-tokens) lists them all.",
          "A chart takes its container's width and follows it; give it a `height` (300 px without one). `useChart(rows)` hands out `Chart`, its axes and its series, typed at the row; each reads its value from a row through `value`, a field name or a function - a value that is `null`, `undefined` or not finite is a gap, never a zero.",
          "Time is a number: milliseconds since 1970, as `Date.getTime()` gives them. With `time` on the x axis the ticks stand on the viewer's local clock, so a day begins at local midnight. The words are English; German comes from `@umriss-ui/charts/wording/de`.",
          "The charts take German per chart: `wording={GERMAN_CHARTS_WORDING}` from `@umriss-ui/charts/wording/de`, as [the keyboard and screen reader example](#/chart/keyboard-and-screen-reader) shows. They read no language provider, so this demo has no EN/DE switch in its header.",
        ],
        keysOf: ["chart"],
        types: [],
        exports: [],
        installs: true,
      },
    ],
  },
  {
    id: "chart",
    name: "Chart",
    sentence: "The container and its axes: what is drawn on, and what the drawing is measured against.",
    pages: [
      {
        id: "chart",
        name: "Chart",
        sentence: "Holds the rows and draws the series on shared axes, one chart for every kind a screen needs (a plot, a graph). Reach for it whenever values are read over time or across categories.",
        about: [
          "Series and axes are children, and their order in the JSX is the drawing order and the colour order. The marks are drawn on canvas; axes, legend and tooltip are elements a screen reader and a test can read (ADR-0001).",
          "With a `Tooltip` the plot is one tab stop: the keys walk its values and a screen reader hears them (ADR-0030). `syncId` shares the pointer between charts; zoom is shared by passing one controlled domain.",
        ],
        alternatives: [
          { when: "A single number with a small trend beside it", use: "`Sparkline` or `Stat` from @umriss-ui/core" },
          { when: "Work on lanes with a start and an end", use: "`Schedule` from @umriss-ui/schedule" },
        ],
        keys: [
          { key: "Tab", action: "Moves into the plot; the active point starts at the newest value." },
          { key: "← →", action: "Walk the values of the series read first; in a matrix, move from cell to cell (↑ ↓ too)." },
          { key: "↑ ↓", action: "Choose which series is read first." },
          { key: "Page Up Page Down", action: "Jump a page of values back or on." },
          { key: "Home End", action: "Go to the first or the last value." },
          { key: "+ −", action: "Zoom in and out, where the x axis has `onDomainChange`." },
          { key: "Shift+← Shift+→", action: "Pan, where the x axis has `onDomainChange`." },
          { key: "0", action: "Show the whole domain again." },
          { key: "Escape", action: "Clears the active point." },
        ],
        accessibility: [
          "The plot is an image named by `ariaLabel` and described by a summary: the series, the visible stretch and each series' lowest and highest value in it. With a `Tooltip` it becomes one tab stop, the role `application` read as \"chart\", and the summary adds the keys. Pass `ariaLabel`: without it the plot has no name, and the development build warns.",
          "When a key comes to rest, a polite live region beside the plot reads the active position and every series' value there, as the tooltip shows it; a pointer announces nothing. A reader who wants every value at once opens the `DataTable` (on [Tooltip & Legend](#/tooltip)), a plain table of what the chart shows.",
          "Under forced colours the chart draws in the system colours and tells its series apart by their marks instead of by colour. With reduced motion the tooltip appears without fading in.",
        ],
        limits: [
          "No loading or error state of its own: show a `Skeleton` or an `Alert` from @umriss-ui/core until the rows are there.",
          "No pie, donut, radar or candlestick, no smoothing, animation or export, no WebGL (ADR-0032).",
        ],
        types: ["ChartProps"],
        exports: ["useChart"],
      },
      {
        id: "axis",
        name: "Axis",
        sentence: "What a value is measured against: extent, ticks and labels, several axes per side, time on the local clock, and a working-time axis that leaves out the hours nobody works (a scale).",
        about: [
          "Every scale is linear. Categories are numbers 0, 1, 2 … with a `tickFormat` that names them (ADR-0002); a working calendar maps time before it is drawn and marks every seam it took out (ADR-0001).",
          "Zoom and pan are controlled: the x axis proposes a domain through `onDomainChange`, and you pass it back as `domain`. Without the callback the axis does not zoom.",
        ],
        keysOf: ["chart"],
        limits: ["No logarithmic and no category scale: compute the logarithm in `value`, and use positions for categories (ADR-0032)."],
        types: ["XAxisProps", "YAxisProps"],
        exports: ["useChart", "workingCalendar"],
      },
    ],
  },
  {
    id: "series",
    name: "Series",
    sentence: "The kinds a chart can draw. They share the axes and mix freely; the order in the JSX decides what lies over what.",
    pages: [
      {
        id: "line",
        name: "Line",
        sentence: "Joins the readings of a series into a course (a line chart, a trend). Reach for it for anything measured over time: latency, a balance, hours left.",
        about: ["A missing reading breaks the line; nothing is drawn across a gap. With `step` a value holds until the next one, for things logged only when they change."],
        alternatives: [
          { when: "A quantity read from its foot", use: "area" },
          { when: "Single samples with nothing measured between them", use: "scatter" },
        ],
        keysOf: ["chart"],
        limits: ["No smoothing: a curve between two readings would invent values nobody measured (ADR-0032)."],
        types: ["LineProps"],
        exports: ["useChart"],
      },
      {
        id: "area",
        name: "Area",
        sentence: "A filled course (an area chart): down to zero for a quantity, between two edges for a range, stacked for parts of a whole.",
        about: ["Without `baseline` the foot is 0 and stays in the y extent. A range's lower edge is the `baseline` of the same series, not a second series - where either edge is missing, the fill has a hole."],
        alternatives: [{ when: "A value without a natural zero", use: "line" }],
        keysOf: ["chart"],
        types: ["AreaProps"],
        exports: ["useChart"],
      },
      {
        id: "bar",
        name: "Bar",
        sentence: "Bars on the numeric x axis (a bar or column chart): one per category, grouped side by side, stacked, or as shares of a whole.",
        about: ["A category is a position the axis places and a `tickFormat` names (ADR-0002). A bar's foot is 0, so one series carries both signs."],
        alternatives: [{ when: "Causes ranked by how much they contribute", use: "pareto" }],
        keysOf: ["chart"],
        limits: ["No horizontal bars: bars grow along the y axis; for a ranking by name use `Matrix` or a `Table` (ADR-0032)."],
        types: ["BarProps"],
        exports: ["useChart"],
      },
      {
        id: "scatter",
        name: "Scatter",
        sentence: "Single readings as points, joined by nothing (a scatter plot, dots). Reach for it for samples, checks and events - anything that is not a course.",
        keysOf: ["chart"],
        types: ["ScatterProps"],
        exports: ["useChart"],
      },
      {
        id: "boxplot",
        name: "BoxPlot",
        sentence: "A distribution per position (a box plot, box-and-whisker): quartiles, median and whiskers, per service, per group or per hour. Reach for it to compare spreads, not single values.",
        about: [
          "Every number is the caller's: `median`, the two quartiles and where each whisker ends. The library computes none of them and names no quartile method or whisker rule, so a box aggregated in a database draws as well as one computed in the browser.",
          "A box stands on the numeric x axis as a bar does: a group is a position a `tickFormat` names, and a time axis carries a box per hour (ADR-0002). A missing median is a gap - no box is drawn there.",
        ],
        keysOf: ["chart"],
        limits: ["No horizontal boxes, no violin or jittered points, no box width by count: a density is smoothing, a jitter a picture that does not repeat."],
        types: ["BoxPlotProps"],
        exports: ["useChart"],
      },
      {
        id: "stateband",
        name: "StateBand",
        sentence: "What something was doing over time, as a band of coloured segments (a status timeline, a state chart). Reach for it for a vehicle, a service or a device.",
        about: [
          "`value` gives a state's place in `states`, which fixes the order, the name and the colour in one place (ADR-0007). Each segment runs to the next reading; a `null` leaves a hole, never a colour for unknown.",
          "Several bands share one axis as lanes: a y axis with one unit per lane, and `laneFrom` and `laneTo` on each band.",
        ],
        alternatives: [{ when: "Work with its own start and end, and gaps between", use: "`Schedule` from @umriss-ui/schedule" }],
        keysOf: ["chart"],
        types: ["StateBandProps"],
        exports: ["useChart"],
      },
      {
        id: "matrix",
        name: "Matrix",
        sentence: "One value per cell across two axes (a heatmap), coloured by its limits or along a gradient. Reach for it to see whether a bad hour hits everyone or one row.",
        about: ["`value` places a cell's row, as it places every series along y; `level` decides its colour. A cell without a level stays a hole, not a zero. The tooltip carries the level as text, since colour alone carries no number."],
        keysOf: ["chart"],
        types: ["MatrixProps"],
        exports: ["useChart", "DEFAULT_GRADIENT"],
      },
    ],
  },
  {
    id: "limits-and-alarms",
    name: "Limits and alarms",
    sentence: "A value read against its limits, and a process against its own behaviour.",
    pages: [
      {
        id: "limitline",
        name: "LimitLine",
        sentence: "The limits a course is read against (a threshold, a reference line): a line above the series, a band beneath them. Reach for it for objectives, budgets and alert levels.",
        about: ["A limit's tone follows its `severity`, never a colour of its own. The model is the one `@umriss-ui/core` uses for its verdicts, so a chart and a tile agree (ADR-0006)."],
        alternatives: [{ when: "Limits computed from the process itself", use: "controlchart" }],
        keysOf: ["chart"],
        types: ["LimitLineProps", "LimitBandProps"],
        exports: ["LimitLine", "LimitBand"],
      },
      {
        id: "controlchart",
        name: "ControlChart",
        sentence: "Centre line, control limits and the rule violations of a process (an SPC or Shewhart chart). Reach for it to see a process drift before it leaves its specification.",
        about: [
          "Control limits are computed from a named reference window, never from what happens to be visible; specification limits are chosen and drawn with `LimitLine` (ADR-0008).",
          "The rules - outlier, run, trend, two of three - are exported as plain functions, so the violations can stand beside the chart as text.",
        ],
        alternatives: [{ when: "Limits you set yourself", use: "limitline" }],
        keysOf: ["chart"],
        types: ["ControlChartProps"],
        exports: ["ControlChart", "controlLimits", "violations"],
      },
      {
        id: "pareto",
        name: "Pareto",
        sentence: "Causes sorted by weight with a cumulative line (a Pareto chart). Reach for it after a bad week, to see which few causes make most of the trouble.",
        about: ["`pareto()` sorts, adds up and folds the tail into one entry that stands last whatever its size; the bars, the line and the second axis are yours to compose."],
        keysOf: ["chart"],
        types: [],
        exports: ["pareto"],
      },
    ],
  },
  {
    id: "around",
    name: "Around the chart",
    sentence: "What stands beside the series: what a hover says, what the colours mean, and what the whole thing costs.",
    pages: [
      {
        id: "tooltip",
        name: "Tooltip & Legend",
        sentence: "What a hover reports and what the colours mean (a hover card, a key), and the values as a table for a reader who wants them all at once.",
        about: ["The crosshair snaps to a reading, never between two. A legend without `onToggle` only explains; with it, it switches series on and off, and the state stays yours."],
        keysOf: ["chart"],
        types: ["TooltipProps", "LegendProps"],
        exports: ["Tooltip", "Legend", "DataTable"],
      },
      {
        id: "benchmark",
        name: "Benchmark",
        sentence: "Millions of points, measured in this browser rather than claimed: the time to prepare and draw them, and the frame rate while the pointer moves.",
        about: ["A hover redraws only the overlay layer, so the frame rate stays up over a million points. The figures in `packages/charts/docs/capabilities.md` come from here."],
        keysOf: ["chart"],
        types: [],
        exports: ["useChart"],
      },
    ],
  },
  apiIndexRubric("@umriss-ui/charts", {
    DEFAULT_CHARTS_WORDING: "the table [Charts wording](https://romanhaendler.github.io/umriss-ui/core/language/#charts-wording) on core's Language page",
    GERMAN_CHARTS_WORDING: "the table [Charts wording](https://romanhaendler.github.io/umriss-ui/core/language/#charts-wording) on core's Language page",
  }),
];

/* The page ids that changed, and where each stands now - an old link still
   lands. Installation was called "Getting started" until the five demos
   named their first page alike (.scratch/sidebar-tree). */
export const MOVED: Moved = { "getting-started": "installation" };

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE, MOVED);
export const { ALL_PAGES, placeOf, addressOf, fromPlace } = ADDRESSES;
