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
import type { AxisField, ValueFunction, Value, MatrixColoring, MatrixSeriesConfig } from "./types";
import type { ValueFormat } from "./format";

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
  /** The row on the y axis - a field of the data's row or a function of it.
      A number is a position, as every series' y is; a string is a category:
      the y axis then has a named row per distinct one, the first at the top,
      in the order the data bring them or the y axis' `categories`
      (ADR-0052). Never an instant: a `Date` is refused. */
  value: AxisField<T, number | string | null | undefined> | ((d: T, index: number) => number | string | null | undefined);
  /** The level that decides the colour - a number field of the row or a
      function of it. A missing level is a hole, not a zero. */
  level: Value<T>;
  /** How the level colours a cell: by assessment against limits, or across
      a gradient. A gradient's legend entry shows a colour bar: its steps, with the range's two ends written under
      them in `format` and the inner edges where they fit. An assessment keeps its three colours.
      @default { kind: "gradient", stops: DEFAULT_GRADIENT } */
  coloring?: MatrixColoring;
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
  /** The level as the tooltip writes it, as a function or `NumberOptions`. The y axis' `tickFormat` writes the
      row, not the level.
      @default the built-in number format */
  format?: ValueFormat;
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
        // A row named by a string is given its place in materialisation.
        accessor: readerOf<(d: T, index: number) => number | string | null | undefined>(value) as ValueFunction<T>,
        level: readerOf<ValueFunction<T>>(level),
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
