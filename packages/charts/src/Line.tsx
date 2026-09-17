/* <Line> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1). */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, LineSeriesConfig } from "./types";

export interface LineProps<T> {
  /** Y value; null/undefined/NaN means a gap (R-2.5). */
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
  /** A role instead of a colour value; the theme resolves it. */
  tone?: "ok" | "warning" | "alarm";
  /** Line width in CSS pixels. */
  strokeWidth?: number;
  /** Dash pattern as a run of lengths in CSS pixels; without one a solid line. */
  dash?: readonly number[];
  /** When the individual points are drawn as marks: `auto` from a density at
      which they no longer run into each other, `always`, `never`. */
  markers?: "auto" | "always" | "never";
}

export function Line<T>(props: LineProps<T>): null {
  const {
    accessor,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    color,
    tone,
    strokeWidth = 1.5,
    dash,
    markers = "auto",
  } = props;

  const config = useMemo<LineSeriesConfig>(
    () =>
      ({
        kind: "line",
        accessor,
        xAxisId,
        yAxisId,
        data,
        name,
        color,
        tone,
        strokeWidth,
        dash,
        markers,
      }) as LineSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, color, tone, strokeWidth, dash, markers],
  );

  useSeries("Line", config);
  return null;
}
