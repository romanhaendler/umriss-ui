import "./styles/charts.css";

export { Chart, type ChartProps } from "./Chart";
export { Area, type AreaProps } from "./Area";
export { Bar, type BarProps } from "./Bar";
export { Line, type LineProps } from "./Line";
export { Scatter, type ScatterProps } from "./Scatter";
export { StateBand, type StateBandProps } from "./StateBand";
export { Matrix, DEFAULT_GRADIENT, type MatrixProps } from "./Matrix";
export { LimitLine, LimitBand, type LimitLineProps, type LimitBandProps } from "./LimitLine";
export { ControlChart, type ControlChartProps } from "./ControlChart";
export { XAxis, YAxis, type XAxisProps, type YAxisProps } from "./Axis";
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
