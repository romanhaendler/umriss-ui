/* useChart - where a chart's row type is bound (ADR-0048), as useTable binds
   a table's (ADR-0017).

   The series and axes it hands out are the components themselves, typed at
   the row: a series without `data` of its own reads the hook's rows, one with
   its own `data` is typed by that `data`. Only `Chart` is the hook's own - it
   carries the rows and the scene that holds the view (ADR-0047) - and it is
   made once, so that it keeps its identity over every render, whatever the
   view does. */

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Chart as FreeChart, type ChartProps } from "./Chart";
import { ChartScene } from "./scene";
import { Echoes, viewKey, type AxisSpans, type ChartView } from "./view";
import { XAxis, YAxis, type XAxisProps, type YAxisProps } from "./Axis";
import { Line, type LineProps } from "./Line";
import { Area, type AreaProps } from "./Area";
import { Bar, type BarProps } from "./Bar";
import { Scatter, type ScatterProps } from "./Scatter";
import { StateBand, type StateBandProps } from "./StateBand";
import { Matrix, type MatrixProps } from "./Matrix";
import { BoxPlot, type BoxPlotProps } from "./BoxPlot";

/** What `useChart` takes besides the rows: the view to start from and the
    handler that hears every change of it. */
export interface ChartOptions {
  /** The view to start from, and to go to whenever one differing in content
      from the last is handed in - the same view again changes nothing, and
      what it leaves out is reset; one the chart reported itself, handed back
      late, is its own state coming back and not gone to - two charts in step
      do not jump back mid-pan. The chart remembers none: where a view is kept
      is the application's decision. */
  initialView?: ChartView;
  /** Every change of the view, once, always the whole view - the one to keep,
      or to hand another chart as its `initialView`. A pan or zoom is reported
      at most once per frame. Not called for the view the chart starts with. */
  onViewChange?: (view: ChartView) => void;
}

/** What `useChart` hands back: the chart and its parts, typed at the row `Z`,
    its view and the setters that change it. A series given `data` of its own
    is typed by that `data` instead. */
export interface ChartParts<Z> {
  /** The chart over the hook's rows. One per `useChart`: it holds the view,
      and a second chart is a second call. */
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
  /** How the reader is looking at the chart. */
  view: ChartView;
  /** The span each zoomable x axis shows, by axis `id`; an axis absent shows
      its own `domain`. */
  domains: AxisSpans;
  /** Puts a span in view on a zoomable x axis - a lone one is `"x"`; `null`
      shows the axis' own `domain` again. */
  setDomain: (axisId: string, span: readonly [number, number] | null) => void;
  /** The hidden series, by `name`. */
  hidden: readonly string[];
  /** Hides the series `name`, or shows it where it is hidden - as a click on
      its legend entry does. Hiding the last series visible shows all. */
  toggleSeries: (name: string) => void;
  /** Hides every series but `name`; all are shown where none carries it. */
  showOnly: (name: string) => void;
  /** Shows every series again. */
  showAllSeries: () => void;
}

const NO_DOMAINS: AxisSpans = {};
const NO_NAMES: readonly string[] = [];

/** A chart over your rows: the parts it returns are typed at your row, so
    that a field name in `value` is checked by the compiler.
    @param rows The rows every series reads that brings no `data` of its own.
    @param options The view to start from and the handler of its changes.
    @returns `Chart`, `XAxis`, `YAxis` and every series kind - each keeps its
    identity over the renders -, the `view`, its `domains` and `hidden`, and
    the setters that change them. */
export function useChart<Z>(rows: readonly Z[], options: ChartOptions = {}): ChartParts<Z> {
  const { initialView, onViewChange } = options;
  const [bound] = useState(() => {
    const held = { rows };
    const scene = new ChartScene(initialView);
    function Chart(props: ChartProps): ReactNode {
      return <FreeChart {...props} data={held.rows} scene={scene} />;
    }
    const parts = { Chart, XAxis, YAxis, Line, Area, Bar, Scatter, StateBand, Matrix, BoxPlot,
      setDomain: scene.setDomain,
      toggleSeries: scene.toggleSeries,
      showOnly: scene.showOnly,
      showAllSeries: scene.showAllSeries,
    };
    return { held, scene, parts };
  });
  const { scene } = bound;
  const view = useSyncExternalStore(scene.subscribeView, scene.getView, scene.getView);

  /* A view handed in applies whenever its content differs from the last one
     handed in - before the paint, so the old view never shows for a frame -,
     unless it is the echo of one this chart reported. */
  const handedKey = initialView === undefined ? null : viewKey(initialView);
  const lastHanded = useRef(handedKey);
  const [echoes] = useState(() => new Echoes());
  useLayoutEffect(() => {
    if (initialView === undefined || handedKey === null || handedKey === lastHanded.current) return;
    lastHanded.current = handedKey;
    const echo = echoes.has(handedKey);
    echoes.handed(handedKey);
    if (!echo) scene.applyView(initialView);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- by content, not by identity
  }, [handedKey]);

  /* Every change of the view, once and whole, after the commit. The view the
     chart starts with is where it starts, not a change - also once the parts
     declared took out what does not occur here. */
  const key = viewKey(view);
  const reported = useRef(key);
  useEffect(() => {
    if (reported.current === key) return;
    reported.current = key;
    if (!scene.acted) return;
    echoes.reported(key);
    onViewChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the view, with that render's view and handler
  }, [key]);

  // The rows of this render, read by the chart below it - as the table's
  // registry takes its snapshot during render (useTable.tsx). A state or an
  // effect would hand the chart the rows one render late.
  // eslint-disable-next-line react-hooks/immutability -- the holder exists to be written here; its chart renders after this
  bound.held.rows = rows;
  // A new object only when the view changed: the parts keep their identity.
  return useMemo(() => ({ ...bound.parts, view, domains: view.domains ?? NO_DOMAINS, hidden: view.hidden ?? NO_NAMES }), [bound, view]);
}
