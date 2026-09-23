/* Types of the registration model (R-2.1) and of materialisation (R-2.7). */

import type { ReactNode } from "react";
import type { Assessment, Limit, LimitSet, Side, Severity, Verdict } from "./limit";
import type { OperatingInterval } from "./operatingTime";

/** Value access of a series. Compared by its source text, not its identity - an
    inline accessor is new on every render. Known limit: one that reads a
    changed closure variable under the same text is not run again; pass a new
    data reference then. A native or bound function is compared by identity. */
export type Accessor<T> = (d: T, index: number) => number | null | undefined;

/* ---------------- Series ----------------

   The series kind belongs to the series, never to the chart - which is exactly
   why kinds can be mixed within one chart (CONTEXT.md: Series kind). The set of
   kinds is closed: there is no renderer interface for third parties, because the
   drawing loop has to stay monomorphic (R-5.2).

   What every series carries stands in SeriesBase; what only one kind carries
   stands in the respective member of the union. A property that makes sense only
   for some kinds belongs in their members, not in the base with a comment. */

export interface SeriesBase<T = unknown> {
  /** Y value; null/undefined/NaN/±Infinity means a gap (R-2.5). */
  accessor: Accessor<T>;
  /** Series-own data; overrides the container data (R-2.4). */
  data?: readonly T[];
  xAxisId: string;
  yAxisId: string;
  name?: string;
  /** The value in the tooltip; before the y axis' `tickFormat`. Compared by its
      source text, as an accessor is. */
  format?: (value: number) => string;
  color?: string;
  /** A role instead of a colour value: the theme resolves it, in both themes.
      For series that mean something rather than just being the next one - the
      violating points of a control chart, say. `color` beats it. */
  tone?: "ok" | "warning" | "alarm";
  /** Not drawn, not hit, not in its axes' extent; its legend entry stays. */
  hidden?: boolean;
}

export interface LineSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "line";
  strokeWidth: number;
  dash?: readonly number[];
  markers: "auto" | "always" | "never";
  /** Sample-and-hold: each value holds until the next sample. */
  step?: boolean;
}

export interface ScatterSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "scatter";
  /** Point radius in CSS pixels. */
  radius: number;
}

export interface AreaSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "area";
  /** Lower edge; without a value the fixed baseline 0. */
  baseline?: Accessor<T>;
  /** Opacity of the fill; the outline stays fully opaque. */
  fillOpacity: number;
  strokeWidth: number;
  /** Dash pattern of the outline. */
  dash?: readonly number[];
}

export interface BarSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "bar";
  /** Width as a fraction of the step; the group shares this fraction. */
  barWidth: number;
}


/** One state of the closed set a state series knows. */
export interface StateEntry {
  label: string;
  color: string;
}

export interface StateSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "state";
  /** The closed set of states. The accessor yields the index into it - a number,
      not a key (ADR-0007). */
  states: readonly StateEntry[];
  /** Lower edge of the lane in domain units of the y axis; without a value the
      beginning of the axis domain. */
  laneFrom?: number;
  /** Upper edge of the lane; without a value the end of the axis domain. */
  laneTo?: number;
}

/** How a matrix colours its cells. Discretely by assessment - the same limits
    that colour a tile - or across a gradient. */
export type MatrixColoring =
  | { kind: "assessment"; limits: LimitSet }
  | {
      kind: "gradient";
      /** Colour stops from small to large; at least two. The stops ARE the
          steps - the library does not interpolate between them, because that
          would mean a colour parser for arbitrary CSS colour values, which this
          package does not have and is not to get (ADR-0011). Whoever wants a
          finer gradation names more colours. */
      stops: readonly string[];
      /** Value range of the gradient; without a value taken from the data. */
      range?: readonly [number, number];
    };

export interface MatrixSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "matrix";
  /** The value that decides the colour - the third channel (ADR-0011).
      The base accessor yields the row position, not this value. */
  value: Accessor<T>;
  coloring: MatrixColoring;
}

export type SeriesConfig<T = unknown> =
  | LineSeriesConfig<T>
  | AreaSeriesConfig<T>
  | BarSeriesConfig<T>
  | ScatterSeriesConfig<T>
  | StateSeriesConfig<T>
  | MatrixSeriesConfig<T>;

export type SeriesKind = SeriesConfig["kind"];

export type { Assessment, Limit, LimitSet, Side, Severity, Verdict };
export type { OperatingInterval, OperatingCalendar } from "./operatingTime";

export type AxisOrientation = "x" | "y";
export type AxisPosition = "bottom" | "top" | "left" | "right";

