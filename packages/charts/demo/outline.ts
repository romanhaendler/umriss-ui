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

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What to know before the first chart.",
    pages: [
      {
        id: "getting-started",
        name: "Getting started",
        sentence: "Install the package, draw a first chart and size it in its container. Read this once before the component pages; everything after it assumes it.",
        about: [
          "Install with `pnpm add @umriss-ui/charts`; React 18 or 19 is the only peer, and the package depends on nothing else. The stylesheet comes with the JavaScript, so there is nothing to import - `@umriss-ui/charts/styles.css` is there for setups that link stylesheets by hand.",
          "A chart takes its container's width and follows it; give it a `height` (300 px without one). Series and axes are children of `Chart` and read the rows through accessors - a value that is `null`, `undefined` or not finite is a gap, never a zero.",
          "Time is a number: milliseconds since 1970, as `Date.getTime()` gives them. With `time` on the x axis the ticks stand on the viewer's local clock, so a day begins at local midnight. The words are English; German comes from `@umriss-ui/charts/wording/de`.",
        ],
        types: [],
        exports: [],
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
        limits: [
          "No loading or error state of its own: show a `Skeleton` or an `Alert` from @umriss-ui/core until the rows are there.",
          "No pie, donut, radar or candlestick, no smoothing, animation or export, no WebGL (ADR-0032).",
        ],
        types: ["ChartProps"],
        exports: ["Chart"],
      },
      {
        id: "axis",
        name: "Axis",
        sentence: "What a value is measured against: extent, ticks and labels, several axes per side, time on the local clock, and a working-time axis that leaves out the hours nobody works (a scale).",
        about: [
          "Every scale is linear. Categories are numbers 0, 1, 2 … with a `tickFormat` that names them (ADR-0002); a working calendar maps time before it is drawn and marks every seam it took out (ADR-0001).",
          "Zoom and pan are controlled: the x axis proposes a domain through `onDomainChange`, and you pass it back as `domain`. Without the callback the axis does not zoom.",
        ],
        limits: ["No logarithmic and no category scale: compute the logarithm in the accessor, and use positions for categories (ADR-0032)."],
        types: ["XAxisProps", "YAxisProps"],
        exports: ["XAxis", "YAxis", "workingCalendar"],
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
        limits: ["No smoothing: a curve between two readings would invent values nobody measured (ADR-0032)."],
        types: ["LineProps"],
        exports: ["Line"],
      },
      {
        id: "area",
        name: "Area",
        sentence: "A filled course (an area chart): down to zero for a quantity, between two edges for a range, stacked for parts of a whole.",
        about: ["Without `baseline` the foot is 0 and stays in the y extent. A range's lower edge is the `baseline` accessor of the same series, not a second series - where either edge is missing, the fill has a hole."],
        alternatives: [{ when: "A value without a natural zero", use: "line" }],
        types: ["AreaProps"],
        exports: ["Area"],
      },
      {
        id: "bar",
        name: "Bar",
        sentence: "Bars on the numeric x axis (a bar or column chart): one per category, grouped side by side, stacked, or as shares of a whole.",
        about: ["A category is a position the axis places and a `tickFormat` names (ADR-0002). A bar's foot is 0, so one series carries both signs."],
        alternatives: [{ when: "Causes ranked by how much they contribute", use: "pareto" }],
        limits: ["No horizontal bars: bars grow along the y axis; for a ranking by name use `Matrix` or a `Table` (ADR-0032)."],
        types: ["BarProps"],
        exports: ["Bar"],
      },
      {
        id: "scatter",
        name: "Scatter",
        sentence: "Single readings as points, joined by nothing (a scatter plot, dots). Reach for it for samples, checks and events - anything that is not a course.",
        types: ["ScatterProps"],
        exports: ["Scatter"],
      },
      {
        id: "stateband",
        name: "StateBand",
        sentence: "What something was doing over time, as a band of coloured segments (a status timeline, a state chart). Reach for it for a vehicle, a service or a device.",
        about: [
          "The accessor returns a state's place in `states`, which fixes the order, the name and the colour in one place (ADR-0007). Each segment runs to the next reading; a `null` leaves a hole, never a colour for unknown.",
          "Several bands share one axis as lanes: a y axis with one unit per lane, and `laneFrom` and `laneTo` on each band.",
        ],
        alternatives: [{ when: "Work with its own start and end, and gaps between", use: "`Schedule` from @umriss-ui/schedule" }],
        types: ["StateBandProps"],
        exports: ["StateBand"],
      },
      {
        id: "matrix",
        name: "Matrix",
        sentence: "One value per cell across two axes (a heatmap), coloured by its limits or along a gradient. Reach for it to see whether a bad hour hits everyone or one row.",
        about: ["A cell without a value stays a hole, not a zero. The tooltip carries the value as text, since colour alone carries no number."],
        types: ["MatrixProps"],
        exports: ["Matrix", "DEFAULT_GRADIENT"],
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
        types: ["ControlChartProps"],
        exports: ["ControlChart", "controlLimits", "violations"],
      },
      {
        id: "pareto",
        name: "Pareto",
        sentence: "Causes sorted by weight with a cumulative line (a Pareto chart). Reach for it after a bad week, to see which few causes make most of the trouble.",
        about: ["`pareto()` sorts, adds up and folds the tail into one entry that stands last whatever its size; the bars, the line and the second axis are yours to compose."],
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
        types: ["TooltipProps", "LegendProps"],
        exports: ["Tooltip", "Legend", "DataTable"],
      },
      {
        id: "benchmark",
        name: "Benchmark",
        sentence: "Millions of points, measured in this browser rather than claimed: the time to prepare and draw them, and the frame rate while the pointer moves.",
        about: ["A hover redraws only the overlay layer, so the frame rate stays up over a million points. The figures in `packages/charts/docs/capabilities.md` come from here."],
        types: [],
        exports: ["Chart"],
      },
    ],
  },
];

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
