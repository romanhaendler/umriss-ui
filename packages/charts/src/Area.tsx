/* <Area> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Without a baseline the area fills down to 0, and that 0 enters the extent of
   its y axis - otherwise the axis would cut off the foot of the area. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { Accessor, Value, AreaSeriesConfig } from "./types";

/** The props of `Area`. */
export interface AreaProps<T> {
  /** Upper edge - a number field of the row or a function of it;
      null/undefined/NaN/±Infinity means a gap.
      @remarks R-2.5 */
  value?: Value<T>;
  /** The older form of `value`: a function only. */
  accessor?: Accessor<T>;
  /** Lower edge - a number field of the row or a function of it. In a `stack` the stack below is the lower edge, and this is
      not read.
      @default a fixed baseline at 0 */
  baseline?: Value<T>;
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
  /** Not drawn, not hit and not counted for its axes' extent - a fixed
      `domain` keeps the axis still. Its legend entry stays, drawn back.
      Controlled: the caller sets it, typically from `Legend onToggle`. */
  hidden?: boolean;
  /** The value as the tooltip writes it.
      @default the y axis' `tickFormat`, else the built-in number format */
  format?: (value: number) => string;
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
    hidden,
    format,
    color,
    tone,
    stack,
    normalize,
    fillOpacity = 0.18,
    strokeWidth = 1.5,
    dash,
  } = props;
  const accessor = readerOf<Accessor<T>>(props.value) ?? props.accessor;

  const config = useMemo<AreaSeriesConfig>(
    () =>
      ({
        kind: "area",
        accessor,
        baseline: readerOf<Accessor<T>>(baseline),
        xAxisId,
        yAxisId,
        data,
        name,
        hidden,
        format,
        color,
        tone,
        stack,
        normalize,
        fillOpacity,
        strokeWidth,
        dash,
      }) as AreaSeriesConfig,
    [accessor, baseline, xAxisId, yAxisId, data, name, hidden, format, color, tone, stack, normalize, fillOpacity, strokeWidth, dash],
  );

  useSeries("Area", config);
  return null;
}
