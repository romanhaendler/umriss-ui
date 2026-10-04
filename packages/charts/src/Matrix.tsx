/* <Matrix> - the sixth series kind (ADR-0011).

   `value` yields the row position, as it yields the y position on every
   kind, and `level` the third channel that decides the colour. The level
   channel is NAMED and does not overload the baseline channel: a property that only individual kinds carry does not belong
   in the shared type with a comment.

   Cell edges come out of the grid spacing of both axes - ADR-0002 in two
   dimensions. A missing level is a hole, not a zero.

   The library interpolates no colours: a gradient is exactly the list of its
   stops. Interpolating between two arbitrary CSS colours would mean bringing
   along a colour parser, which this package does not have and is not to get. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { Accessor, Value, MatrixColoring, MatrixSeriesConfig } from "./types";

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

/** The props of `Matrix`. */
export interface MatrixProps<T> {
  /** Row position on the y axis - a number field of the row or a function
      of it, as every series' y position. */
  value: Value<T>;
  /** The level that decides the colour - a number field of the row or a
      function of it. A missing level is a hole, not a zero. */
  level: Value<T>;
  /** How the level colours a cell: by assessment against limits, or across
      a gradient.
      @default { kind: "gradient", stops: DEFAULT_GRADIENT } */
  coloring?: MatrixColoring;
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
  /** The level as the tooltip writes it. The y axis' `tickFormat` writes the
      row, not the level.
      @default the built-in number format */
  format?: (value: number) => string;
}

/** A series drawn as a grid of coloured cells: `value` gives the row,
    `level` the colour - by the limits of an assessment or across a gradient.
    A missing level is a hole, not a zero. Renders nothing itself: it registers
    with the surrounding `Chart`. */
export function Matrix<T>(props: MatrixProps<T>): null {
  const {
    value,
    level,
    coloring,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
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
        accessor: readerOf<Accessor<T>>(value),
        level: readerOf<Accessor<T>>(level),
        coloring: effectiveColoring,
        xAxisId,
        yAxisId,
        data,
        name,
        format,
      }) as MatrixSeriesConfig,
    [value, level, effectiveColoring, xAxisId, yAxisId, data, name, format],
  );

  useSeries("Matrix", config);
  return null;
}
