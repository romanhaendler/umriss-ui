/* <Area> - series configuration.
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene.

   Without a baseline the area fills down to 0, and that 0 enters the extent of
   its y axis - otherwise the axis would cut off the foot of the area. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { ValueFunction, Value, AreaSeriesConfig } from "./types";
import type { ValueFormat } from "./format";

/** The props of `Area`. */
export interface AreaProps<T> {
  /** Upper edge - a number field of the row or a function of it;
      null/undefined/NaN/±Infinity means a gap. */
  value: Value<T>;
  /** Lower edge - a number field of the row or a function of it. In a `stack` the stack below is the lower edge, and this is
      not read.
      @default a fixed baseline at 0 */
  baseline?: Value<T>;
  /** Binding to an x axis. */
  xAxisId?: string;
  /** Binding to a y axis. */
  yAxisId?: string;
  /** Series-own data; overrides the container data. */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one a warning stands in DEV - an
      unnamed series is a colour nobody can look up.
      @default "Series n", after its place in the chart */
  name?: string;
  /** The value as the tooltip writes it, as a function or `NumberOptions`.
      @default the y axis' `tickFormat`, else the built-in number format */
  format?: ValueFormat;
  /** Any CSS colour value.
      @default the palette's `--uc-series-N` */
  color?: string;
  /** A role instead of a colour value; the theme resolves it. `color` beats
      it. */
  tone?: "ok" | "warning" | "alarm";
  /** The stack this series stands in: every Bar and Area with the same id on
      the same x and y axis stands on the ones registered before it. A gap
      stacks as zero; negative values stack downward from zero. The tooltip
      names each series' own value and the stack's total. */
  stack?: string;
  /** On any member of a stack, every x of the stack sums to 100 %: each value
      becomes its share, and the y axis reads in percent unless it has a
      `tickFormat`. The total stays the readings' own sum, written in the
      series' `format`. */
  normalize?: boolean;
  /** Opacity of the fill, from 0 to 1; the outline stays fully opaque. */
  fillOpacity?: number;
  /** Width of the outline along the upper edge in CSS pixels; 0 leaves it
      out. */
  strokeWidth?: number;
  /** Dash pattern of the outline as a run of lengths in CSS pixels. The fill
      stays whole.
      @default a solid outline */
  dash?: readonly number[];
  /** The longest step between two readings that is still filled through, in
      the x axis' units: milliseconds on a time axis, working time on a
      calendar axis, places on a category axis. A longer step is a gap: the
      area closes on both sides of it. A pointer farther than this from the
      nearest reading finds no hit. In a `stack` this is not read.
      @default no limit, a stretch without rows is bridged */
  maxGap?: number;
}

/** A series drawn as a filled area between its values and a baseline, 0
    without one. Renders nothing itself: it registers with the surrounding
    `Chart`. With `stack`, areas stand on each other. */
export function Area<T>(props: AreaProps<T>): null {
  const {
    baseline,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    format,
    color,
    tone,
    stack,
    normalize,
    fillOpacity = 0.18,
    strokeWidth = 1.5,
    dash,
    maxGap,
  } = props;
  const accessor = readerOf<ValueFunction<T>>(props.value);

  const config = useMemo<AreaSeriesConfig>(
    () =>
      ({
        kind: "area",
        accessor,
        baseline: readerOf<ValueFunction<T>>(baseline),
        xAxisId,
        yAxisId,
        data,
        name,
        format,
        color,
        tone,
        stack,
        normalize,
        fillOpacity,
        strokeWidth,
        dash,
        maxGap,
      }) as AreaSeriesConfig,
    [accessor, baseline, xAxisId, yAxisId, data, name, format, color, tone, stack, normalize, fillOpacity, strokeWidth, dash, maxGap],
  );

  useSeries("Area", config);
  return null;
}