export interface AxisConfig<T = unknown> {
  id: string;
  orientation: AxisOrientation;
  position: AxisPosition;
  accessor: (d: T, index: number) => number;
  label?: string;
  tickCount?: number;
  tickFormat?: (v: number) => string;
  domain: "nice" | "data" | readonly [number, number];
  /** undefined = the default per R-4.15 (only the first registered axis per
      orientation). */
  grid?: boolean;
  /** Fixed tick values instead of the 1-2-5 algorithm. For axes whose values are
      not numbers but places: the lanes of a state stack, the categories of a
      Pareto. */
  ticks?: readonly number[];
  /** The values are instants in milliseconds: ticks on local boundaries,
      labels by level. A calendar implies it. */
  time?: boolean;
  /** Operating calendar: the intervals in which time counts. With it,
      materialisation maps wall clock time onto operating time before the scale
      calculates - the scale stays affine (ADR-0001). */
  calendar?: readonly OperatingInterval[];
  /** x axes only: where wheel, drag, pinch and double click propose a
      domain. Without it the axis does not zoom. */
  onDomainChange?: (domain: [number, number]) => void;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Materialised series: the draw loop works only on this (R-2.7).
    Gaps (null/undefined/NaN/±Infinity out of the accessor) are encoded as NaN
    (R-2.5). */
export interface MaterializedSeries {
  x: Float64Array;
  y: Float64Array;
  /** Lower edge, where the baseline is an accessor of its own; otherwise null.
      A fixed baseline needs no channel - it is a number (R-2.7). */
  y0: Float64Array | null;
  /** Value channel: the third value per point, which today only the matrix
      needs. Named rather than overloading y0 - a property that only some kinds
      carry does not belong in the shared type with a comment (ADR-0011). null
      for every kind that does not use it. */
  w: Float64Array | null;
  length: number;
}

/* The Scale interface is fixed (R-2.14); V0 implements only LinearScale. */
export interface Scale {
  domain: readonly [number, number];
  range: readonly [number, number];
  /** Affine coefficients of the mapping px = v·m + b.

      They stand in the interface because the drawing code reads them and
      computes inline in the point loop instead of calling toPx() per point -
      that is what carries 60 fps at millions of points. Every scale of this
      library is affine; see docs/adr/0001-affine-scale-contract.md, which also
      says what a later log scale would cost. */
  readonly m: number;
  readonly b: number;
  toPx(v: number): number;
  fromPx(px: number): number;
  ticks(n: number): number[];
}


/* ---------------- Limits on the chart ----------------

   A limit is not a series: no accessor, no data, no legend entry, no hit. It
   registers itself like a series, because that is the way a child says anything
   at all in this library. */

/** What a limit stands for. The difference is not cosmetic: a specification
    limit is chosen (what the customer assumes), a control limit is calculated
    (what the process normally does). A process can be in control and outside the
    specification and the other way round, and each of the four cases calls for
    something different - which is why the two lines have to look
    distinguishable (ADR-0008). */
export type LimitRole = "specification" | "control" | "zone";

export interface LimitBase {
  /** Axis on which the value lies. */
  axisId: string;
  orientation: AxisOrientation;
  severity: Severity;
  role: LimitRole;
  label?: string;
  /** A colour of its own; without one, that of the role or of the severity out of
      the theme. */
  color?: string;
  /** Pulls the extent of the axis along. Default true: an excluded limit yields a
      chart that looks right and does not show its most important line - and that
      nobody notices. A squashed plot is noticed at once. */
  inExtent: boolean;
}

export interface LimitLineConfig extends LimitBase {
  kind: "line";
  value: number;
}

export interface LimitBandConfig extends LimitBase {
  kind: "band";
  from: number;
  to: number;
}

export type LimitConfig = LimitLineConfig | LimitBandConfig;

/* ---------------- Legend and tooltip ---------------- */

export interface LegendConfig {
  placement: "top" | "bottom";
}

/** One hit per series in the tooltip (R-4.4). */
export interface TooltipPoint<T = unknown> {
  seriesName: string;
  color: string;
  /** The point's x value on its own x axis - with several x axes it can
      differ from the hit's. */
  xValue: number;
  yValue: number;
  datum: T;
  index: number;
  /** Only for the matrix: the value out of the value channel. It stands here and
      not in yValue, because yValue is the position on the y axis - for a matrix
      therefore the row. Putting both into one field would be exactly the
      overloading ADR-0011 is written against. */
  value?: number;
  /** Only for state series: the section being pointed at.
      A duration does not stand here - it is the difference of two numbers the
      entry already carries, and formatting it would presuppose knowing what the
      x axis means. The caller knows that, not this library. */
  segment?: { from: number; to: number; label: string };
}

export interface TooltipHit<T = unknown> {
  xValue: number;
  points: readonly TooltipPoint<T>[];
  /** Pixel position of the crosshair (snapped to the data point). */
  xPx: number;
  /** Pixel position of the primary hit. */
  yPx: number;
}

export interface TooltipConfig<T = unknown> {
  mode: "x" | "nearest";
  render?: (hit: TooltipHit<T>) => ReactNode;
}

/** Internal hover state; drives the overlay drawing and the tooltip. */
export interface HoverState {
  hit: TooltipHit;
  /** Series colours and pixel positions of the markers (overlay drawing). */
  marker: readonly { x: number; y: number; color: string }[];
  mouseX: number;
  mouseY: number;
}

/** Measurements of the instrumentation for the benchmark page (R-5.1). */
export interface ChartPerf {
  materializeMs: number;
  seriesDrawMs: number;
  points: number;
}
