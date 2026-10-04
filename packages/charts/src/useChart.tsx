/* useChart - where a chart's row type is bound (ADR-0048), as useTable binds
   a table's (ADR-0017).

   The series and axes it hands out are the components themselves, typed at
   the row: a series without `data` of its own reads the hook's rows, one with
   its own `data` is typed by that `data`. Only `Chart` is the hook's own - it
   carries the rows - and it is made once, so that it keeps its identity over
   every render. */

import { useState, type ReactNode } from "react";
import { Chart as FreeChart, type ChartProps } from "./Chart";
import { XAxis, YAxis, type XAxisProps, type YAxisProps } from "./Axis";
import { Line, type LineProps } from "./Line";
import { Area, type AreaProps } from "./Area";
import { Bar, type BarProps } from "./Bar";
import { Scatter, type ScatterProps } from "./Scatter";
import { StateBand, type StateBandProps } from "./StateBand";
import { Matrix, type MatrixProps } from "./Matrix";
import { BoxPlot, type BoxPlotProps } from "./BoxPlot";

/** What `useChart` hands back: the chart and its parts, typed at the row `Z`.
    A series given `data` of its own is typed by that `data` instead. */
export interface ChartParts<Z> {
  /** The chart over the hook's rows. */
  Chart: (props: ChartProps) => ReactNode;
  /** An x axis reads the rows of every series bound to it: the hook's, or
      with `<XAxis<Row>>` those the series bring as their own `data`. */
  XAxis: <T = Z>(props: XAxisProps<T>) => null;
  YAxis: (props: YAxisProps) => null;
  Line: <T = Z>(props: LineProps<T>) => null;
  Area: <T = Z>(props: AreaProps<T>) => null;
  Bar: <T = Z>(props: BarProps<T>) => null;
  Scatter: <T = Z>(props: ScatterProps<T>) => null;
  StateBand: <T = Z>(props: StateBandProps<T>) => null;
  Matrix: <T = Z>(props: MatrixProps<T>) => null;
  BoxPlot: <T = Z>(props: BoxPlotProps<T>) => null;
}

/** A chart over your rows: the parts it returns are typed at your row, so
    that a field name in `value` is checked by the compiler.
    @param rows The rows every series reads that brings no `data` of its own.
    @returns `Chart`, `XAxis`, `YAxis` and every series kind. Each keeps its
    identity over the renders. */
export function useChart<Z>(rows: readonly Z[]): ChartParts<Z> {
  const [bound] = useState(() => {
    const held = { rows };
    function Chart(props: ChartProps): ReactNode {
      return <FreeChart {...props} data={held.rows} />;
    }
    const parts: ChartParts<Z> = { Chart, XAxis, YAxis, Line, Area, Bar, Scatter, StateBand, Matrix, BoxPlot };
    return { held, parts };
  });
  // The rows of this render, read by the chart below it - as the table's
  // registry takes its snapshot during render (useTable.tsx). A state or an
  // effect would hand the chart the rows one render late.
  // eslint-disable-next-line react-hooks/immutability -- the holder exists to be written here; its chart renders after this
  bound.held.rows = rows;
  return bound.parts;
}
