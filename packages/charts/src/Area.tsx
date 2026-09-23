/* <Area> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Without a baseline the area fills down to 0, and that 0 enters the extent of
   its y axis - otherwise the axis would cut off the foot of the area. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, AreaSeriesConfig } from "./types";

export interface AreaProps<T> {
  /** Upper edge; null/undefined/NaN/±Infinity means a gap (R-2.5). */
  accessor: Accessor<T>;
  /** Lower edge; without a value the fixed baseline 0. */
  baseline?: Accessor<T>;
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
  /** The value as the tooltip writes it; without one the y axis' `tickFormat`,
      then the default. */
  format?: (value: number) => string;
  /** Any CSS colour value; without one the palette --uc-series-N. */
  color?: string;
  /** Opacity of the fill; the outline stays fully opaque. */
  fillOpacity?: number;
  /** Width of the outline along the upper edge; 0 leaves it out. */
  strokeWidth?: number;
}

export function Area<T>(props: AreaProps<T>): null {
  const {
    accessor,
    baseline,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    format,
    color,
    fillOpacity = 0.18,
    strokeWidth = 1.5,
  } = props;

  const config = useMemo<AreaSeriesConfig>(
    () =>
      ({
        kind: "area",
        accessor,
        baseline,
        xAxisId,
        yAxisId,
        data,
        name,
        format,
        color,
        fillOpacity,
        strokeWidth,
      }) as AreaSeriesConfig,
    [accessor, baseline, xAxisId, yAxisId, data, name, format, color, fillOpacity, strokeWidth],
  );

  useSeries("Area", config);
  return null;
}
