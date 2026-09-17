/* <Span> - the seventh series kind, and explicitly not the state band.

   A state band is a partition: every segment ends where the next begins. A span
   has an EXPLICIT end, and out of that follow the two things a partition forbids
   - idle time between two spans, and two spans overlapping on one lane. Both are
   real in a schedule, and the second is the finding for whose sake somebody
   opens it at all.

   Overlapping spans get a small offset and stay in their lane. Packing them into
   sub-lanes automatically would turn the conflict into a layout decision - and
   thereby make it invisible.

   The lane comes out of the base accessor: one series carries any number of
   resources, and every row says which one it belongs to. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, SpanSeriesConfig } from "./types";

export interface SpanProps<T> {
  /** Lane position on the y axis. */
  accessor: Accessor<T>;
  /** End on the x axis. Missing means open: the span runs to the edge and is
      drawn as open - a running job is a fact one wants to see. */
  to: Accessor<T>;
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
  /** Height of a span as a fraction of one domain unit of the y axis. */
  height?: number;
}

export function Span<T>(props: SpanProps<T>): null {
  const {
    accessor,
    to,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    color,
    height = 0.6,
  } = props;

  const config = useMemo<SpanSeriesConfig>(
    () =>
      ({
        kind: "span",
        accessor,
        to,
        xAxisId,
        yAxisId,
        data,
        name,
        color,
        height,
      }) as SpanSeriesConfig,
    [accessor, to, xAxisId, yAxisId, data, name, color, height],
  );

  useSeries("Span", config);
  return null;
}
