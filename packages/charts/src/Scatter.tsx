/* <Scatter> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Deliberately without the marker policy of the line: "auto"/"always"/"never" is
   a line's question about whether it adorns its path. A scatter is nothing but
   markers - the property would have no meaning here. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { Accessor, Value, ScatterSeriesConfig } from "./types";

/** The props of `Scatter`. */
export interface ScatterProps<T> {
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
  /** A role instead of a colour value; the theme resolves it. */
  tone?: "ok" | "warning" | "alarm";
  /** Point radius in CSS pixels. */
  radius?: number;
}

/** A series drawn as points only, one per value. Renders nothing itself: it
    registers with the surrounding `Chart`. */
export function Scatter<T>(props: ScatterProps<T>): null {
  const {
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    hidden,
    format,
    color,
    tone,
    radius = 3,
  } = props;
  const accessor = readerOf<Accessor<T>>(props.value);

  const config = useMemo<ScatterSeriesConfig>(
    () =>
      ({
        kind: "scatter",
        accessor,
        xAxisId,
        yAxisId,
        data,
        name,
        hidden,
        format,
        color,
        tone,
        radius,
      }) as ScatterSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, hidden, format, color, tone, radius],
  );

  useSeries("Scatter", config);
  return null;
}
