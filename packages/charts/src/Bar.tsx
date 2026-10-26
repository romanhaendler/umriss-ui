/* <Bar> - series configuration.
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene.

   Bars sit on the numeric x axis (ADR-0002) - a category's place is a number
   there too (ADR-0052): barWidth is a fraction of the step, not a width in
   pixels. Several bar series on the same x axis share this
   fraction and stand side by side. The foot lies at 0, or at the `baseline`;
   either enters the extent of the y axis, and zero only without a baseline. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { ValueFunction, Value, BarSeriesConfig } from "./types";
import type { ValueFormat } from "./format";

/** The props of `Bar`. */
export interface BarProps<T> {
  /** Height - a number field of the row or a function of it;
      null/undefined/NaN/±Infinity means a gap. */
  value: Value<T>;
  /** Lower edge - a number field of the row or a function of it: the bar
      floats from here to `value`, either way up. A gap in either edge leaves
      the bar out. In a `stack` the stack below is the lower edge, and this is
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
  /** Width as a fraction of the step; just under 1, so that neighbours do not
      touch. Several bar series share this fraction. */
  barWidth?: number;
}

/** A series drawn as bars from 0, or from its `baseline`, to its values, one at each x: a category
    the x axis reads from the row, a number or an instant. Several bar series
    on one x axis stand side by side, or on each other with `stack`. Renders
    nothing itself: it registers with the surrounding `Chart`. */
export function Bar<T>(props: BarProps<T>): null {
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
    barWidth = 0.8,
  } = props;
  const accessor = readerOf<ValueFunction<T>>(props.value);

  const config = useMemo<BarSeriesConfig>(
    () =>
      ({
        kind: "bar",
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
        barWidth,
      }) as BarSeriesConfig,
    [accessor, baseline, xAxisId, yAxisId, data, name, format, color, tone, stack, normalize, barWidth],
  );

  useSeries("Bar", config);
  return null;
}
