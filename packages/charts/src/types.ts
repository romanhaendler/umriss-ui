/* Types of the registration model (R-2.1) and of materialisation (R-2.7). */

import type { ReactNode } from "react";
import type { Assessment, Limit, LimitSet, Side, Severity, Verdict } from "./limit";
import type { WorkingInterval } from "./workingTime";
import type { ZoomLimits } from "./view";

/** Value access of a series. Compared by its source text, not its identity - an
    inline accessor is new on every render. Known limit: one that reads a
    changed closure variable under the same text is not run again; pass a new
    data reference then. A native or bound function is compared by identity. */
export type Accessor<T> = (d: T, index: number) => number | null | undefined;

/** A list per datum - a box's outliers (ADR-0040). null/undefined or an
    empty array is none; a value that is not finite is left out. */
export type ListAccessor<T> = (d: T, index: number) => readonly number[] | null | undefined;

/* Both field types are NoInfer: the row type comes from the rows or a
   series' own `data`, never from the name - else a misspelt name would make
   up a row type of its own that has it. */

/** The fields of a row whose value is a number, or absent. */
export type NumberField<T> = NoInfer<
  {
    [K in keyof T & string]-?: T[K] extends number | null | undefined ? K : never;
  }[keyof T & string]
>;

/** The fields of a row whose value is a list of numbers, or absent. */
export type ListField<T> = NoInfer<
  {
    [K in keyof T & string]-?: T[K] extends readonly number[] | null | undefined ? K : never;
  }[keyof T & string]
>;

/** A value read from the row (ADR-0048): the name of a number field, compared
    by its name, or a function, compared by its source text (`Accessor`). */
export type Value<T> = NumberField<T> | Accessor<T>;

/** A list read from the row: the name of a list field or a function. */
export type ListValue<T> = ListField<T> | ListAccessor<T>;

/* ---------------- Series ----------------

   The series kind belongs to the series, never to the chart - which is exactly
   why kinds can be mixed within one chart (CONTEXT.md: Series kind). The set of
   kinds is closed: there is no renderer interface for third parties, because the
   drawing loop has to stay monomorphic (R-5.2).

   What every series carries stands in SeriesBase; what only one kind carries
   stands in the respective member of the union. A property that makes sense only
   for some kinds belongs in their members, not in the base with a comment. */

/** What every series registers, whatever its kind: where its values come from,
    which axes it stands on, and how it is named and coloured. */
export interface SeriesBase<T = unknown> {
  /** Y value; null/undefined/NaN/±Infinity means a gap.
      @remarks R-2.5 */
  accessor: Accessor<T>;
  /** Series-own data; overrides the container data.
      @remarks R-2.4 */
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

/** A `Line` as the chart holds it once registered. */
export interface LineSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "line";
  strokeWidth: number;
  dash?: readonly number[];
  markers: "auto" | "always" | "never";
  /** Sample-and-hold: each value holds until the next sample. */
  step?: boolean;
}

/** A `Scatter` as the chart holds it once registered. */
export interface ScatterSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "scatter";
  /** Point radius in CSS pixels. */
  radius: number;
}

/** What the two filled kinds share: a place in a stack (charts-stacking). */
export interface Stackable {
  /** The stack this series stands in: series with the same id, on the same x
      and y axis, stack in registration order (K1). */
  stack?: string;
  /** On any member, the whole stack sums to 100 at every x (K5). */
  normalize?: boolean;
}

/** An `Area` as the chart holds it once registered. */
export interface AreaSeriesConfig<T = unknown> extends SeriesBase<T>, Stackable {
  kind: "area";
  /** Lower edge; without a value the fixed baseline 0. */
  baseline?: Accessor<T>;
  /** Opacity of the fill; the outline stays fully opaque. */
  fillOpacity: number;
  strokeWidth: number;
  /** Dash pattern of the outline. */
  dash?: readonly number[];
}

/** A `Bar` as the chart holds it once registered. */
export interface BarSeriesConfig<T = unknown> extends SeriesBase<T>, Stackable {
  kind: "bar";
  /** Width as a fraction of the step; the group shares this fraction. */
  barWidth: number;
}

/** A box plot (CONTEXT.md: Box). The base accessor is the median; the four
    further numbers are the caller's, computed by whatever method the caller
    chose - the library draws them and computes none. */
