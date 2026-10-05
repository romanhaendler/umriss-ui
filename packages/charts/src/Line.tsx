/* <Line> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1). */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { ValueFunction, Value, LineSeriesConfig } from "./types";

/** The props of `Line`. */
export interface LineProps<T> {
  /** Y value - a number field of the row or a function of it;
      null/undefined/NaN/±Infinity means a gap.
      @remarks R-2.5 */
  value: Value<T>;
  /** Binding to an x axis.
      @remarks R-4.12 */
  xAxisId?: string;
  /** Binding to a y axis.
      @remarks R-4.12 */
  yAxisId?: string;
  /** Series-own data; overrides the container data.
      @remarks R-2.4 */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one a warning stands in DEV - an
      unnamed series is a colour nobody can look up.
      @default "Series n", after its place in the chart */
  name?: string;
  /** The value as the tooltip writes it.
      @default the y axis' `tickFormat`, else the built-in number format */
  format?: (value: number) => string;
  /** Any CSS colour value.
      @default the palette's `--uc-series-N` */
  color?: string;
  /** A role instead of a colour value; the theme resolves it. */
  tone?: "ok" | "warning" | "alarm";
  /** Line width in CSS pixels. */
  strokeWidth?: number;
  /** Dash pattern as a run of lengths in CSS pixels.
      @default a solid line */
  dash?: readonly number[];
  /** When the individual points are drawn as marks: `auto` every point up to
      60 points and above that only a point between two gaps - it has no line
      to be seen by - `always`, or `never`, not even that one. */
  markers?: "auto" | "always" | "never";
  /** Sample-and-hold: each value holds as a horizontal until the next sample
      and jumps there - a target, a digital signal. A gap ends the hold at
      its x. The tooltip reports the sample the hold began with. */
  step?: boolean;
}

/** A series drawn as a line through its values; a gap breaks it. Renders
    nothing itself: it registers with the surrounding `Chart`. */
export function Line<T>(props: LineProps<T>): null {
  const {
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
  const accessor = readerOf<ValueFunction<T>>(props.value);

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
