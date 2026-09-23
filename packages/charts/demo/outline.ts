/* The outline of the demo of @umriss-ui/charts - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. The shape comes from the
   shell (`@umriss-ui/demo`), which all three demos now share (ADR-0020).

   One page per thing a reader looks up by name - the same rule core and table
   follow, and the reason charts' four topics are no longer the pages. "Axes and
   area" is not something anybody imports; `XAxis`, `Line` and `ControlChart`
   are. What those four topics were is a rubric: it sorts the sidebar and stands
   in no address (CONTEXT.md, "Rubric").

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "chart",
    name: "Chart",
    sentence: "The container and its axes: what is drawn on, and what the drawing is measured against.",
    pages: [
      {
        id: "chart",
        name: "Chart",
        sentence: "The container: it holds the data, measures its host and draws its series on canvas - series and axes are its children, and their order in the JSX is the drawing order.",
        types: ["ChartProps"],
        exports: ["Chart"],
      },
      {
        id: "axis",
        name: "Axis",
        sentence: "What a value is measured against: extent, ticks and labelling, several per orientation - and an operating time axis that leaves the empty hours out and says so.",
        types: ["XAxisProps", "YAxisProps"],
        exports: ["XAxis", "YAxis", "operatingCalendar"],
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
        sentence: "A course over an axis - with markers, a dash pattern and a gap that stays a gap instead of being interpolated.",
        types: ["LineProps"],
        exports: ["Line"],
      },
      {
        id: "area",
        name: "Area",
        sentence: "A filled course, or a corridor between two channels - the baseline is a channel of its own and never a second series.",
        types: ["AreaProps"],
        exports: ["Area"],
      },
      {
        id: "bar",
        name: "Bar",
        sentence: "Bars on the numeric x axis, grouped where several stand side by side (ADR-0002).",
        types: ["BarProps"],
        exports: ["Bar"],
      },
      {
        id: "scatter",
        name: "Scatter",
        sentence: "Individual points without a connecting line - samples, measurements, anything that is not a course.",
        types: ["ScatterProps"],
        exports: ["Scatter"],
      },
      {
        id: "stateband",
        name: "StateBand",
        sentence: "What a machine was doing, as a partition of the time axis: every segment ends where the next begins, and a state is a number the state list names (ADR-0007).",
        types: ["StateBandProps"],
        exports: ["StateBand"],
      },
      {
        id: "matrix",
        name: "Matrix",
        sentence: "One value per cell across two discrete axes - coloured by assessment or across a gradient, with a hole where nothing was measured.",
        types: ["MatrixProps"],
        exports: ["Matrix", "DEFAULT_GRADIENT"],
      },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring",
    sentence: "A value read against its limits - and its shape over time.",
    pages: [
      {
        id: "limitline",
        name: "LimitLine",
        sentence: "The limits a curve is read against: a line as a landmark above the series, a band as ground below them - the same limit model the components of @umriss-ui/core use (ADR-0006).",
        types: ["LimitLineProps", "LimitBandProps"],
        exports: ["LimitLine", "LimitBand"],
      },
      {
        id: "controlchart",
        name: "ControlChart",
        sentence: "Center line, control limits and the rule violations of a process - out of a named reference window, never out of what happens to be visible (ADR-0008).",
        types: ["ControlChartProps"],
        exports: ["ControlChart", "controlLimits", "violations"],
      },
      {
        id: "pareto",
        name: "Pareto",
        sentence: "Sorted descending with a cumulative line: the pure module that sorts, accumulates and collects the tail - the composition stays the caller's.",
        types: [],
        exports: ["pareto"],
      },
      {
        id: "span",
        name: "Span",
        sentence: "Jobs with an explicit end: idle time between two of them is visible, and a double booking stays a conflict instead of becoming a layout.",
        types: ["SpanProps"],
        exports: ["Span"],
      },
    ],
  },
  {
    id: "around",
    name: "Around the chart",
    sentence: "What stands beside the series: what a hover says, what the colours mean - and what the whole thing costs.",
    pages: [
      {
        id: "tooltip",
        name: "Tooltip & Legend",
        sentence: "What a hover reports and what the colours mean: the hit as a whole x position or as the nearest point, the legend above or below the plot.",
        types: ["TooltipProps", "LegendProps"],
        exports: ["Tooltip", "Legend"],
      },
      {
        id: "benchmark",
        name: "Benchmark",
        sentence: "Millions of points, measured instead of claimed - and the proof that a hover draws the overlay layer and nothing else.",
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