export interface BoxSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "box";
  lowerQuartile: Accessor<T>;
  upperQuartile: Accessor<T>;
  lowerWhisker: Accessor<T>;
  upperWhisker: Accessor<T>;
  /** The values beyond the whiskers, per box (ADR-0040). */
  outliers?: ListAccessor<T>;
  mean?: Accessor<T>;
  /** Both bounds or neither (CONTEXT.md: Notch). */
  notchLower?: Accessor<T>;
  notchUpper?: Accessor<T>;
  /** How many values stand behind the box; no y value. */
  count?: Accessor<T>;
  /** Width as a fraction of the step; boxes and bars on one x axis share it. */
  boxWidth: number;
}

/** One state of the closed set a state series knows. */
export interface StateEntry {
  label: string;
  color: string;
}

/** A `StateBand` as the chart holds it once registered: its accessor yields
    an index into `states`. */
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
      /** Value range of the gradient.
          @default the range of the data */
      range?: readonly [number, number];
    };

/** A `Matrix` as the chart holds it once registered: its base accessor is the
    row, `level` the colour. */
export interface MatrixSeriesConfig<T = unknown> extends SeriesBase<T> {
  kind: "matrix";
  /** The level that decides the colour - the third channel (ADR-0011).
      The base accessor yields the row position, not this level. */
  level: Accessor<T>;
  coloring: MatrixColoring;
}

/** Any registered series, told apart by `kind`. */
export type SeriesConfig<T = unknown> =
  | LineSeriesConfig<T>
  | AreaSeriesConfig<T>
  | BarSeriesConfig<T>
  | BoxSeriesConfig<T>
  | ScatterSeriesConfig<T>
  | StateSeriesConfig<T>
  | MatrixSeriesConfig<T>;

/** The kinds of series a chart draws: `line`, `area`, `bar`, `box`, `scatter`,
    `state` and `matrix`. The set is closed. */
export type SeriesKind = SeriesConfig["kind"];

export type { Assessment, Limit, LimitSet, Side, Severity, Verdict };
export type { WorkingInterval, WorkingCalendar } from "./workingTime";

/** Whether an axis or a limit runs along x or along y. */
export type AxisOrientation = "x" | "y";
/** The edge of the plot an axis stands at: `bottom` or `top` for x, `left` or
    `right` for y. */
export type AxisPosition = "bottom" | "top" | "left" | "right";

/** An `XAxis` or `YAxis` as the chart holds it once registered. */
export interface AxisConfig<T = unknown> {
  id: string;
  orientation: AxisOrientation;
  position: AxisPosition;
  /** Where a row lies along the axis; an x axis' only - along y the series
      place their rows. */
  accessor?: (d: T, index: number) => number;
  label?: string;
  tickCount?: number;
  tickFormat?: (v: number) => string;
  /** "visible" is a y axis' only: the extent of what its series show inside
      their x axis' domain. */
  domain: "nice" | "data" | "visible" | readonly [number, number];
  /** Whether the axis draws its grid lines.
      @default only the first registered axis per orientation
      @remarks R-4.15 */
  grid?: boolean;
  /** Fixed tick values instead of the 1-2-5 algorithm. For axes whose values are
      not numbers but places: the lanes of a state stack, the categories of a
      Pareto. */
  ticks?: readonly number[];
  /** The values are instants in milliseconds: ticks on local boundaries,
      labels by level. A calendar implies it. */
  time?: boolean;
  /** Working calendar: the intervals in which time counts. With it,
      materialisation maps wall clock time onto working time before the scale
      calculates - the scale stays affine (ADR-0001). */
  calendar?: readonly WorkingInterval[];
  /** y axes only: this axis' ticks on the first y axis' grid. */
  alignTicks?: boolean;
  /** x axes only: wheel, drag, pinch, double click and the zoom keys move
      the span the chart's view holds for this axis (ADR-0047). */
  zoomable?: boolean;
  /** x axes only: the narrowest and the widest span zoom may reach.
      @default at most the data's extent, at least three data steps */
  zoomLimits?: ZoomLimits;
}

/** Space in CSS pixels on each side of a rectangle. */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A rectangle in CSS pixels, from its top left corner. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Materialised series: the draw loop works only on this.
    Gaps (null/undefined/NaN/±Infinity out of the accessor) are encoded as NaN.
    @remarks R-2.7, R-2.5 */
