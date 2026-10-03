/* <BoxPlot> - series configuration (box-plot 01).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   A box per x on the numeric x axis, as a bar stands there (ADR-0002): groups
   are positions a `tickFormat` names, and a time axis carries a box per hour as
   well. The caller brings every number and the library computes none (B2), so
   a box aggregated in a database draws as well as one computed in the
   browser. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, BoxSeriesConfig, ListAccessor } from "./types";

/** The props of `BoxPlot`. */
export interface BoxPlotProps<T> {
  /** The line across the box; null/undefined/NaN/±Infinity means a gap - no
      box is drawn there, whatever the other numbers say.
      @remarks R-2.5 */
  median: Accessor<T>;
  /** The box's lower edge. */
  lowerQuartile: Accessor<T>;
  /** The box's upper edge. */
  upperQuartile: Accessor<T>;
  /** Where the lower whisker ends - the caller's rule, not the minimum. */
  lowerWhisker: Accessor<T>;
  /** Where the upper whisker ends - the caller's rule, not the maximum. */
  upperWhisker: Accessor<T>;
  /** The values beyond the whiskers, per box: an array, empty or missing
      where there are none. Drawn with their box in its colour - one beyond
      three IQR of the box's own quartiles as a ring -, read in its tooltip
      and table row, never hit on their own (ADR-0040). */
  outliers?: ListAccessor<T>;
  /** The mean, drawn as a small ×: beside the median it shows a skew. */
  mean?: Accessor<T>;
  /** The notch's lower bound - usually of a confidence interval of the
      median. Both bounds or neither: one alone warns in DEV and is not
      drawn. */
  notchLower?: Accessor<T>;
  /** The notch's upper bound; see `notchLower`. */
  notchUpper?: Accessor<T>;
  /** How many values stand behind the box; read in the tooltip and the
      table, not drawn. */
  count?: Accessor<T>;
  /** Binding to an x axis.
      @remarks R-4.12 */
  xAxisId?: string;
  /** Binding to a y axis.
      @remarks R-4.12 */
  yAxisId?: string;
  /** Series-own data; overrides the container data.
      @remarks R-2.4 */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one a warning stands in DEV.
      @default "Series n", after its place in the chart */
  name?: string;
  /** Not drawn, not hit and not counted for its axes' extent. Its legend
      entry stays, drawn back. Controlled, typically from `Legend onToggle`. */
  hidden?: boolean;
  /** Every number of the box as the tooltip and the table write it.
      @default the y axis' `tickFormat`, else the built-in number format */
  format?: (value: number) => string;
  /** Any CSS colour value.
      @default the palette's `--uc-series-N` */
  color?: string;
  /** A role instead of a colour value; the theme resolves it. `color` beats
      it. Set by the caller: a box out of its specification is the caller's
      judgement, not the library's. */
  tone?: "ok" | "warning" | "alarm";
  /** Width as a fraction of the step, as a bar's: boxes and bars on one x axis
      share this fraction and stand side by side. */
  boxWidth?: number;
}

/** A series drawn as a box per x: median, quartiles and whiskers, optionally
    outliers, a mean and a notch. The caller brings every number - the library
    computes none. Renders nothing itself: it registers with the surrounding
    `Chart`. */
export function BoxPlot<T>(props: BoxPlotProps<T>): null {
  const {
    median,
    lowerQuartile,
    upperQuartile,
    lowerWhisker,
    upperWhisker,
    outliers,
    mean,
    notchLower,
    notchUpper,
    count,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    hidden,
    format,
    color,
    tone,
    boxWidth = 0.8,
  } = props;

  const config = useMemo<BoxSeriesConfig>(
    () =>
      ({
        kind: "box",
        accessor: median,
        lowerQuartile,
        upperQuartile,
        lowerWhisker,
        upperWhisker,
        outliers,
        mean,
        notchLower,
        notchUpper,
        count,
        xAxisId,
        yAxisId,
        data,
        name,
        hidden,
        format,
        color,
        tone,
        boxWidth,
      }) as BoxSeriesConfig,
    [median, lowerQuartile, upperQuartile, lowerWhisker, upperWhisker, outliers, mean, notchLower, notchUpper, count, xAxisId, yAxisId, data, name, hidden, format, color, tone, boxWidth],
  );

  useSeries("BoxPlot", config);
  return null;
}
