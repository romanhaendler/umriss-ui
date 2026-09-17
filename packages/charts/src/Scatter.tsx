/* <Scatter> - series configuration (4.3).
   Renders nothing itself: children are configuration collectors, the drawing
   happens exclusively in the scene (R-2.1).

   Deliberately without the marker policy of the line: "auto"/"always"/"never" is
   a line's question about whether it adorns its path. A scatter is nothing but
   markers - the property would have no meaning here. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, ScatterSeriesConfig } from "./types";

export interface ScatterProps<T> {
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
  /** Point radius in CSS pixels. */
  radius?: number;
}

export function Scatter<T>(props: ScatterProps<T>): null {
  const {
    accessor,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    color,
    tone,
    radius = 3,
  } = props;

  const config = useMemo<ScatterSeriesConfig>(
    () =>
      ({
        kind: "scatter",
        accessor,
        xAxisId,
        yAxisId,
        data,
        name,
        color,
        tone,
        radius,
      }) as ScatterSeriesConfig,
    [accessor, xAxisId, yAxisId, data, name, color, tone, radius],
  );

  useSeries("Scatter", config);
  return null;
}
