import "./styles/charts.css";

/* `Chart`, the axes and the series kinds are not exported on their own:
   `useChart(rows)` hands them out, bound to the rows (ADR-0048). Their props
   stay public types. */
export type { ChartProps } from "./Chart";
export type { AreaProps } from "./Area";
export type { BarProps } from "./Bar";
export type { LineProps } from "./Line";
export type { ScatterProps } from "./Scatter";
export type { StateBandProps } from "./StateBand";
export { DEFAULT_GRADIENT, type MatrixProps } from "./Matrix";
export { LimitLine, LimitBand, type LimitLineProps, type LimitBandProps } from "./LimitLine";
export { ControlChart, type ControlChartProps } from "./ControlChart";
export type { XAxisProps, YAxisProps } from "./Axis";
export { Legend, type LegendProps } from "./Legend";
export { Tooltip, type TooltipProps } from "./Tooltip";
export { invalidateTheme, type ResolvedTheme } from "./theme";
export { LinearScale } from "./scale";

/* The pure modules: they are the actual worth of the four instruments, and a
   caller who wants to draw something other than what the composition offers
   should be able to reach the arithmetic without rebuilding it. */
export { assess, verdictWeight } from "./limit";
export type { Assessment, Limit, LimitSet, Side, Severity, Verdict } from "./limit";
export {
  controlLimits,
  sigmaFromLimit,
  zones,
  ruleOutlier,
  ruleRun,
  ruleTrend,
  ruleTwoOfThree,
  violations,
  violatedIndices,
  defaultRules,
} from "./controlLimits";
export type {
  ControlLimits,
  ControlLimitOrigin,
  RuleName,
  RuleOptions,
  Violation,
  Zone,
} from "./controlLimits";
export { pareto, defaultOptions as paretoDefaults } from "./pareto";
export type { ParetoSettings } from "./pareto";
export type {
  ParetoEntry,
  ParetoItem,
  ParetoOptions,
  ParetoResult,
} from "./pareto";
export {
  workingCalendar,
  calendarFrom,
  toWorkingTime,
  toWallClock,
  mapSeries,
  removedIntervals,
  breaks,
  workingTicks,
  workingTimeTicks,
  timeStep,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
} from "./workingTime";
export type {
  CalendarInput,
  WorkingCalendar,
  WorkingInterval,
  WorkingTimeTick,
  RemovedSpan,
} from "./workingTime";
export type {
  Accessor,
  AreaSeriesConfig,
  LimitBandConfig,
  LimitConfig,
  LimitLineConfig,
  LimitRole,
  MatrixColoring,
  MatrixSeriesConfig,
  StateSeriesConfig,
  StateEntry,
  AxisConfig,
  AxisOrientation,
  AxisPosition,
  BarSeriesConfig,
  ChartPerf,
  LegendConfig,
  LineSeriesConfig,
  MaterializedSeries,
  Padding,
  Rect,
  Scale,
  ScatterSeriesConfig,
  SeriesBase,
  SeriesConfig,
  SeriesKind,
  TooltipConfig,
  TooltipHit,
  TooltipPoint,
} from "./types";

/* What @umriss-ui/schedule takes from here (ADR-0022): the canvas colour
   resolution for colours that are not the chart palette, and the clamped
   mapping into working time. At the end, by the workspace's rule for new
   exports - neither brings a stylesheet, so no picture could move. */
export { resolveColours, subscribeTheme } from "./theme";
export { toWorkingTimeClamped } from "./workingTime";
/* The shift of a tick grid onto local time, moved here from the schedule
   (charts-fixes 09): the calendar axis stands its days on it as well. */
export { localOffset } from "./workingTime";

/* The charts' own wording (ADR-0031); German stands behind the subpath
   `@umriss-ui/charts/wording/de`. */
export { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";

/* The data table (charts-alternatives 01). At the end, by the workspace's rule
   for new exports. */
export { DataTable } from "./DataTable";
export type { DataTableGroup } from "./scene";

/* The box plot (box-plot 01). At the end, by the workspace's rule for new
   exports. */
export type { BoxPlotProps } from "./BoxPlot";
export type { BoxSeriesConfig, BoxChannels } from "./types";
/* What a custom tooltip `render` reads of a box (box-plot 03, 04). */
export type { BoxNumbers, BoxExtras, ListAccessor } from "./types";

/* The chart bound to its rows (ADR-0048): the hook, and the forms a value
   takes. At the end, by the workspace's rule for new exports. */
export { useChart, type ChartParts } from "./useChart";
export type { ListField, ListValue, NumberField, Value } from "./types";

/* The chart's view (ADR-0047): what `useChart` takes as `initialView` and
   reports through `onViewChange`, and the limits of a zoomable axis. At the
   end, by the workspace's rule for new exports. */
export type { ChartOptions } from "./useChart";
export type { ChartView, ZoomLimits } from "./view";
