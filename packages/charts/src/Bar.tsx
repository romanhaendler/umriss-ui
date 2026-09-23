/* <Bar> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Bars sit on the numeric x axis (ADR-0002): barWidth is a fraction of the step,
   not a width in pixels. Several bar series on the same x axis share this
   fraction and stand side by side. The foot lies at 0, and that 0 enters the
   extent of the y axis. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, BarSeriesConfig } from "./types";

export interface BarProps<T> {
  /** Height; null/undefined/NaN/±Infinity means a gap (R-2.5). */
  accessor: Accessor<T>;
  /** Binding to an x axis (R-4.12). */
  xAxisId?: string;
  /** Binding to a y axis (R-4.12). */
  yAxisId?: string;
  /** Series-own data; overrides the container data (R-2.4). */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one the series is called
      "Series n" and a warning stands in DEV - an unnamed series is a colour
      nobody can look up. */
  name?: string;
  /** Any CSS colour value; without one the palette --uc-series-N. */
  color?: string;
  /** Width as a fraction of the step; just under 1, so that neighbours do not
      touch. Several bar series share this fraction. */
  barWidth?: number;
}

export function Bar<T>(props: BarProps<T>): null {
  const {
    accessor,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    color,
    barWidth = 0.8,
  } = props;

  const config = useMemo<BarSeriesConfig>(
    () =>
      ({
        kind: "bar",
        accessor,
        xAxisId,
        yAxisId,
        data,
        name,
        color,
        barWidth,
      }) as BarSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, color, barWidth],
  );

  useSeries("Bar", config);
  return null;
}