export interface MaterializedSeries {
  x: Float64Array;
  y: Float64Array;
  /** Lower edge, where the baseline is an accessor of its own; otherwise null.
      A fixed baseline needs no channel - it is a number.
      @remarks R-2.7 */
  y0: Float64Array | null;
  /** Level channel: the third value per point, which today only the matrix
      needs. Named rather than overloading y0 - a property that only some kinds
      carry does not belong in the shared type with a comment (ADR-0011). null
      for every kind that does not use it. */
  w: Float64Array | null;
  /** A box's further numbers beside its median in y; null for every other
      kind (ADR-0011). */
  box: BoxChannels | null;
  length: number;
}

/** A box's further numbers beside its median, by name. */
export interface BoxNumbers<V = number> {
  lowerQuartile: V;
  upperQuartile: V;
  lowerWhisker: V;
  upperWhisker: V;
}

/** The named channels of a box: one number per point, NaN where the median
    is a gap; and its outliers (ADR-0040). */
export interface BoxChannels extends BoxNumbers<Float64Array> {
  /** Every box's outliers, flat, box after box; null without `outliers`. */
  outliers: Float64Array | null;
  /** Where each box's outliers begin, and one past the last: box i's stand
      from outlierOffsets[i] to outlierOffsets[i + 1]. null without
      `outliers`. */
  outlierOffsets: Uint32Array | null;
  /** The optional numbers, each null where not given. */
  mean: Float64Array | null;
  notchLower: Float64Array | null;
  notchUpper: Float64Array | null;
  count: Float64Array | null;
}

/** The optional numbers of a box (box-plot 04), by name. */
export interface BoxExtras<V = number> {
  mean: V;
  notchLower: V;
  notchUpper: V;
  count: V;
}

/* The Scale interface is fixed (R-2.14); V0 implements only LinearScale. */
/** The mapping of an axis' values onto pixels and back, with its ticks. Every
    scale of the library is affine; `LinearScale` implements it. */
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
  /** Axis on which the value lies; without one, the first axis of its
      orientation (charts-fixes 08). */
  axisId?: string;
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

/** A `LimitLine` as the chart holds it once registered. */
export interface LimitLineConfig extends LimitBase {
  kind: "line";
  value: number;
}

/** A `LimitBand` as the chart holds it once registered: the range from `from`
    to `to`. */
export interface LimitBandConfig extends LimitBase {
  kind: "band";
  from: number;
  to: number;
}

/** Any registered limit, a line or a band, told apart by `kind`. */
export type LimitConfig = LimitLineConfig | LimitBandConfig;

/* ---------------- Legend and tooltip ---------------- */

/** A `Legend` as the chart holds it once registered. */
export interface LegendConfig {
  placement: "top" | "bottom";
}

/** One hit per series in the tooltip.
    @remarks R-4.4 */
export interface TooltipPoint<T = unknown> {
  seriesName: string;
  color: string;
  /** The point's x value on its own x axis - with several x axes it can
      differ from the hit's. */
  xValue: number;
  /** The point's y value; in a stack its own value, not its top - in a
      normalised stack its share in percent. */
  yValue: number;
  datum: T;
  index: number;
  /** Only for the matrix: its `level`, out of the level channel. It stands here and
      not in yValue, because yValue is the position on the y axis - for a matrix
      therefore the row. Putting both into one field would be exactly the
      overloading ADR-0011 is written against. */
  value?: number;
  /** Only for state series: the section being pointed at.
      A duration does not stand here - it is the difference of two numbers the
      entry already carries, and formatting it would presuppose knowing what the
      x axis means. The caller knows that, not this library. */
  segment?: { from: number; to: number; label: string };
  /** Only for a box: its further numbers; yValue is its median. Fields of
      their own for the reason `value` has one (ADR-0011). */
  box?: BoxNumbers &
    Partial<BoxExtras> & {
      /** As the caller gave them; only where the series has `outliers`. */
      outliers?: readonly number[];
    };
}

/** What the pointer hit: the x value under it and one point per series there.
    A custom tooltip's `render` receives it. */
export interface TooltipHit<T = unknown> {
  xValue: number;
  points: readonly TooltipPoint<T>[];
  /** Pixel position of the crosshair (snapped to the data point). */
  xPx: number;
  /** Pixel position of the primary hit. */
  yPx: number;
}

/** A `Tooltip` as the chart holds it once registered. */
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

/** Measurements of the instrumentation for the benchmark page.
    @remarks R-5.1 */
export interface ChartPerf {
  materializeMs: number;
  seriesDrawMs: number;
  points: number;
}
