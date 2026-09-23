/* <Line> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1). */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, LineSeriesConfig } from "./types";

export interface LineProps<T> {
  /** Y value; null/undefined/NaN/±Infinity means a gap (R-2.5). */
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
  /** The value as the tooltip writes it; without one the y axis' `tickFormat`,
      then the default. */
  format?: (value: number) => string;
  /** Any CSS colour value; without one the palette --uc-series-N. */
  color?: string;
  /** A role instead of a colour value; the theme resolves it. */
  tone?: "ok" | "warning" | "alarm";
  /** Line width in CSS pixels. */
  strokeWidth?: number;
  /** Dash pattern as a run of lengths in CSS pixels; without one a solid line. */
  dash?: readonly number[];
  /** When the individual points are drawn as marks: `auto` every point up to
      60 points and above that only a point between two gaps - it has no line
      to be seen by - `always`, or `never`, not even that one. */
  markers?: "auto" | "always" | "never";
  /** Sample-and-hold: each value holds as a horizontal until the next sample
      and jumps there - a set point, a digital signal. A gap ends the hold at
      its x. The tooltip reports the sample the hold began with. */
  step?: boolean;
}

export function Line<T>(props: LineProps<T>): null {
  const {
    accessor,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    format,
    color,
    tone,
    strokeWidth = 1.5,
    dash,
    markers = "auto",
    step,
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
        format,
        color,
        tone,
        strokeWidth,
        dash,
        markers,
        step,
      }) as LineSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, format, color, tone, strokeWidth, dash, markers, step],
  );

  useSeries("Line", config);
  return null;
}
