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
  /** Not drawn, not hit and not counted for its axes' extent - a fixed
      `domain` keeps the axis still. Its legend entry stays, drawn back.
      Controlled: the caller sets it, typically from `Legend onToggle`. */
  hidden?: boolean;
  /** The value as the tooltip writes it; without one the y axis' `tickFormat`,
      then the default. */
  format?: (value: number) => string;
  /** Any CSS colour value; without one the palette --uc-series-N. */
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

export function Bar<T>(props: BarProps<T>): null {
  const {
    accessor,
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
        hidden,
        format,
        color,
        tone,
        stack,
        normalize,
        barWidth,
      }) as BarSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, hidden, format, color, tone, stack, normalize, barWidth],
  );

  useSeries("Bar", config);
  return null;
}
