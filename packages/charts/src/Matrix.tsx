/* <Matrix> - the sixth series kind (ADR-0011).

   The base accessor yields the row position, `value` the third channel that
   decides the colour. The value channel is NAMED and does not overload the
   baseline channel: a property that only individual kinds carry does not belong
   in the shared type with a comment.

   Cell edges come out of the grid spacing of both axes - ADR-0002 in two
   dimensions. A missing value is a hole, not a zero.

   The library interpolates no colours: a gradient is exactly the list of its
   stops. Interpolating between two arbitrary CSS colours would mean bringing
   along a colour parser, which this package does not have and is not to get. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, MatrixColoring, MatrixSeriesConfig } from "./types";

/** Default gradient: a sequential set, light to dark, so that it stays readable
    as an order of lightness even without colour. It is a default, not a
    restriction - whoever has a scale of their own names it. */
export const DEFAULT_GRADIENT: readonly string[] = [
  "#eef2ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818cf8",
  "#6366f1",
  "#4f46e5",
  "#4338ca",
];

export interface MatrixProps<T> {
  /** Row position on the y axis. */
  accessor: Accessor<T>;
  /** The value that decides the colour. */
  value: Accessor<T>;
  /** Without a value the default gradient across the data range. */
  coloring?: MatrixColoring;
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
  /** The value as the tooltip writes it; without one the default. The y
      axis' `tickFormat` writes the row, not the value. */
  format?: (value: number) => string;
}

export function Matrix<T>(props: MatrixProps<T>): null {
  const {
    accessor,
    value,
    coloring,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    hidden,
    format,
  } = props;

  const effectiveColoring = useMemo<MatrixColoring>(
    () => coloring ?? { kind: "gradient", stops: DEFAULT_GRADIENT },
    [coloring],
  );

  const config = useMemo<MatrixSeriesConfig>(
    () =>
      ({
        kind: "matrix",
        accessor,
        value,
        coloring: effectiveColoring,
        xAxisId,
        yAxisId,
        data,
        name,
        hidden,
        format,
      }) as MatrixSeriesConfig,
    [accessor, value, effectiveColoring, xAxisId, yAxisId, data, name, hidden, format],
  );

  useSeries("Matrix", config);
  return null;
}
