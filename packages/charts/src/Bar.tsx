/* <Bar> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Bars sit on the numeric x axis (ADR-0002): barWidth is a fraction of the step,
   not a width in pixels. Several bar series on the same x axis share this
   fraction and stand side by side. The foot lies at 0, and that 0 enters the
   extent of the y axis. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { ValueFunction, Value, BarSeriesConfig } from "./types";

/** The props of `Bar`. */
export interface BarProps<T> {
  /** Height - a number field of the row or a function of it;
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
  /** Width as a fraction of the step; just under 1, so that neighbours do not
      touch. Several bar series share this fraction. */
  barWidth?: number;
}

/** A series drawn as bars from 0 to its values, on the numeric x axis.
    Several bar series on one x axis stand side by side, or on each other with
    `stack`. Renders nothing itself: it registers with the surrounding
    `Chart`. */
export function Bar<T>(props: BarProps<T>): null {
  const {
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    format,
    color,
    tone,
    stack,
    normalize,
    barWidth = 0.8,
  } = props;
  const accessor = readerOf<ValueFunction<T>>(props.value);

  const config = useMemo<BarSeriesConfig>(
    () =>
      ({
        kind: "bar",
        accessor,
        xAxisId,
        yAxisId,
        data,
        name,
        format,
        color,
        tone,
        stack,
        normalize,
        barWidth,
      }) as BarSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, format, color, tone, stack, normalize, barWidth],
  );

  useSeries("Bar", config);
  return null;
}
