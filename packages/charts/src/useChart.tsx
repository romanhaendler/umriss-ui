/* useChart - where a chart's row type is bound (ADR-0048), as useTable binds
   a table's (ADR-0017).

   The series and axes it hands out are the components themselves, typed at
   the row: a series without `data` of its own reads the hook's rows, one with
   its own `data` is typed by that `data`. Only `Chart` is the hook's own - it
   carries the rows and the scene that holds the view (ADR-0047) - and it is
   made once, so that it keeps its identity over every render, whatever the
   view does. */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Chart as FreeChart, type ChartProps } from "./Chart";
import { ChartScene } from "./scene";
import { warnOnce } from "./dev";
import { toPicture } from "./picture";
import type { ChartRange, TooltipHit } from "./types";
import { viewKey, type AxisSpans, type ChartView } from "./view";
import { XAxis, YAxis, type XAxisProps, type YAxisProps } from "./Axis";
import { Line, type LineProps } from "./Line";
import { Area, type AreaProps } from "./Area";
import { Bar, type BarProps } from "./Bar";
import { Scatter, type ScatterProps } from "./Scatter";
import { StateBand, type OneLane, type StateBandProps } from "./StateBand";
import { Matrix, type MatrixProps } from "./Matrix";
import { BoxPlot, type BoxPlotProps } from "./BoxPlot";

/** What `useChart` takes besides the rows: the view to start from and the
    handler that hears every change of it. */
export interface ChartOptions<Z = unknown, V extends number | string = number> {
  /** The view to start from, read once when the hook first runs; a different
      value on a later render is ignored, as React ignores a changed
      `defaultValue`. To go to a view later, call `setView`. The chart
      remembers none: where a view is kept is the application's decision. */
  initialView?: ChartView;
  /** Every change the reader makes, once, always the whole view - the one to
      keep, or to hand another chart's `setView`. A pan or zoom is reported at
      most once per frame. Not called for the view the chart starts with, nor
      for one `setView` applies. */
  onViewChange?: (view: ChartView) => void;
  /** The reader chose a point: a click on a hit (a tap too), or Enter on the
      Active point - the same hit the tooltip's `render` receives. Once per
      click; the end of a drag does not report, and the second click of a
      double click does not either. The chart holds no selection and draws
      none: what is chosen is the application's state. Needs a `<Tooltip>`,
      which makes the hits; the hit does not travel over `syncId`. */
  onSelect?: (hit: TooltipHit<Z>) => void;
  /** The reader marked a stretch of an x axis: Alt with a drag where the chart
      zooms, a plain drag where it does not. Called once, on release - once per
      x axis -, with `from` not after `to`, in the axis' own values: numbers, milliseconds on a time axis, wall-clock instants on a calendar axis, and on a category axis the first and last category covered, as strings - say so in the handler's parameter, `ChartRange<string>`. A band
      covers the stretch while the pointer is down; the chart keeps no range and
      draws none afterwards, and it does not travel over `syncId`. A press that
      travels 4 px or less is a click and reaches `onSelect`; Escape and a
      cancelled pointer report nothing. */
  onRange?: (range: ChartRange<V>) => void;
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
  StateBand: <T = Z>(props: StateBandProps<T> & OneLane) => null;
  Matrix: <T = Z>(props: MatrixProps<T>) => null;
  BoxPlot: <T = Z>(props: BoxPlotProps<T>) => null;
  /** How the reader is looking at the chart. */
  view: ChartView;
  /** The span each zoomable x axis shows, by axis `id`; an axis absent shows
      its own `domain`. */
  domains: AxisSpans;
  /** Goes to a whole view; what it leaves out is shown whole again. Not
      reported through `onViewChange`: two charts kept in step by
      `onViewChange: (v) => other.setView(v)` in both directions do not answer
      each other. A view with the content already shown changes nothing. */
  setView: (view: ChartView) => void;
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
  /** A PNG of the chart as it stands: the plot with its grid, series and
      limits, the axes with ticks, labels and titles, and the legend, on the
      chart's own ground in the colour scheme in use, at the chart's size on
      screen and at least twice its CSS pixels. Not in it: the tooltip, the
      crosshair and hover marks, the "Show all" button, the data key and
      its table, the screen-reader texts, and any title. Where the picture goes
      - a download, the clipboard, an upload - is the application's. Rejects
      with an `Error` when the chart is not on screen or has no size. */
  toPng: () => Promise<Blob>;
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
export function useChart<Z, V extends number | string = number>(rows: readonly Z[], options: ChartOptions<Z, V> = {}): ChartParts<Z> {
  const { initialView, onViewChange, onSelect, onRange } = options;
  /* The key of the view last reported, or applied by `setView` - what the
     effect below compares the view against. */
  const reported = useRef("");
  const [bound] = useState(() => {
    const held = { rows };
    const scene = new ChartScene(initialView);
    function Chart(props: ChartProps): ReactNode {
      return <FreeChart {...props} data={held.rows} scene={scene} />;
    }
    const parts = { Chart, XAxis, YAxis, Line, Area, Bar, Scatter, StateBand, Matrix, BoxPlot,
      setView: (next: ChartView) => {
        scene.applyView(next);
        reported.current = viewKey(scene.getView());
      },
      setDomain: scene.setDomain,
      toggleSeries: scene.toggleSeries,
      showOnly: scene.showOnly,
      showAllSeries: scene.showAllSeries,
      toPng: () => toPicture(scene),
    };
    return { held, scene, parts };
  });
  const { scene } = bound;
  const view = useSyncExternalStore(scene.subscribeView, scene.getView, scene.getView);

  /* Every change the reader makes, once and whole, after the commit. The view
     the chart starts with is where it starts, not a change - also once the
     parts declared took out what does not occur here. `setView` has noted its
     view as reported already, so it is not one. */
  const key = viewKey(view);
  useEffect(() => {
    if (reported.current === key) return;
    reported.current = key;
    if (!scene.acted) return;
    onViewChange?.(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the view, with that render's view and handler
  }, [key]);

  // The rows of this render, read by the chart below it - as the table's
  // registry takes its snapshot during render (useTable.tsx). A state or an
  // effect would hand the chart the rows one render late.
  // eslint-disable-next-line react-hooks/immutability -- the holder exists to be written here; its chart renders after this
  bound.held.rows = rows;
  // eslint-disable-next-line react-hooks/immutability -- as the rows: read when the reader acts, never during a render
  scene.onSelect = (onSelect ?? null) as ChartScene["onSelect"];
  // eslint-disable-next-line react-hooks/immutability -- as onSelect
  scene.onRange = (onRange as typeof scene.onRange) ?? null;
  useEffect(() => {
    if (onSelect !== undefined && !scene.hasTooltip)
      warnOnce("select-without-tooltip", "`onSelect` needs a <Tooltip> - the hits it reports are the tooltip's.");
  }, [onSelect === undefined, scene]); // eslint-disable-line react-hooks/exhaustive-deps -- presence only
  useEffect(() => {
    if (onRange !== undefined && !scene.hasTooltip)
      warnOnce("range-without-tooltip", "`onRange` needs a <Tooltip> for the keyboard - without one only the pointer marks a range.");
  }, [onRange === undefined, scene]); // eslint-disable-line react-hooks/exhaustive-deps -- presence only
  // A new object only when the view changed: the parts keep their identity.
  return useMemo(() => ({ ...bound.parts, view, domains: view.domains ?? NO_DOMAINS, hidden: view.hidden ?? NO_NAMES }), [bound, view]);
}
