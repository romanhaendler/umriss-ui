/* ChartScene - the heart of the library.

   Responsible for:
   - The registration model (R-2.1): series, axes, legend and tooltip register and
     deregister themselves with a configuration; registration order is drawing
     order, palette assignment and band stacking.
   - Materialisation (R-2.7): accessors run exactly once per change of data or
     accessor, into Float64Arrays; gaps as NaN (R-2.5); a DEV sortedness check
     once per change of data (R-2.6).
   - Canvas setup (R-2.8/2.9), resize (R-2.10), scheduling (R-2.11).
   - Layout (section 3) and drawing (draw.ts).
   - Hit testing, crosshair and tooltip positioning (4.4).

   On change detection: React creates new config objects and new inline accessors
   on every render. If every new object identity counted as a change, everything
   would be re-materialised on every parent render (unacceptable at a million
   points). That is why updateSeries/updateAxis compare field by field; accessors
   count as equal when their source text is equal - a native or bound function,
   whose text is "[native code]", by identity. Known limit, not solved (Q10): an
   accessor that reads a changed closure variable without its source text or its
   data reference changing is not re-materialised - in that case the app must
   pass a new data reference. The same holds for `tickFormat` and the tooltip's
   `render`. */

import { FALLBACK_THEME, resolveColours, resolveTheme, subscribeTheme, type ResolvedTheme } from "./theme";
import { DEV, invariant, warnOnce } from "./dev";
import { TextMeasurer } from "./measure";
import {
  computeLayout,
  CLASS_TICK,
  EMPTY_LAYOUT,
  insideContainer,
  type AxisInput,
  type AxisLayout,
  type LayoutResult,
} from "./layout";
import {
  drawOverlayLayer,
  drawSeriesLayer,
  type DrawBase,
  type LimitDrawItem,
  type SeriesDrawItem,
} from "./draw";
import { lowerBound, nearestIndex, nearestPoint } from "./hit";
import { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";
import { hasCell, nearestPosition, rowEnd, stepCell, stepPosition, type Cell, type Move, type WalkSeries } from "./walk";
import { downsample } from "./downsample";
import { lastSegmentEnd, medianStep, segmentEnd, segmentIndex } from "./state";
import { cellSize, cellIndex, measureSpacing } from "./cells";
import { assess } from "./limit";
import { formatValue } from "./format";
import { MINUTE, inRemovedTime, toOperatingTimeClamped } from "./operatingTime";
import {
  axisExtent,
  firstUnsortedIndex,
  materializeSeries,
  visibleExtent,
  type Baseline,
  type Extent,
} from "./materialize";
import {
  barGroups,
  barPlacement,
  measureStep,
  effectiveStep,
} from "./bars";
import type {
  Accessor,
  AreaSeriesConfig,
  AxisConfig,
  LimitConfig,
  MatrixColoring,
  MatrixSeriesConfig,
  StateSeriesConfig,
  AxisOrientation,
  BarSeriesConfig,
  ChartPerf,
  HoverState,
  LegendConfig,
  LineSeriesConfig,
  MaterializedSeries,
  Padding,
  Rect,
  ScatterSeriesConfig,
  SeriesConfig,
  TooltipConfig,
  TooltipHit,
  TooltipPoint,
} from "./types";

interface SeriesEntry {
  order: number;
  config: SeriesConfig;
  /** The place in the palette, assigned on the first registration of the name.
      Read only for named series; a nameless one has no identity a place could
      hang on. */
  slot: number;
  /** The palette place a nameless series last received - in order to notice that
      it has changed. */
  lastSlot: number | null;
  materialized: MaterializedSeries | null;
  extent: Extent | null;
  /** Bars only: the smallest x distance, computed once per materialisation. It
      does not belong in the materialised series - the other series kinds do not
      need it (ADR-0002). For the matrix the cell width, for a state band the
      median distance its last segment runs past its last point, for the same
      reason in the same place. */
  step: number | null;
  /** Matrix only: the second cell edge. */
  cellHeight: number | null;
  /** Matrix only: the palette index per cell, once per materialisation and
      colouring - not per redraw, which a legend hover causes as well. */
  buckets: Int32Array | null;
}

/** A series' hit, before the hits are grouped into one tooltip. */
interface Candidate {
  entry: SeriesEntry;
  index: number;
  color: string;
  name: string;
  px: number;
  py: number;
  xValue: number;
  yValue: number;
  /** Does this hit get a hover marker? Not on a band or a cell: there the
      mark is the area itself, and a point on it points at nothing. */
  marked: boolean;
  /** Does this mark cover an area instead of sitting on a point? A band and a
      cell lie under the pointer where they cover it - their px is the
      beginning of the section and not the place being pointed at. */
  areal: boolean;
  value?: number;
  segment?: { from: number; to: number; label: string };
}

interface AxisEntry {
  order: number;
  config: AxisConfig;
}

interface LimitEntry {
  order: number;
  config: LimitConfig;
}

export interface LegendItem {
  /** Unique within the legend. A state series yields several entries, so the
      registration number alone is not enough as a key. */
  id: string;
  name: string;
  /** Its series is hidden - for a state, every band that shows it. */
  hidden: boolean;
  /** A CSS background for the chip: a colour, or a matrix' steps side by
      side. */
  color: string;
  /** The series highlighted on hover - several where state bands share a
      state. */
  seriesIds: number[];
}

/** A labelled limit, ready for the axis band. */
export interface LimitLabel {
  id: number;
  axisKey: string;
  px: number;
  /** An x limit's label: its left edge in container coordinates, kept inside
      the container as a tick label is. */
  labelLeft: number;
  label: string;
  severity: string;
  role: string;
}

export interface LayoutSnapshot {
  version: number;
  layout: LayoutResult;
  legend: LegendConfig | null;
  series: readonly LegendItem[];
  limits: readonly LimitLabel[];
  /** No visible series has a point to show. */
  empty: boolean;
}

/** One row of the built-in tooltip, written out once per hit. */
export interface TooltipRow {
  /** The value in the format of the point's y axis; a state's name. */
  value: string;
  /** The point's x value in the format of its own x axis - empty where that
      is the x axis of the header. */
  x: string;
}

export interface HoverSnapshot {
  version: number;
  hover: HoverState | null;
  tooltip: TooltipConfig | null;
  /** The x value in the format of the hit x axis (the built-in tooltip uses
      it). */
  xLabel: string;
  /** Parallel to the hit's points. */
  rows: readonly TooltipRow[];
}

const EMPTY_LAYOUT_SNAPSHOT: LayoutSnapshot = {
  version: 0,
  layout: EMPTY_LAYOUT,
  legend: null,
  series: [],
  limits: [],
  // Unknown before the first frame: saying "No data" there would flash.
  empty: false,
};

const EMPTY_HOVER_SNAPSHOT: HoverSnapshot = {
  version: 0,
  hover: null,
  tooltip: null,
  xLabel: "",
  rows: [],
};

/** Tolerance within which hits of different series are grouped (R-4.7). */
const GROUP_TOLERANCE = 4;

/** Under "nearest", a point this close to the pointer wins over a band or a
    cell under it: the area covers the pointer everywhere, the point is the
    precise answer. */
const SNAP_DISTANCE = 12;

let nextRegistration = 0;

/** Charts that share a `syncId`: the pointer's x position goes to all of
    them (charts-long-series 04). */
const syncGroups = new Map<string, Set<ChartScene>>();

/** A shared x position, in the units of the x axis it was read on. */
interface SyncedX {
  axisId: string;
  value: number;
}

export function fnEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "function" || typeof b !== "function") return false;
  const source = String(a);
  // Every native and every bound function reads "[native code]" - a bound
  // `Intl.NumberFormat#format` among them. Their text says nothing; identity
  // does.
  if (source.includes("[native code]")) return false;
  return source === String(b);
}

/** A calendar by its intervals: an inline array is new on every render, and
    each new one would map every point again. */
function calendarEqual(
  a: AxisConfig["calendar"],
  b: AxisConfig["calendar"],
): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.from !== b[i]?.from || a[i]?.to !== b[i]?.to) return false;
  }
  return true;
}

/** A state band and a matrix colour themselves - by state, by cell - and take
    no place in the palette: otherwise the line after them would come out in a
    later colour than the first. */
function takesPalette(config: SeriesConfig): boolean {
  return config.kind !== "state" && config.kind !== "matrix";
}

/** Does a neighbour of the hit lie less than a minute from it? Then the header
    of a time axis carries the seconds - readings a second apart would
    otherwise share one header. A property of the data where the pointer is,
    not of the tick step, which never goes below a minute. */
function subMinute(hit: Candidate): boolean {
  const mat = hit.entry.materialized;
  if (mat === null) return false;
  const at = mat.x[hit.index] as number;
  const near = (d: number) => d > 0 && d < MINUTE;
  return (
    (hit.index > 0 && near(at - (mat.x[hit.index - 1] as number))) ||
    (hit.index + 1 < mat.length && near((mat.x[hit.index + 1] as number) - at))
  );
}

function listEqual(a: readonly number[] | undefined, b: readonly number[] | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Everything materialisation reads: the y accessor, the data reference, the
    baseline and the series kind - the kind, because it decides about the
    baseline and the step. If any of that changes, the channels are stale and have to come
    into being anew; a field comparison alone is not enough here. */
function materialEqual(previous: SeriesConfig, next: SeriesConfig): boolean {
  return (
    previous.kind === next.kind &&
    fnEqual(previous.accessor, next.accessor) &&
    previous.data === next.data &&
    fnEqual(baselineOf(previous), baselineOf(next)) &&
    fnEqual(valueChannelOf(previous), valueChannelOf(next))
  );
}

/** The value channel, where the kind has one (ADR-0011). */
function valueChannelOf(config: SeriesConfig): Accessor<unknown> | undefined {
  return config.kind === "matrix" ? config.value : undefined;
}

/** Baseline per series kind; undefined where the kind has none. It enters the
    extent of the y axis (CONTEXT.md: Baseline). */
function baselineOf(config: SeriesConfig): Baseline<unknown> | undefined {
  switch (config.kind) {
    case "line":
    case "scatter":
      return undefined;
    case "area":
      return config.baseline ?? 0;
    case "bar":
      return 0;
    case "state":
    case "matrix":
      // Neither has a foot: a state is not a height, a cell not a column.
      return undefined;
  }
}

/** Field comparison of the kind-own properties; the base is compared by
    updateSeries. A new series kind gets an arm here - the compiler demands it. */
function ownFieldsEqual(previous: SeriesConfig, next: SeriesConfig): boolean {
  if (previous.kind !== next.kind) return false;
  switch (next.kind) {
    case "line": {
      const a = previous as LineSeriesConfig;
      return (
        a.strokeWidth === next.strokeWidth &&
        a.markers === next.markers &&
        a.step === next.step &&
        listEqual(a.dash as number[] | undefined, next.dash as number[] | undefined)
      );
    }
    case "area": {
      const a = previous as AreaSeriesConfig;
      return (
        fnEqual(a.baseline, next.baseline) &&
        a.fillOpacity === next.fillOpacity &&
        a.strokeWidth === next.strokeWidth &&
        listEqual(a.dash as number[] | undefined, next.dash as number[] | undefined)
      );
    }
    case "bar": {
      const a = previous as BarSeriesConfig;
      return a.barWidth === next.barWidth;
    }
    case "scatter": {
      const a = previous as ScatterSeriesConfig;
      return a.radius === next.radius;
    }
    case "state": {
      const a = previous as StateSeriesConfig;
      return (
        a.laneFrom === next.laneFrom &&
        a.laneTo === next.laneTo &&
        statesEqual(a.states, next.states)
      );
    }
    case "matrix": {
      const a = previous as MatrixSeriesConfig;
      return coloringEqual(a.coloring, next.coloring);
    }
  }
}

function statesEqual(
  a: readonly { label: string; color: string }[],
  b: readonly { label: string; color: string }[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.label !== b[i]?.label || a[i]?.color !== b[i]?.color) return false;
  }
  return true;
}

function coloringEqual(a: MatrixColoring, b: MatrixColoring): boolean {
  if (a === b) return true;
  if (a.kind !== b.kind) return false;
  if (a.kind === "assessment" && b.kind === "assessment") return a.limits === b.limits;
  if (a.kind === "gradient" && b.kind === "gradient") {
    return (
      listEqual(a.stops as unknown as number[], b.stops as unknown as number[]) &&
      listEqual(a.range as number[] | undefined, b.range as number[] | undefined)
    );
  }
  return false;
}

/* ---------------- Colouring of the matrix ----------------

   The library interpolates no colours. A gradient is exactly the list of its
   stops: as many steps as the caller names colours. Interpolating between two CSS
   colours would mean bringing along a colour parser - for arbitrary CSS colour
   values, in a package that has none and is to get none. */

/** Palette of a colouring. For the assessment three colours: "unknown" is
    none - a missing value becomes a hole, as everywhere else in this library, and
    a hole carries no colour. */
function matrixColors(coloring: MatrixColoring, theme: ResolvedTheme): readonly string[] {
  if (coloring.kind === "assessment") {
    return [theme.colorOk, theme.colorWarning, theme.colorAlarm];
  }
  return coloring.stops;
}

/** A legend chip for a colouring: its colours side by side, as hard stops. The
    matrix draws steps, and its chip shows the same steps - a palette colour
    there would explain a colour the matrix never draws. */
function chipOf(colors: readonly string[]): string {
  const share = 100 / Math.max(1, colors.length);
  const stops = colors.map((c, k) => `${c} ${k * share}% ${(k + 1) * share}%`);
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

/** The value range a gradient spreads over: its own, or that of the data. */
function gradientRange(
  w: Float64Array,
  n: number,
  range: readonly [number, number] | undefined,
): readonly [number, number] {
  let min = range?.[0];
  let max = range?.[1];
  if (min === undefined || max === undefined) {
    min = Number.POSITIVE_INFINITY;
    max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      const v = w[i] as number;
      if (!Number.isFinite(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return [min, max];
}

/** Bucket of one value: the index into the palette, -1 for a hole. `min` and
    `max` are the gradient's range and mean nothing to an assessment. */
function bucketOf(
  v: number,
  coloring: MatrixColoring,
  count: number,
  min: number,
  max: number,
): number {
  if (coloring.kind === "assessment") {
    const b = assess(v, coloring.limits);
    // Four outcomes, four answers. Folding "unknown" onto the same bucket as
    // "ok" would be exactly the defect the limit model is written against: a
    // value nobody has would look like a good one.
    return b.verdict === "alarm"
      ? 2
      : b.verdict === "warning"
        ? 1
        : b.verdict === "ok"
          ? 0
          : -1; // unknown: a hole, and a hole carries no colour
  }
  if (!Number.isFinite(v)) return -1;
  const span = max - min;
  // Degenerate span: everything into the middle, instead of dividing by zero.
  const share = span > 0 ? (v - min) / span : 0.5;
  const k = Math.floor(share * count);
  return k < 0 ? 0 : k >= count ? count - 1 : k;
}

/** Bucket per cell: the index into the palette, -1 for a hole. Once per frame, so
    that the drawing loop calls no function per cell. */
function matrixBuckets(
  mat: MaterializedSeries,
  coloring: MatrixColoring,
  count: number,
): Int32Array {
  const n = mat.length;
  const buckets = new Int32Array(n);
  const w = mat.w;
  if (w === null || count === 0) {
    buckets.fill(-1);
    return buckets;
  }
  const [min, max] =
    coloring.kind === "gradient" ? gradientRange(w, n, coloring.range) : [0, 0];
  for (let i = 0; i < n; i++) buckets[i] = bucketOf(w[i] as number, coloring, count, min, max);
  return buckets;
}

function domainEqual(
  a: AxisConfig["domain"],
  b: AxisConfig["domain"],
): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
  return false;
}

/** The readout waits for the keys to rest this long (charts-a11y R11). */
const READOUT_REST = 150;
/** The summary waits for layouts - a zoom - to rest this long. */
const SUMMARY_REST = 100;

/** The keys that walk a course, a band, bars or points (charts-a11y Q2). */
const MOVES: Readonly<Record<string, Move>> = {
  ArrowRight: "next",
  ArrowLeft: "previous",
  Home: "first",
  End: "last",
  PageDown: "pageNext",
  PageUp: "pagePrevious",
};

/** The keys that walk a matrix (R7). */
const CELL_STEPS: Readonly<Record<string, "left" | "right" | "up" | "down">> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

/** One zoom key widens the domain by this much; its opposite narrows it back. */
const KEY_ZOOM = 1.25;

export class ChartScene {
  /* ---------- Registration ---------- */
  private series = new Map<number, SeriesEntry>();
  private axes = new Map<number, AxisEntry>();
  private legend: LegendConfig | null = null;
  private tooltip: TooltipConfig | null = null;
  private limits = new Map<number, LimitEntry>();

  /* ---------- Data and layout inputs ---------- */
  private data: readonly unknown[] = [];
  private padding: Padding = { top: 8, right: 8, bottom: 8, left: 8 };

  /* ---------- DOM binding ---------- */
  private container: HTMLElement | null = null;
  private seriesCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private seriesCtx: CanvasRenderingContext2D | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;
  private tooltipEl: HTMLElement | null = null;
  /** The readout (polite live region) and the summary the plot is described
      by (charts-a11y 03). */
  private readoutEl: HTMLElement | null = null;
  private summaryEl: HTMLElement | null = null;
  private readoutTimer: ReturnType<typeof setTimeout> | null = null;
  private summaryTimer: ReturnType<typeof setTimeout> | null = null;
  private wording: ChartsWording = DEFAULT_CHARTS_WORDING;
  private measurer: TextMeasurer | null = null;

  /* ---------- Size and DPR ---------- */
  private cssWidth = 0;
  private cssHeight = 0;
  private pendingWidth: number | null = null;
  private pendingHeight: number | null = null;
  private dpr = 1;
  private dprMedia: MediaQueryList | null = null;
  private readonly onDprChange = (): void => {
    this.rebindDprWatch();
    this.pendingWidth = this.cssWidth;
    this.pendingHeight = this.cssHeight;
    this.markLayoutDirty();
  };

  /* ---------- Scheduling ---------- */
  private seriesDirty = false;
  private overlayDirty = false;
  private layoutDirty = true;
  private materialsDirty = false;
  private frameHandle: number | null = null;

  /* ---------- Theme ---------- */
  private theme: ResolvedTheme | null = null;
  private unsubscribeTheme: (() => void) | null = null;
  /** A caller's colours - `color`, a state's, a gradient stop - resolved
      through the theme's probe, once per colour and theme: a canvas ignores a
      `var(--…)` or a `light-dark(…)` and keeps the previous fillStyle. */
  private readonly painted = new Map<string, string>();

  /* ---------- Layout and interaction ---------- */
  private layout: LayoutResult = EMPTY_LAYOUT;
  private readonly hysteresis = new Map<string, number>();
  private hover: HoverState | null = null;
  private hoverKey = "";
  private hoverXLabel = "";
  private hoverRows: readonly TooltipRow[] = [];
  /** The orders of the series in the current hit, beside its rows. */
  private hoverOrders: readonly number[] = [];
  private highlight: readonly number[] | null = null;
  /** Who set the Active point (ADR-0030): the pointer and the keyboard move
      the same one, the last input winning. */
  private activeBy: "pointer" | "keyboard" | null = null;
  /** Where the keyboard stands, in x of the emphasised series' axis; a
      matrix' cell. */
  private keyX: number | null = null;
  private keyCell: Cell | null = null;
  /** The series ↑/↓ chose (its order), read first; null: the first walked. */
  private emphasis: number | null = null;
  /** The highlight is the keyboard's, and goes with its Active point. */
  private keyHighlight = false;

  /* ---------- Snapshots for the HTML layer ---------- */
  private layoutSnapshot: LayoutSnapshot = EMPTY_LAYOUT_SNAPSHOT;
  private hoverSnapshot: HoverSnapshot = EMPTY_HOVER_SNAPSHOT;
  private readonly layoutSubscribers = new Set<() => void>();
  private readonly hoverSubscribers = new Set<() => void>();

  /* ---------- Instrumentation (R-5.1) ---------- */
  private perf: ChartPerf = { materializeMs: 0, seriesDrawMs: 0, points: 0 };
  /* The palette follows the name (library-audit 05). The table only grows: a name
     that goes away keeps its place, so that it finds it again on its return and
     no other name gets it in the meantime. */
  private readonly slotsByName = new Map<string, number>();
  private nextSlot = 0;

  private onPerf: ((perf: ChartPerf) => void) | null = null;

  setOnPerf(callback: ((perf: ChartPerf) => void) | null): void {
    this.onPerf = callback;
  }

  /* ================= Registration model (R-2.1, R-2.2) ================= */

  /** The palette place for a new registration. On the first mount, in JSX order,
      it is the same number as the index in the registration - every registration
      counts on, named or not. */
  private slotFor(name: string | undefined): number {
    if (name === undefined) return this.nextSlot++;
    const known = this.slotsByName.get(name);
    if (known !== undefined && !this.slotTaken(known)) return known;
    const next = this.nextSlot++;
    if (known === undefined) this.slotsByName.set(name, next);
    return next;
  }

  /** Is a named series currently standing on this palette place? A taken place is
      not assigned a second time: two series of the same name standing at once
      share no colour, and a name that a rename has left behind does not get the
      colour of the renamed series. */
  private slotTaken(slot: number, except?: SeriesEntry): boolean {
    for (const e of this.series.values()) {
      if (e !== except && e.config.name !== undefined && e.slot === slot) return true;
    }
    return false;
  }

  registerSeries(config: SeriesConfig): number {
    const id = nextRegistration++;
    this.series.set(id, {
      order: id,
      config,
      slot: takesPalette(config) ? this.slotFor(config.name) : -1,
      lastSlot: null,
      materialized: null,
      extent: null,
      step: null,
      cellHeight: null,
      buckets: null,
    });
    this.materialsDirty = true;
    this.markLayoutDirty();
    return id;
  }

  updateSeries(id: number, config: SeriesConfig): void {
    const entry = this.series.get(id);
    if (entry === undefined) return;
    const previous = entry.config;
    const dataEqual = materialEqual(previous, config);
    const equal =
      dataEqual &&
      previous.xAxisId === config.xAxisId &&
      previous.yAxisId === config.yAxisId &&
      previous.name === config.name &&
      fnEqual(previous.format, config.format) &&
      previous.color === config.color &&
      previous.tone === config.tone &&
      previous.hidden === config.hidden &&
      ownFieldsEqual(previous, config);
    if (entry.slot < 0 && takesPalette(config)) {
      entry.slot = this.slotFor(config.name);
    } else if (previous.name !== config.name && config.name !== undefined && entry.slot >= 0) {
      // A rename takes its colour with it - unless the new name already has a
      // free place; then the name wins.
      const known = this.slotsByName.get(config.name);
      if (known === undefined) this.slotsByName.set(config.name, entry.slot);
      else if (!this.slotTaken(known, entry)) entry.slot = known;
    }
    entry.config = config;
    if (equal) return; // R-2.2: no dirty flag without a change of substance
    entry.buckets = null; // the colouring may have changed
    if (!dataEqual) {
      entry.materialized = null;
      entry.extent = null;
      entry.step = null;
      entry.cellHeight = null;
      entry.buckets = null;
      this.materialsDirty = true;
    }
    this.markLayoutDirty();
  }

  unregisterSeries(id: number): void {
    if (this.series.delete(id)) {
      this.materialsDirty = true;
      this.markLayoutDirty();
    }
  }

  registerAxis(config: AxisConfig): number {
    const id = nextRegistration++;
    this.axes.set(id, { order: id, config });
    this.materialsDirty = true; // x materialisation depends on axis accessors
    this.markLayoutDirty();
    return id;
  }

  updateAxis(id: number, config: AxisConfig): void {
    const entry = this.axes.get(id);
    if (entry === undefined) return;
    const previous = entry.config;
    const accessorEqual =
      fnEqual(previous.accessor, config.accessor) && calendarEqual(previous.calendar, config.calendar);
    const equal =
      accessorEqual &&
      previous.id === config.id &&
      previous.orientation === config.orientation &&
      previous.position === config.position &&
      previous.label === config.label &&
      previous.tickCount === config.tickCount &&
      previous.grid === config.grid &&
      previous.time === config.time &&
      previous.alignTicks === config.alignTicks &&
      listEqual(previous.ticks as number[] | undefined, config.ticks as number[] | undefined) &&
      domainEqual(previous.domain, config.domain) &&
      (previous.onDomainChange === undefined) === (config.onDomainChange === undefined) &&
      fnEqual(previous.tickFormat, config.tickFormat);
    entry.config = config;
    if (equal) return;
    if (!accessorEqual || previous.id !== config.id) {
      for (const entries of this.series.values()) {
        entries.materialized = null;
        entries.extent = null;
        entries.step = null;
        entries.cellHeight = null;
        entries.buckets = null;
      }
      this.materialsDirty = true;
    }
    this.markLayoutDirty();
  }

  unregisterAxis(id: number): void {
    if (this.axes.delete(id)) {
      this.materialsDirty = true;
      this.markLayoutDirty();
    }
  }

  /* Limits register themselves like series - that is the only way a child says
     anything in this library. They are therefore not series: no accessor, no
     data, no legend entry, no hit. */

  registerLimit(config: LimitConfig): number {
    const id = nextRegistration++;
    this.limits.set(id, { order: id, config });
    this.markLayoutDirty();
    return id;
  }

  updateLimit(id: number, config: LimitConfig): void {
    const entry = this.limits.get(id);
    if (entry === undefined) return;
    const previous = entry.config;
    entry.config = config;
    const equal =
      previous.kind === config.kind &&
      previous.axisId === config.axisId &&
      previous.orientation === config.orientation &&
      previous.severity === config.severity &&
      previous.role === config.role &&
      previous.label === config.label &&
      previous.color === config.color &&
      previous.inExtent === config.inExtent &&
      (previous.kind === "line" && config.kind === "line"
        ? previous.value === config.value
        : previous.kind === "band" && config.kind === "band"
          ? previous.from === config.from && previous.to === config.to
          : false);
    if (equal) return;
    this.markLayoutDirty();
  }

  unregisterLimit(id: number): void {
    if (this.limits.delete(id)) this.markLayoutDirty();
  }

  limitsInOrder(): readonly LimitEntry[] {
    return [...this.limits.values()].sort((a, b) => a.order - b.order);
  }

  registerLegend(config: LegendConfig): void {
    this.legend = config;
    this.markLayoutDirty();
  }

  updateLegend(config: LegendConfig): void {
    if (this.legend !== null && this.legend.placement === config.placement) return;
    this.legend = config;
    this.markLayoutDirty();
  }

  unregisterLegend(): void {
    this.legend = null;
    this.markLayoutDirty();
  }

  registerTooltip(config: TooltipConfig): void {
    this.tooltip = config;
    this.pushHoverSnapshot();
  }

  updateTooltip(config: TooltipConfig): void {
    const previous = this.tooltip;
    if (previous !== null && previous.mode === config.mode && fnEqual(previous.render, config.render)) {
      this.tooltip = config;
      return;
    }
    this.tooltip = config;
    this.pushHoverSnapshot();
  }

  unregisterTooltip(): void {
    this.tooltip = null;
    this.hover = null;
    this.hoverKey = "";
    this.markOverlayDirty();
    this.pushHoverSnapshot();
  }

  /** Series in registration order - the drawing order. The palette follows it
      only on the first mount; after that it follows the name. */
  seriesInOrder(): readonly SeriesEntry[] {
    return [...this.series.values()].sort((a, b) => a.order - b.order);
  }

  axesInOrder(): readonly AxisEntry[] {
    return [...this.axes.values()].sort((a, b) => a.order - b.order);
  }

  /* ================= Data and container configuration ================= */

  setData(data: readonly unknown[]): void {
    if (data === this.data) return;
    this.data = data;
    this.materialsDirty = true;
    for (const entry of this.series.values()) {
      entry.materialized = null;
      entry.extent = null;
      entry.step = null;
      entry.cellHeight = null;
      entry.buckets = null;
    }
    this.markLayoutDirty();
  }

  setPadding(padding: Padding): void {
    const p = this.padding;
    if (
      p.top === padding.top &&
      p.right === padding.right &&
      p.bottom === padding.bottom &&
      p.left === padding.left
    ) {
      return;
    }
    this.padding = padding;
    this.markLayoutDirty();
  }

  /* ================= Checks (R-4.12, R-4.13) ================= */

  /** Called from the Chart after the child effects; DEV only. */
  validate(): void {
    if (!DEV) return;
    const seen = new Set<string>();
    for (const { config } of this.axesInOrder()) {
      const key = `${config.orientation}:${config.id}`;
      const name = config.orientation === "x" ? "XAxis" : "YAxis";
      invariant(
        !seen.has(key),
        `Two <${name}> with the same id "${config.id}". A second ${name} needs an own id (R-4.12).`,
      );
      seen.add(key);
    }
    const bound = new Set<string>();
    for (const { config } of this.series.values()) {
      invariant(
        seen.has(`x:${config.xAxisId}`),
        `Series "${config.name ?? "?"}" refers to the unknown x axis "${config.xAxisId}" (R-4.12).`,
      );
      invariant(
        seen.has(`y:${config.yAxisId}`),
        `Series "${config.name ?? "?"}" refers to the unknown y axis "${config.yAxisId}" (R-4.12).`,
      );
      bound.add(`x:${config.xAxisId}`);
      bound.add(`y:${config.yAxisId}`);
    }
    for (const { config } of this.limits.values()) {
      invariant(
        seen.has(`${config.orientation}:${this.limitAxisId(config)}`),
        `A limit refers to the unknown ${config.orientation} axis "${this.limitAxisId(config)}" (R-4.12).`,
      );
    }
    for (const key of seen) {
      if (!bound.has(key) && this.series.size > 0) {
        warnOnce(
          `axis-without-series-${key}`,
          `Axis "${key}" has no bound series; it is drawn with the domain [0, 1] (R-4.13).`,
        );
      }
    }
    // A bar group calculates with one width fraction - that of the first member.
    // Tacitly, that would be an unwritten rule.
    const fractions = new Map<string, number>();
    for (const { config } of this.seriesInOrder()) {
      if (config.kind !== "bar") continue;
      const first = fractions.get(config.xAxisId);
      if (first === undefined) {
        fractions.set(config.xAxisId, config.barWidth);
      } else if (first !== config.barWidth) {
        warnOnce(
          `bar-width-${config.xAxisId}`,
          `Bars on the x axis "${config.xAxisId}" give different barWidth. ` +
            `A group shares one width fraction; that of the first (${first}) applies (ADR-0002).`,
        );
      }
    }
    let gridAxes = 0;
    for (const axis of this.axesInOrder()) if (axis.config.grid === true) gridAxes++;
    if (gridAxes > 1) {
      warnOnce(
        "multiple-grids",
        "More than one axis draws grid. Unaligned grids compete visually; " +
          "`alignTicks` puts a further y axis' ticks on the first one's grid instead (R-4.15).",
      );
    }
  }

  /* ================= Materialisation (R-2.6, R-2.7) ================= */

  /** A limit's axis: the one it names, or the first of its orientation. */
  private limitAxisId(config: LimitConfig): string {
    if (config.axisId !== undefined) return config.axisId;
    for (const { config: axis } of this.axes.values()) {
      if (axis.orientation === config.orientation) return axis.id;
    }
    return config.orientation;
  }

  private findAxisConfig(orientation: AxisOrientation, id: string): AxisConfig | null {
    for (const { config } of this.axes.values()) {
      if (config.orientation === orientation && config.id === id) return config;
    }
    return null;
  }

  private materialize(): void {
    const start = typeof performance === "undefined" ? 0 : performance.now();
    let points = 0;
    for (const entry of this.series.values()) {
      if (entry.materialized !== null) {
        points += entry.materialized.length;
        continue;
      }
      const config = entry.config;
      const data = config.data ?? this.data;
      const xAxis = this.findAxisConfig("x", config.xAxisId);
      if (xAxis === null) continue; // validate() reports this in DEV
      const material = materializeSeries(
        data,
        xAxis.accessor,
        config.accessor,
        baselineOf(config),
        {
          value: valueChannelOf(config),
          xMap: this.mapFor(xAxis),
          xGap: this.gapFor(xAxis),
        },
      );
      entry.materialized = material.series;
      points += material.series.length;
      if (config.kind === "bar") {
        const step = measureStep(material.series.x, material.series.length);
        entry.step = step;
        // A bar is centred on its x value, so half the step belongs to the left
        // and to the right of the extent - otherwise the axis cuts into the first
        // and the last bar (ADR-0002).
        const half = step / 2;
        entry.extent = {
          ...material.extent,
          xMin: material.extent.xMin - half,
          xMax: material.extent.xMax + half,
        };
      } else if (config.kind === "matrix") {
        // As with the bar, only in both directions: a cell is centred on its pair
        // of values, so half its edge belongs outwards - otherwise the axis cuts
        // into the border cells (ADR-0002).
        //
        // What is stored is the MEASURED spacing, even when it is zero. The
        // replacement only comes at drawing time out of the axis domain: with a
        // single row the series span is zero as well, and out of zero and zero no
        // visible cell arises.
        const dx = measureSpacing(material.series.x, material.series.length);
        const dy = measureSpacing(material.series.y, material.series.length);
        entry.step = dx;
        entry.cellHeight = dy;
        entry.extent = {
          xMin: material.extent.xMin - dx / 2,
          xMax: material.extent.xMax + dx / 2,
          yMin: material.extent.yMin - dy / 2,
          yMax: material.extent.yMax + dy / 2,
        };
      } else if (config.kind === "state") {
        // A lane says where something is drawn, not what the data span. A state
        // band therefore contributes no y extent: otherwise the state code 3
        // would pull the axis onto three machines.
        // Its x extent reaches one step past its last point: there its last
        // state ends where the band reports last (lastSegmentEnd), and a
        // `domain="data"` would cut it to nothing.
        const step = medianStep(material.series.x, material.series.length);
        entry.step = step;
        entry.extent = {
          ...material.extent,
          xMax: material.extent.xMax + step,
          yMin: Number.POSITIVE_INFINITY,
          yMax: Number.NEGATIVE_INFINITY,
        };
      } else {
        entry.step = null;
        entry.extent = material.extent;
      }

      // Once per materialisation, which is once per change of data - for every
      // series whose hit is a binary search. A matrix runs row-major and hits
      // linearly: its x values are unsorted by right.
      if (DEV && config.kind !== "matrix") {
        const index = firstUnsortedIndex(material.series.x, material.series.length);
        if (index >= 0) {
          const name = config.name ?? "?";
          warnOnce(
            `x-unsorted-${name}`,
            `Series "${name}": x values are not sorted ascending (index ${index}). ` +
              "Binary search and path building assume sortedness; there is no automatic sorting (R-2.6).",
          );
        }
      }
    }
    this.materialsDirty = false;
    this.perf.materializeMs =
      (typeof performance === "undefined" ? 0 : performance.now()) - start;
    this.perf.points = points;
  }

  /* ================= DOM binding, DPR, resize ================= */

  bind(
    container: HTMLElement,
    seriesCanvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    themeRoot: HTMLElement,
  ): void {
    this.container = container;
    this.themeRoot = themeRoot;
    this.seriesCanvas = seriesCanvas;
    this.overlayCanvas = overlayCanvas;
    this.seriesCtx = seriesCanvas.getContext("2d");
    this.overlayCtx = overlayCanvas.getContext("2d");
    this.measurer = new TextMeasurer(themeRoot);
    this.dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
    this.rebindDprWatch();
    this.unsubscribeTheme = subscribeTheme(() => {
      this.theme = null;
      this.painted.clear();
      this.measurer?.clear();
      this.hysteresis.clear();
      this.markLayoutDirty();
    });
    // A web font that arrives after the first layout makes every measured label
    // wider than its band: measure anew once it is there. The hysteresis goes
    // with the cache - it remembers band widths measured in the fallback font,
    // and would keep a band up to HYSTERESIS - 1 pixels too wide, depending on
    // whether the first layout ran before or after the font arrived.
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    fonts?.addEventListener?.("loadingdone", this.onFontsLoaded);
    this.theme = null;
    this.painted.clear();
    this.markLayoutDirty();
  }

  private readonly onFontsLoaded = (): void => {
    this.measurer?.clear();
    this.hysteresis.clear();
    this.markLayoutDirty();
  };

  bindTooltip(el: HTMLElement | null): void {
    this.tooltipEl = el;
  }

  bindA11y(readout: HTMLElement | null, summary: HTMLElement | null): void {
    this.readoutEl = readout;
    this.summaryEl = summary;
    this.scheduleSummary();
  }

  setWording(wording: ChartsWording): void {
    if (wording === this.wording) return;
    this.wording = wording;
    this.scheduleSummary();
  }

  private themeRoot: HTMLElement | null = null;

  unbind(): void {
    if (this.frameHandle !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
    this.dprMedia?.removeEventListener("change", this.onDprChange);
    this.dprMedia = null;
    this.unsubscribeTheme?.();
    this.unsubscribeTheme = null;
    if (typeof document !== "undefined") {
      document.fonts?.removeEventListener?.("loadingdone", this.onFontsLoaded);
    }
    this.measurer?.remove();
    this.measurer = null;
    this.container = null;
    this.themeRoot = null;
    this.seriesCanvas = null;
    this.overlayCanvas = null;
    this.seriesCtx = null;
    this.overlayCtx = null;
    this.tooltipEl = null;
    this.readoutEl = null;
    this.summaryEl = null;
    if (this.readoutTimer !== null) clearTimeout(this.readoutTimer);
    if (this.summaryTimer !== null) clearTimeout(this.summaryTimer);
    this.readoutTimer = null;
    this.summaryTimer = null;
  }

  /** Detect a change of DPR (a change of monitor): rebind matchMedia (R-2.9). */
  private rebindDprWatch(): void {
    if (typeof matchMedia !== "function") return;
    this.dprMedia?.removeEventListener("change", this.onDprChange);
    this.dpr = typeof devicePixelRatio === "number" ? devicePixelRatio : 1;
    this.dprMedia = matchMedia(`(resolution: ${this.dpr}dppx)`);
    this.dprMedia.addEventListener("change", this.onDprChange);
  }

  /** Called by the ResizeObserver; coalesced onto one rAF (R-2.10). */
  requestResize(cssWidth: number, cssHeight: number): void {
    // Against the size still to come, not the one applied: a resize there and
    // back within one frame would otherwise leave the "there" pending.
    if (cssWidth === (this.pendingWidth ?? this.cssWidth) && cssHeight === (this.pendingHeight ?? this.cssHeight)) return;
    this.pendingWidth = cssWidth;
    this.pendingHeight = cssHeight;
    this.markLayoutDirty();
  }

  private applyPendingSize(): void {
    if (this.pendingWidth === null || this.pendingHeight === null) return;
    this.cssWidth = this.pendingWidth;
    this.cssHeight = this.pendingHeight;
    this.pendingWidth = null;
    this.pendingHeight = null;
    const { seriesCanvas, overlayCanvas, seriesCtx, overlayCtx, dpr } = this;
    if (!seriesCanvas || !overlayCanvas || !seriesCtx || !overlayCtx) return;
    const w = Math.max(0, Math.round(this.cssWidth * dpr));
    const h = Math.max(0, Math.round(this.cssHeight * dpr));
    for (const canvas of [seriesCanvas, overlayCanvas]) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${this.cssWidth}px`;
      canvas.style.height = `${this.cssHeight}px`;
    }
    // Every drawing coordinate in CSS pixels (R-2.9):
    seriesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ================= Scheduling (R-2.11) ================= */

  markSeriesDirty(): void {
    this.seriesDirty = true;
    this.requestFrame();
  }

  markOverlayDirty(): void {
    this.overlayDirty = true;
    this.requestFrame();
  }

  /** A layout-relevant change: it pulls the series and the overlay layer with
      it. */
  markLayoutDirty(): void {
    this.layoutDirty = true;
    this.seriesDirty = true;
    this.overlayDirty = true;
    this.requestFrame();
  }

  private requestFrame(): void {
    if (this.frameHandle !== null) return; // exactly one rAF
    if (this.container === null) return; // unbound: the flags stay set
    if (typeof requestAnimationFrame !== "function") return;
    this.frameHandle = requestAnimationFrame(() => {
      this.frameHandle = null;
      this.frame();
    });
  }

  private frame(): void {
    this.applyPendingSize();
    if (this.theme === null && this.themeRoot !== null) {
      this.theme = resolveTheme(this.themeRoot);
    }
    if (this.cssWidth <= 0 || this.cssHeight <= 0) {
      // R-2.10: at size 0, neither draw nor throw. The HTML layer gets its state
      // all the same (the legend does not depend on the plot area); layoutDirty
      // stays set, and the next resize calculates the layout.
      if (this.layoutDirty) this.pushLayoutSnapshot();
      return;
    }
    if (this.materialsDirty) this.materialize();
    if (this.layoutDirty) {
      this.updateLayout();
      this.layoutDirty = false;
      this.pushLayoutSnapshot();
      // New data or a new layout under a resting pointer: the hit it had names
      // old values at old pixels. Ask again at the same place.
      if (this.activeBy === "keyboard") {
        this.hoverKey = "";
        this.reapplyKey();
      } else if (this.hover !== null) {
        const { mouseX, mouseY } = this.hover;
        this.hoverKey = "";
        this.pointerMove(mouseX, mouseY);
      }
    }
    if (this.seriesDirty) {
      this.drawSeriesLayer();
      this.seriesDirty = false;
    }
    if (this.overlayDirty) {
      this.drawOverlayLayer();
      this.overlayDirty = false;
    }
  }

  /* ================= Layout ================= */

  /** The effective grid default: only the first registered axis per orientation
      (R-4.15). */
  private gridDefault(): Map<number, boolean> {
    const out = new Map<number, boolean>();
    let firstX = true;
    let firstY = true;
    for (const [id, entry] of [...this.axes.entries()].sort((a, b) => a[1].order - b[1].order)) {
      const first = entry.config.orientation === "x" ? firstX : firstY;
      out.set(id, entry.config.grid ?? first);
      if (entry.config.orientation === "x") firstX = false;
      else firstY = false;
    }
    return out;
  }

  /** Extent of an axis out of the series bound to it (R-4.13).

      Materialises on demand and manages without the DOM - that is the seam at
      which extents across series kinds can be tested without asking a canvas.
      The layout path calls extentFor directly. */
  axisExtent(
    orientation: AxisOrientation,
    id: string,
  ): readonly [number, number] {
    if (this.materialsDirty) this.materialize();
    const visible = orientation === "y" && this.findAxisConfig("y", id)?.domain === "visible";
    const bindings = [...this.series.values()].map((entry) => ({
      xAxisId: entry.config.xAxisId,
      yAxisId: entry.config.yAxisId,
      // A hidden series has no say: the axis fits what is shown.
      extent: entry.config.hidden === true ? null : visible ? this.visibleExtentOf(entry) : entry.extent,
    }));
    return axisExtent(orientation, id, bindings, this.limitValues(orientation, id));
  }

  /** The extent of what a fixed x domain shows. A domain that is not fixed
      shows every point - "nice" and "data" both contain the data -, and a band
      and a cell keep theirs: a lane is no value, a cell's edge no point. */
  private visibleExtentOf(entry: SeriesEntry): Extent | null {
    const domain = this.findAxisConfig("x", entry.config.xAxisId)?.domain;
    const kind = entry.config.kind;
    if (!Array.isArray(domain) || entry.materialized === null || kind === "state" || kind === "matrix") {
      return entry.extent;
    }
    const [from, to] = domain as readonly [number, number];
    let [yMin, yMax] = visibleExtent(entry.materialized, from, to);
    // A fixed foot stands under every point shown, as it does in the extent.
    const baseline = baselineOf(entry.config);
    if (typeof baseline === "number" && yMin <= yMax) {
      yMin = Math.min(yMin, baseline);
      yMax = Math.max(yMax, baseline);
    }
    return { xMin: from, xMax: to, yMin, yMax };
  }

  /** The values of the limits that are to pull this axis along. */
  private limitValues(orientation: AxisOrientation, id: string): number[] {
    const out: number[] = [];
    for (const { config } of this.limits.values()) {
      if (!config.inExtent) continue;
      if (config.orientation !== orientation || this.limitAxisId(config) !== id) continue;
      if (config.kind === "line") out.push(this.limitAt(config, config.value));
      else out.push(this.limitAt(config, config.from), this.limitAt(config, config.to));
    }
    return out;
  }

  /** A limit's value in the units of its axis. An x limit on an operating-time
      axis is named on the wall clock, like the data, and mapped as they are. */
  private limitAt(config: LimitConfig, value: number): number {
    if (config.orientation !== "x") return value;
    const axis = this.findAxisConfig("x", this.limitAxisId(config));
    const map = axis === null ? undefined : this.mapFor(axis);
    return map === undefined ? value : map(value);
  }

  /** Pre-mapping of the x values of an axis with an operating calendar. The scale
      stays affine; the mapping happens beforehand, once per point, in
      materialisation - exactly the route ADR-0001 prescribes for a non-affine
      axis. */
  private mapFor(axis: AxisConfig): ((v: number) => number) | undefined {
    const calendar = axis.calendar;
    if (calendar === undefined || calendar.length === 0) return undefined;
    // Clamped, not NaN: the channel has to stay ascending, otherwise every binary
    // search over it runs into nothing. The operating time module builds a
    // calendar out of the list once and keeps it; there is therefore no second
    // cache here.
    return (v: number) => toOperatingTimeClamped(v, calendar);
  }

  private gapFor(axis: AxisConfig): ((v: number) => boolean) | undefined {
    const calendar = axis.calendar;
    if (calendar === undefined || calendar.length === 0) return undefined;
    return (v: number) => inRemovedTime(v, calendar);
  }

  private extentFor(config: AxisConfig): readonly [number, number] {
    return this.axisExtent(config.orientation, config.id);
  }

  private updateLayout(): void {
    const measurer = this.measurer;
    // A domain proposed before this layout has had its answer.
    this.proposed.clear();
    // A zooming chart keeps the horizontal drag and the pinch; the page keeps
    // the vertical scroll.
    if (this.container !== null) this.container.style.touchAction = this.hasZoom() ? "pan-y" : "";
    const grid = this.gridDefault();
    const inputs: AxisInput[] = [];
    for (const [id, entry] of [...this.axes.entries()].sort((a, b) => a[1].order - b[1].order)) {
      const c = entry.config;
      inputs.push({
        key: `${c.orientation}:${c.id}`,
        id: c.id,
        orientation: c.orientation,
        position: c.position,
        label: c.label,
        grid: grid.get(id) ?? false,
        extent: this.extentFor(c),
        domainMode: c.domain,
        tickCount: c.tickCount,
        tickFormat: c.tickFormat,
        tickValues: c.ticks,
        time: c.time,
        calendar: c.calendar,
        alignTicks: c.alignTicks,
        limitLabels:
          c.orientation === "y"
            ? this.limitsInOrder()
                .map((l) => l.config)
                .filter((l) => l.orientation === "y" && this.limitAxisId(l) === c.id && l.label !== undefined && l.label !== "")
                .map((l) => l.label as string)
            : undefined,
      });
    }
    this.layout = computeLayout({
      width: this.cssWidth,
      height: this.cssHeight,
      padding: this.padding,
      axes: inputs,
      measure: (text, className) =>
        measurer === null ? { width: 0, height: 0 } : measurer.measure(text, className),
      hysteresis: this.hysteresis,
    });
  }

  private findAxis(orientation: "x" | "y", id: string): AxisLayout | null {
    for (const axis of this.layout.axes) {
      if (axis.orientation === orientation && axis.id === id) return axis;
    }
    return null;
  }

  /* ================= Series colours and legend entries ================= */

  /** A caller's CSS colour as the canvas can draw it (finding 15). */
  private paint(color: string): string {
    const root = this.themeRoot;
    if (root === null) return color;
    let resolved = this.painted.get(color);
    if (resolved === undefined) {
      resolved = resolveColours(root, { color }).color;
      this.painted.set(color, resolved);
    }
    return resolved;
  }

  private colorFor(entry: SeriesEntry): string {
    if (entry.config.color !== undefined) return this.paint(entry.config.color);
    // A band's colours come from its states, a cell's from its colouring.
    if (!takesPalette(entry.config)) return "";
    // A tone is not a colour value but a role: the theme resolves it. Canvas knows
    // no CSS variables - a "var(--uc-color-alarm)" in the color prop would
    // silently go black.
    const tone = entry.config.tone;
    if (tone !== undefined) {
      const theme = this.theme ?? FALLBACK_THEME;
      return tone === "alarm" ? theme.colorAlarm : tone === "warning" ? theme.colorWarning : theme.colorOk;
    }
    // Before the theme has been read for the first time, the built-in palette
    // carries, so that series never all briefly get the same colour.
    const palette = this.theme?.series ?? FALLBACK_THEME.series;
    return palette[this.paletteSlot(entry) % Math.max(1, palette.length)] ?? FALLBACK_THEME.series[0] ?? "#2563eb";
  }

  /** Named: the place of the name. Nameless: the position among the series that
      take a palette place, as before - and a warning as soon as that shifts
      underneath it. */
  private paletteSlot(entry: SeriesEntry): number {
    if (entry.config.name !== undefined) return entry.slot;
    let index = 0;
    for (const e of this.series.values()) {
      if (e.order < entry.order && takesPalette(e.config)) index++;
    }
    if (entry.lastSlot !== null && entry.lastSlot !== index) {
      warnOnce(
        "series-without-name-colour",
        "a series without a name has changed its colour, because a series before it went away - with `name` it keeps it.",
      );
    }
    entry.lastSlot = index;
    return index;
  }

  private nameFor(entry: SeriesEntry, index: number): string {
    if (entry.config.name !== undefined) return entry.config.name;
    // The last resort of the legend, and it stays one: the package has no text
    // layer, so every word it brings along itself is one word too many. Instead of
    // replacing it, it is made conspicuous (library-audit 03).
    warnOnce(
      "series-without-name",
      `a series without a name is called "Series ${index + 1}" in the legend and the tooltip - the name belongs in \`name\`.`,
    );
    return `Series ${index + 1}`;
  }

  legendItems(): LegendItem[] {
    const out: LegendItem[] = [];
    // Three machines share one state list. The legend explains colours, not
    // series - so it explains every colour once. Twelve entries for four states
    // would not be a legend but a list.
    // A band that shares an entry is highlighted with it.
    const seen = new Map<string, LegendItem>();
    this.seriesInOrder().forEach((entry, i) => {
      const config = entry.config;
      if (config.kind === "state") {
        // A state series does not explain itself but its colours. "Line 4" next to
        // a grey box says nothing; the reader wants to know what orange means.
        config.states.forEach((z, k) => {
          const key = `${z.label} ${z.color}`;
          const known = seen.get(key);
          if (known !== undefined) {
            if (!known.seriesIds.includes(entry.order)) known.seriesIds.push(entry.order);
            known.hidden &&= config.hidden === true;
            return;
          }
          const item: LegendItem = {
            id: `${entry.order}:${k}`,
            name: z.label,
            hidden: config.hidden === true,
            color: z.color,
            seriesIds: [entry.order],
          };
          seen.set(key, item);
          out.push(item);
        });
        return;
      }
      out.push({
        id: String(entry.order),
        name: this.nameFor(entry, i),
        hidden: config.hidden === true,
        color:
          config.kind === "matrix"
            ? chipOf(matrixColors(config.coloring, this.theme ?? FALLBACK_THEME))
            : this.colorFor(entry),
        seriesIds: [entry.order],
      });
    });
    return out;
  }

  /* ---------- Limits, ready in pixels ---------- */

  private limitColor(config: LimitConfig, theme: ResolvedTheme): string {
    if (config.color !== undefined) return this.paint(config.color);
    // A calculated limit carries no severity colour: it does not say "this is
    // bad" but "this is how this process otherwise behaves" (ADR-0008).
    if (config.role === "control") return theme.colorAxis;
    if (config.role === "zone") return theme.colorGrid;
    return config.severity === "alarm" ? theme.colorAlarm : theme.colorWarning;
  }

  /** Dash pattern per role. The reader has to be able to see at a glance whether
      the problem is the process or the tolerance. */
  private limitDash(config: LimitConfig): readonly number[] {
    switch (config.role) {
      case "control":
        return [];
      case "zone":
        return [2, 3];
      default:
        return [4, 3];
    }
  }

  private limitItems(band: boolean): LimitDrawItem[] {
    const theme = this.theme ?? FALLBACK_THEME;
    const out: LimitDrawItem[] = [];
    for (const { config } of this.limitsInOrder()) {
      if ((config.kind === "band") !== band) continue;
      const axis = this.findAxis(config.orientation, this.limitAxisId(config));
      if (axis === null) continue;
      const color = this.limitColor(config, theme);
      const dash = this.limitDash(config);
      if (config.kind === "band") {
        out.push({
          orientation: config.orientation,
          fromPx: axis.scale.toPx(this.limitAt(config, config.from)),
          toPx: axis.scale.toPx(this.limitAt(config, config.to)),
          color,
          band: true,
          dash,
        });
      } else {
        const px = axis.scale.toPx(this.limitAt(config, config.value));
        out.push({
          orientation: config.orientation,
          fromPx: px,
          toPx: px,
          color,
          band: false,
          dash,
        });
      }
    }
    return out;
  }

  /** Labelled limits for the HTML layer: position and colour, ready. */
  limitLabels(): readonly LimitLabel[] {
    const out: LimitLabel[] = [];
    for (const { order, config } of this.limitsInOrder()) {
      if (config.label === undefined || config.label === "") continue;
      const axis = this.findAxis(config.orientation, this.limitAxisId(config));
      if (axis === null) continue;
      const value =
        config.kind === "line"
          ? this.limitAt(config, config.value)
          : (this.limitAt(config, config.from) + this.limitAt(config, config.to)) / 2;
      const px = axis.scale.toPx(value);
      // As wide as a tick label of its text, and its 2 px padding either side.
      const width = (this.measurer?.measure(config.label, CLASS_TICK).width ?? 0) + 4;
      out.push({
        id: order,
        axisKey: axis.key,
        px,
        labelLeft: insideContainer(px, width, this.cssWidth),
        label: config.label,
        severity: config.severity,
        role: config.role,
      });
    }
    return out;
  }

  /* ================= Drawing ================= */

  private drawItems(): SeriesDrawItem[] {
    const items: SeriesDrawItem[] = [];
    // A hidden bar leaves no empty place in its group.
    const series = this.seriesInOrder().filter((e) => e.config.hidden !== true);
    // A highlight of nothing drawn - a hidden series' legend entry - dims nothing.
    const lit = this.highlight;
    const highlight = lit !== null && series.some((e) => lit.includes(e.order)) ? lit : null;
    // Bars on the same x axis share one step (ADR-0002); one pass over the
    // series, not over the points.
    const groups = barGroups(
      series.map((e) => ({
        order: e.order,
        kind: e.config.kind,
        xAxisId: e.config.xAxisId,
        step: e.step ?? 0,
        fraction: e.config.kind === "bar" ? e.config.barWidth : 0,
      })),
    );
    series.forEach((entry) => {
      const mat = entry.materialized;
      if (mat === null) return;
      const xAxis = this.findAxis("x", entry.config.xAxisId);
      const yAxis = this.findAxis("y", entry.config.yAxisId);
      if (xAxis === null || yAxis === null) return;
      const dimmed = highlight !== null && !highlight.includes(entry.order);
      const base: DrawBase = {
        x: mat.x,
        y: mat.y,
        length: mat.length,
        xScale: xAxis.scale,
        yScale: yAxis.scale,
        color: this.colorFor(entry),
        alpha: dimmed ? 0.25 : 1,
      };
      const config = entry.config;
      // A course draws its window, and above two points per pixel column only
      // what shows (downsample.ts); every other kind draws its points.
      const course =
        config.kind === "line" || config.kind === "area"
          ? downsample(mat, xAxis.scale.domain[0], xAxis.scale.domain[1], xAxis.scale.m, xAxis.scale.b, this.layout.plot.width)
          : mat;
      base.x = course.x;
      base.y = course.y;
      base.length = course.length;
      switch (config.kind) {
        case "line":
          items.push({
            ...base,
            kind: "line",
            strokeWidth: config.strokeWidth,
            dash: config.dash,
            markers: config.markers,
            step: config.step,
          });
          break;
        case "area":
          items.push({
            ...base,
            kind: "area",
            y0: course.y0,
            baseline: 0,
            fillOpacity: config.fillOpacity,
            strokeWidth: config.strokeWidth,
            dash: config.dash,
          });
          break;
        case "bar": {
          // Step and fraction come from the group, not from this series:
          // otherwise members with data of differing density would compute their
          // offsets from different group widths and lie on top of one another.
          const group = groups.get(entry.order) ?? {
            index: 0,
            size: 1,
            step: entry.step ?? 0,
            fraction: config.barWidth,
          };
          const domain = xAxis.scale.domain;
          const placement = barPlacement(
            effectiveStep(group.step, domain[1] - domain[0]),
            group.fraction,
            group.index,
            group.size,
          );
          items.push({
            ...base,
            kind: "bar",
            baseline: 0,
            offset: placement.offset,
            width: placement.width,
          });
          break;
        }
        case "scatter":
          items.push({ ...base, kind: "scatter", radius: config.radius });
          break;
        case "state": {
          const lane = this.lanePx(config, yAxis);
          items.push({
            ...base,
            kind: "state",
            colors: config.states.map((z) => this.paint(z.color)),
            laneTop: lane.top,
            laneBottom: lane.bottom,
            lastEnd: this.lastEnd(entry, mat, xAxis),
          });
          break;
        }
        case "matrix": {
          const colors = matrixColors(config.coloring, this.theme ?? FALLBACK_THEME).map((c) => this.paint(c));
          items.push({
            ...base,
            kind: "matrix",
            buckets: (entry.buckets ??= matrixBuckets(mat, config.coloring, colors.length)),
            colors: colors,
            width: cellSize(
              entry.step ?? 0,
              xAxis.scale.domain[1] - xAxis.scale.domain[0],
            ),
            height: cellSize(
              entry.cellHeight ?? 0,
              yAxis.scale.domain[1] - yAxis.scale.domain[0],
            ),
          });
          break;
        }
      }
    });
    return items;
  }

  /** Where a band's last state ends: the latest x of the visible series on its
      x axis, one step past its own last point where that is the latest, never
      beyond the domain (lastSegmentEnd). */
  private lastEnd(entry: SeriesEntry, mat: MaterializedSeries, xAxis: AxisLayout): number {
    let latest = Number.NEGATIVE_INFINITY;
    for (const e of this.series.values()) {
      const m = e.materialized;
      if (m === null || m.length === 0 || e.config.hidden === true || e.config.xAxisId !== entry.config.xAxisId) continue;
      const x = m.x[m.length - 1] as number;
      if (x > latest) latest = x;
    }
    return lastSegmentEnd(mat.x, mat.length, latest, entry.step ?? 0, xAxis.scale.domain[1]);
  }

  /** Lane of a state series in pixels. Without a value the whole domain of its y
      axis: a single series fills its band, a stack gets a domain with one unit per
      machine from the caller. */
  private lanePx(
    config: StateSeriesConfig,
    yAxis: AxisLayout,
  ): { top: number; bottom: number } {
    const domain = yAxis.scale.domain;
    const a = yAxis.scale.toPx(config.laneFrom ?? domain[0]);
    const b = yAxis.scale.toPx(config.laneTo ?? domain[1]);
    return { top: Math.min(a, b), bottom: Math.max(a, b) };
  }

  private drawSeriesLayer(): void {
    const ctx = this.seriesCtx;
    const theme = this.theme;
    if (!ctx || !theme) return;
    const start = typeof performance === "undefined" ? 0 : performance.now();
    drawSeriesLayer(ctx, {
      width: this.cssWidth,
      height: this.cssHeight,
      plot: this.layout.plot,
      axes: this.layout.axes,
      theme,
      series: this.drawItems(),
      limitBands: this.limitItems(true),
      limitLines: this.limitItems(false),
    });
    this.perf.seriesDrawMs =
      (typeof performance === "undefined" ? 0 : performance.now()) - start;
    this.onPerf?.({ ...this.perf });
  }

  private drawOverlayLayer(): void {
    const ctx = this.overlayCtx;
    const theme = this.theme;
    if (!ctx || !theme) return;
    drawOverlayLayer(ctx, {
      width: this.cssWidth,
      height: this.cssHeight,
      plot: this.layout.plot,
      theme,
      hover: this.hover,
      syncPx: this.syncedPx(),
    });
    this.positionTooltip();
  }

  /* ================= Interaction (4.4) ================= */

  setHighlight(ids: readonly number[] | null): void {
    if (this.highlight === ids) return;
    this.highlight = ids;
    // Not a mousemove path: a redraw of the series layer is allowed here (R-4.11).
    this.markSeriesDirty();
  }

  private inPlot(x: number, y: number): boolean {
    const p: Rect = this.layout.plot;
    return x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height;
  }

  pointerMove(x: number, y: number): void {
    if (!this.inPlot(x, y)) {
      this.pointerLeave();
      return;
    }
    if (this.tooltip === null) {
      // No hit to snap to - the pointer's own x is what a synced chart shows.
      const axis = this.layout.axes.find((a) => a.orientation === "x");
      if (axis !== undefined) this.share({ axisId: axis.id, value: axis.scale.fromPx(x) });
      return;
    }
    if (!this.showAt(x, y)) {
      this.pointerLeave();
      return;
    }
    if (this.activeBy === "keyboard") this.releaseKey();
    this.activeBy = "pointer";
  }

  /** The Active point at a pixel - the pointer's, or the one a key resolved
      to. False where nothing is hit there. */
  private showAt(x: number, y: number): boolean {
    const hit = this.hitTest(x, y);
    if (hit === null) return false;
    const key = hit.key;
    this.hover = hit.state;
    this.hover.mouseX = x;
    this.hover.mouseY = y;
    this.markOverlayDirty(); // R-2.11: a hover never touches the series layer
    const xAxis = this.findAxis("x", hit.primary.entry.config.xAxisId);
    if (xAxis !== null) this.share({ axisId: xAxis.id, value: xAxis.scale.fromPx(hit.state.hit.xPx) });
    if (key !== this.hoverKey) {
      // Written out once per hit, not per movement: a format is not free.
      const xAxisId = hit.primary.entry.config.xAxisId;
      this.hoverKey = key;
      this.hoverXLabel = this.xLabel(xAxisId, hit.primary.xValue, subMinute(hit.primary));
      this.hoverRows = hit.chosen.map((k) => this.tooltipRow(k, xAxisId));
      this.hoverOrders = hit.chosen.map((k) => k.entry.order);
      this.pushHoverSnapshot();
    }
    return true;
  }

  /** The pointer went away. A point the keyboard set stays (charts-a11y R3). */
  pointerLeave(): void {
    if (this.activeBy === "keyboard") return;
    this.clearActive();
  }

  /** No Active point, by whoever set it. */
  private clearActive(): void {
    this.releaseKey();
    this.activeBy = null;
    this.share(null);
    if (this.hover === null && this.hoverKey === "") return;
    this.hover = null;
    this.hoverKey = "";
    this.markOverlayDirty();
    this.pushHoverSnapshot();
  }

  private hitTest(
    mouseX: number,
    mouseY: number,
  ): { key: string; state: HoverState; primary: Candidate; chosen: readonly Candidate[] } | null {
    const mode = this.tooltip?.mode ?? "x";
    const candidates: Candidate[] = [];
    this.seriesInOrder().forEach((entry, i) => {
      const mat = entry.materialized;
      if (mat === null || mat.length === 0 || entry.config.hidden === true) return;
      const config = entry.config;
      const xAxis = this.findAxis("x", config.xAxisId);
      const yAxis = this.findAxis("y", config.yAxisId);
      if (xAxis === null || yAxis === null) return;
      // Mouse position in the axis space of this series (R-4.6).
      const targetX = xAxis.scale.fromPx(mouseX);
      const targetY = yAxis.scale.fromPx(mouseY);
      const hit = this.hitIn(entry, mat, xAxis, yAxis, mouseY, targetX, targetY, mode);
      if (hit === null) return;
      candidates.push({
        entry,
        index: hit.index,
        color: hit.color ?? this.colorFor(entry),
        name: this.nameFor(entry, i),
        px: hit.px,
        py: hit.py,
        xValue: hit.xValue,
        yValue: hit.yValue,
        marked: hit.marked,
        areal: hit.areal,
        value: hit.value,
        segment: hit.segment,
      });
    });
    if (candidates.length === 0) return null;

    /* The primary hit determines the crosshair and the grouping, and for that
       only whoever has a comparable place counts at all. The px of an area is the
       BEGINNING of its section and lies arbitrarily far to the left of the
       pointer; throwing it into the same distance comparison would mean pinning
       the crosshair to a segment edge. */
    const pointLike = candidates.filter((k) => !k.areal);
    const comparable = pointLike.length > 0 ? pointLike : candidates;
    let primary = comparable[0] as Candidate;
    if (mode === "nearest") {
      let best = Number.POSITIVE_INFINITY;
      for (const k of pointLike) {
        const dx = k.px - mouseX;
        const dy = k.py - mouseY;
        const d = dx * dx + dy * dy; // Euclidean comparison in pixel space
        if (d < best) {
          best = d;
          primary = k;
        }
      }
      // An area covers the pointer wherever it is hit, so its distance is always
      // zero - it would beat every point. It answers only where no point is
      // within reach.
      if (best > SNAP_DISTANCE * SNAP_DISTANCE) {
        for (const k of candidates) {
          if (k.areal) {
            primary = k;
            break;
          }
        }
      }
    } else {
      let best = Number.POSITIVE_INFINITY;
      for (const k of comparable) {
        const d = Math.abs(k.px - mouseX);
        if (d < best) {
          best = d;
          primary = k;
        }
      }
    }

    const chosen =
      mode === "nearest"
        ? [primary]
        : candidates.filter(
            // An area is always included: it covers the pointer, otherwise it
            // would not have reported a hit at all. Only points have to share the
            // x position.
            (k) => k.areal || Math.abs(k.px - primary.px) <= GROUP_TOLERANCE,
          );

    const points: TooltipPoint[] = chosen.map((k) => ({
      seriesName: k.name,
      color: k.color,
      xValue: k.xValue,
      yValue: k.yValue,
      datum: (k.entry.config.data ?? this.data)[k.index],
      index: k.index,
      value: k.value,
      segment: k.segment,
    }));
    const hit: TooltipHit = {
      xValue: primary.xValue,
      points,
      // An area's px is the beginning of its section; the crosshair and the
      // tooltip stay with the pointer instead.
      xPx: primary.areal ? mouseX : primary.px,
      yPx: primary.py,
    };
    const state: HoverState = {
      hit,
      marker: chosen
        .filter((k) => k.marked)
        .map((k) => ({ x: k.px, y: k.py, color: k.color })),
      mouseX,
      mouseY,
    };
    const key = chosen.map((k) => `${k.entry.order}:${k.index}`).join("|");
    return { key, state, primary, chosen };
  }

  /* ---------- The keyboard's walk (charts-a11y, ADR-0030) ----------

     The plot area is one tab stop; the keys move the Active point over the
     positions the pointer would hit (walk.ts), and a position becomes a hit by
     asking the hit test at its pixel - so the tooltip, the markers and the
     sync are the pointer's own. */

  /** The visible series with points, in registration order. */
  private walkable(): SeriesEntry[] {
    return this.seriesInOrder().filter(
      (e) => e.config.hidden !== true && e.materialized !== null && e.materialized.length > 0,
    );
  }

  private emphasised(): SeriesEntry | null {
    const all = this.walkable();
    return all.find((e) => e.order === this.emphasis) ?? all[0] ?? null;
  }

  /** What ←/→ walk over: under "nearest" the emphasised series alone, under
      "x" every series on its x axis. */
  private walked(emph: SeriesEntry): WalkSeries[] {
    const alone = this.tooltip?.mode === "nearest";
    return this.walkable()
      .filter((e) => (alone ? e === emph : e.config.xAxisId === emph.config.xAxisId))
      .map((e) => ({ ...(e.materialized as MaterializedSeries), changesOnly: e.config.kind === "state" }));
  }

  /** The focus came in: the walk starts at the newest position, unless the
      pointer already stands somewhere (R1). A pointer's focus - a click - does
      not start it. */
  focus(byKeyboard: boolean): void {
    if (this.tooltip === null || !byKeyboard || this.hover !== null) return;
    this.walk("last");
  }

  /** The focus left: a point the keyboard set goes with it. */
  blur(): void {
    if (this.activeBy === "keyboard") this.clearActive();
  }

  /** A key on the plot area; true where the chart took it. */
  key(event: KeyboardEvent): boolean {
    if (this.tooltip === null || event.altKey || event.ctrlKey || event.metaKey) return false;
    if (event.key === "Escape") {
      if (this.hover === null) return false;
      this.clearActive();
      return true;
    }
    if (this.zoomKey(event)) return true;
    const emph = this.emphasised();
    if (emph === null) return false;
    if (emph.config.kind === "matrix") return this.cellKey(event.key, emph);
    const move = event.shiftKey ? undefined : MOVES[event.key];
    if (move !== undefined) {
      this.walk(move);
      return true;
    }
    if (!event.shiftKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      this.changeSeries(event.key === "ArrowDown" ? 1 : -1);
      return true;
    }
    return false;
  }

  /** Zoom and pan by key (Q6), only where the caller controls the domain:
      each key proposes what its gesture would. */
  private zoomKey(event: KeyboardEvent): boolean {
    if (!this.hasZoom()) return false;
    const plot = this.layout.plot;
    const at = this.hover?.hit.xPx ?? plot.x + plot.width / 2;
    if (event.key === "+" || event.key === "=") this.zoomAt(at, 1 / KEY_ZOOM);
    else if (event.key === "-" || event.key === "_") this.zoomAt(at, KEY_ZOOM);
    else if (event.key === "0") this.doubleClick();
    else if (event.shiftKey && (event.key === "ArrowLeft" || event.key === "ArrowRight"))
      this.panBy(((event.key === "ArrowLeft" ? 1 : -1) * plot.width) / 10);
    else return false;
    return true;
  }

  /** Where the walk starts from: the keyboard's own place, or the pointer's. */
  private walkFrom(): number | null {
    if (this.activeBy === "keyboard") return this.keyX;
    return this.hover?.hit.xValue ?? null;
  }

  private walk(move: Move): void {
    const emph = this.emphasised();
    if (emph?.config.kind === "matrix") {
      const cell = this.lastCell(emph);
      if (cell !== null) this.showCell(emph, cell);
      return;
    }
    const xAxis = emph === null ? null : this.findAxis("x", emph.config.xAxisId);
    if (emph === null || xAxis === null) return;
    const from = this.activeBy === null ? null : this.walkFrom();
    const to = stepPosition(this.walked(emph), from, move, xAxis.scale.domain);
    if (to !== null) this.showPosition(emph, to);
  }

  private changeSeries(step: 1 | -1): void {
    const all = this.walkable();
    const current = this.emphasised();
    if (current === null || all.length < 2) return;
    const next = all[(all.indexOf(current) + step + all.length) % all.length] as SeriesEntry;
    this.emphasis = next.order;
    // The legend's hover emphasis shows which series is read first.
    this.setHighlight([next.order]);
    this.keyHighlight = true;
    const x = this.walkFrom();
    const xAxis = this.findAxis("x", next.config.xAxisId);
    if (xAxis === null) return;
    const to = x === null ? stepPosition(this.walked(next), null, "last", xAxis.scale.domain) : nearestPosition(this.walked(next), x, xAxis.scale.domain);
    if (to === null) return;
    this.keyCell = null;
    if (next.config.kind === "matrix") {
      const cell = this.columnStart(next, to);
      if (cell !== null) this.showCell(next, cell);
    } else this.showPosition(next, to);
  }

  /** A matrix walks cell by cell in two dimensions (R7). At the top or
      bottom of its column ↑/↓ go on to the chart's other series, so a matrix
      among them does not keep the keys. */
  private cellKey(key: string, emph: SeriesEntry): boolean {
    const mat = emph.materialized as MaterializedSeries;
    const at = this.keyCell ?? this.lastCell(emph);
    if (at === null) return false;
    const direction = CELL_STEPS[key];
    let next: Cell;
    if (direction !== undefined) next = stepCell(mat, at, direction);
    else if (key === "Home" || key === "End") next = rowEnd(mat, at, key === "Home" ? "start" : "end");
    else return false;
    if (next === at && (direction === "up" || direction === "down") && this.walkable().length > 1) {
      this.changeSeries(direction === "down" ? 1 : -1);
      return true;
    }
    this.showCell(emph, next);
    return true;
  }

  /** Where a matrix' walk starts: the newest column, its lowest row. */
  private lastCell(emph: SeriesEntry): Cell | null {
    const mat = emph.materialized as MaterializedSeries;
    const xAxis = this.findAxis("x", emph.config.xAxisId);
    const x = xAxis === null ? null : stepPosition([mat], null, "last", xAxis.scale.domain);
    return x === null ? null : this.columnStart(emph, x);
  }

  /** The lowest cell with a value in a matrix' column. */
  private columnStart(emph: SeriesEntry, x: number): Cell | null {
    const below = { x, y: Number.NEGATIVE_INFINITY };
    const cell = stepCell(emph.materialized as MaterializedSeries, below, "up");
    return cell === below ? null : cell;
  }

  private showCell(emph: SeriesEntry, cell: Cell, speak = true): void {
    const xAxis = this.findAxis("x", emph.config.xAxisId);
    const yAxis = this.findAxis("y", emph.config.yAxisId);
    if (xAxis === null || yAxis === null) return;
    this.keyCell = cell;
    this.moveKey(cell.x, xAxis.scale.toPx(cell.x), yAxis.scale.toPx(cell.y), speak);
  }

  /** The Active point at a position of the emphasised series. The pixel's y
      is that series' own, so that "nearest" picks it and a lane is hit. */
  private showPosition(emph: SeriesEntry, x: number, speak = true): void {
    const xAxis = this.findAxis("x", emph.config.xAxisId);
    const yAxis = this.findAxis("y", emph.config.yAxisId);
    const mat = emph.materialized;
    if (xAxis === null || yAxis === null || mat === null) return;
    let py: number;
    if (emph.config.kind === "state") {
      const lane = this.lanePx(emph.config, yAxis);
      py = (lane.top + lane.bottom) / 2;
    } else {
      const v = mat.y[nearestIndex(mat.x, mat.length, x)] as number;
      py = Number.isNaN(v) ? this.layout.plot.y + this.layout.plot.height / 2 : yAxis.scale.toPx(v);
    }
    this.moveKey(x, xAxis.scale.toPx(x), py, speak);
  }

  private moveKey(x: number, px: number, py: number, speak = true): void {
    if (!this.showAt(px, py)) return;
    this.activeBy = "keyboard";
    this.keyX = x;
    if (speak) this.scheduleReadout();
  }

  /* ---------- What is spoken (charts-a11y 03) ---------- */

  /** The readout, written once the keys rest (R11): a held key speaks where
      it stops. It reads what the tooltip shows, the emphasised series first. */
  private scheduleReadout(): void {
    if (this.readoutEl === null) return;
    if (this.readoutTimer !== null) clearTimeout(this.readoutTimer);
    this.readoutTimer = setTimeout(() => {
      this.readoutTimer = null;
      const el = this.readoutEl;
      if (el !== null && this.activeBy === "keyboard") el.textContent = this.readoutText();
    }, READOUT_REST);
  }

  private readoutText(): string {
    const hover = this.hover;
    if (hover === null) return "";
    const rows = hover.hit.points.map((point, k) => {
      const row = this.hoverRows[k];
      return { order: this.hoverOrders[k], name: point.seriesName, value: row?.value ?? "", x: row?.x ?? "" };
    });
    const emph = this.emphasised()?.order;
    rows.sort((a, b) => Number(b.order === emph) - Number(a.order === emph));
    return this.wording.readout(this.hoverXLabel, rows);
  }

  /** The summary is rebuilt after a layout, but not on every one: a zoom lays
      out every frame, and the summary reads every visible point. */
  private scheduleSummary(): void {
    if (this.summaryEl === null) return;
    if (this.summaryTimer !== null) clearTimeout(this.summaryTimer);
    this.summaryTimer = setTimeout(() => {
      this.summaryTimer = null;
      if (this.summaryEl !== null) this.summaryEl.textContent = this.summaryText();
    }, SUMMARY_REST);
  }

  /** Kind of content, series by name, the visible stretch, each series' range
      in it and the keys (R10). A band has no range - its values are states. */
  private summaryText(): string {
    const w = this.wording;
    const series = this.walkable();
    const parts: string[] = [];
    const all = this.seriesInOrder();
    if (series.length > 0) parts.push(w.seriesList(series.map((e) => this.nameFor(e, all.indexOf(e)))));
    const first = series[0];
    const xAxis = first === undefined ? null : this.findAxis("x", first.config.xAxisId);
    if (first !== undefined && xAxis !== null) {
      const [from, to] = xAxis.scale.domain;
      parts.push(w.visibleRange(this.xLabel(first.config.xAxisId, from), this.xLabel(first.config.xAxisId, to)));
    }
    for (const entry of series) {
      if (entry.config.kind === "state") continue;
      const range = this.visibleRange(entry);
      if (range === null) continue;
      const name = this.nameFor(entry, all.indexOf(entry));
      parts.push(w.seriesExtent(name, this.formatY(entry, range[0]), this.formatY(entry, range[1])));
    }
    if (this.tooltip !== null) {
      parts.push(w.walkHelp);
      if (this.hasZoom()) parts.push(w.zoomHelp);
    }
    return parts.join(" ");
  }

  /** The lowest and highest value of a series inside its x axis' domain; a
      cell's value, every other kind's y. */
  private visibleRange(entry: SeriesEntry): [number, number] | null {
    const mat = entry.materialized;
    const xAxis = this.findAxis("x", entry.config.xAxisId);
    if (mat === null || xAxis === null) return null;
    const [from, to] = xAxis.scale.domain;
    const values = mat.w ?? mat.y;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    // ponytail: reads every visible point once per summary; debounced above,
    // so a zoom pays it once when it rests, not per frame.
    for (let i = lowerBound(mat.x, mat.length, from); i < mat.length && (mat.x[i] as number) <= to; i++) {
      const v = values[i] as number;
      if (!Number.isFinite(v) || Number.isNaN(mat.y[i] as number)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return min <= max ? [min, max] : null;
  }

  /** A value as the tooltip writes it: the series' format, else its y axis'
      (a cell's value has no y axis format). */
  private formatY(entry: SeriesEntry, v: number): string {
    const config = entry.config;
    if (config.format !== undefined) return config.format(v);
    if (config.kind === "matrix") return formatValue(v);
    const own = this.findAxisConfig("y", config.yAxisId)?.tickFormat;
    return own === undefined ? formatValue(v) : own(v);
  }

  /** After a layout - new data, a new domain -, the keyboard's point goes to
      the nearest position still visible (Q6), or goes away. */
  private reapplyKey(): void {
    const emph = this.emphasised();
    const xAxis = emph === null ? null : this.findAxis("x", emph.config.xAxisId);
    const x = emph === null || xAxis === null || this.keyX === null ? null : nearestPosition(this.walked(emph), this.keyX, xAxis.scale.domain);
    if (emph === null || x === null) {
      this.clearActive();
      return;
    }
    if (emph.config.kind !== "matrix") this.showPosition(emph, x, false);
    else {
      // The cell stays where it still stands; a column zoomed away gives way
      // to the nearest one still shown, in the same row where it has a value.
      const kept = this.keyCell;
      const mat = emph.materialized as MaterializedSeries;
      const cell = kept !== null && hasCell(mat, { x, y: kept.y }) ? { x, y: kept.y } : this.columnStart(emph, x);
      if (cell !== null) this.showCell(emph, cell, false);
    }
  }

  /** The keyboard lets go: its emphasis leaves the series layer. */
  private releaseKey(): void {
    this.keyX = null;
    this.keyCell = null;
    if (this.keyHighlight) {
      this.keyHighlight = false;
      this.setHighlight(null);
    }
  }

  /* ---------- Cursor sync (charts-long-series 04) ----------

     Only the x position travels, in domain units: each chart draws its own
     crosshair there, on its x axis of the same id - or its first -, and the
     tooltip stays with the chart under the pointer. Zoom is not shared; the
     caller gives every chart the same controlled domain. */

  private syncId: string | null = null;
  /** Where another chart's pointer stands; null while none does. */
  private synced: SyncedX | null = null;
  private sent: SyncedX | null = null;

  setSyncId(id: string | null): void {
    if (id === this.syncId) return;
    if (this.syncId !== null) {
      this.share(null);
      const group = syncGroups.get(this.syncId);
      group?.delete(this);
      if (group?.size === 0) syncGroups.delete(this.syncId);
      // The crosshair the old group asked for is no longer this chart's.
      this.synced = null;
      this.markOverlayDirty();
    }
    this.syncId = id;
    if (id !== null) {
      const group = syncGroups.get(id) ?? new Set<ChartScene>();
      group.add(this);
      syncGroups.set(id, group);
    }
  }

  private share(x: SyncedX | null): void {
    if (this.syncId === null || (x?.value === this.sent?.value && x?.axisId === this.sent?.axisId)) return;
    this.sent = x;
    for (const other of syncGroups.get(this.syncId) ?? []) {
      if (other === this) continue;
      other.synced = x;
      other.markOverlayDirty();
    }
  }

  /** The crosshair a synced position asks for, in this chart's pixels. */
  private syncedPx(): number | null {
    const x = this.synced;
    if (x === null) return null;
    const axis = this.findAxis("x", x.axisId) ?? this.layout.axes.find((a) => a.orientation === "x") ?? null;
    return axis === null ? null : axis.scale.toPx(x.value);
  }

  /* ---------- Zoom and pan (charts-long-series 01) ----------

     The schedule's model, not its code: Ctrl or ⌘ with the wheel zooms - a
     trackpad pinch arrives as exactly that -, a horizontal wheel or Shift pans,
     the plain wheel is the page's. A drag pans, two fingers pinch, a double
     click asks for everything. Nothing here changes a domain: each gesture
     proposes one to the axis' handler, and the caller passes it back. */

  /** What was last proposed per axis, until a layout has taken the answer: a
      second wheel step in the same frame builds on the first, not on the
      domain still drawn. */
  private readonly proposed = new Map<string, readonly [number, number]>();
  private readonly pointers = new Map<number, number>();
  private pinch = 0;

  private hasZoom(): boolean {
    for (const { config } of this.axes.values()) {
      if (config.orientation === "x" && config.onDomainChange !== undefined) return true;
    }
    return false;
  }

  /** The x axes a gesture speaks to. */
  private zoomAxes(): { config: AxisConfig; layout: AxisLayout }[] {
    const out: { config: AxisConfig; layout: AxisLayout }[] = [];
    for (const { config } of this.axesInOrder()) {
      if (config.orientation !== "x" || config.onDomainChange === undefined) continue;
      const layout = this.findAxis("x", config.id);
      if (layout !== null) out.push({ config, layout });
    }
    return out;
  }

  private propose(next: (domain: readonly [number, number], axisId: string) => [number, number]): void {
    for (const { config, layout } of this.zoomAxes()) {
      const domain = next(this.proposed.get(config.id) ?? layout.scale.domain, config.id);
      if (!(domain[1] - domain[0] > 0) || !Number.isFinite(domain[1] - domain[0])) continue;
      this.proposed.set(config.id, domain);
      config.onDomainChange?.(domain);
    }
  }

  /** Zoom by `factor` (below 1 is closer) around a pixel, which keeps its
      value. */
  private zoomAt(px: number, factor: number): void {
    const p = this.layout.plot;
    const share = p.width > 0 ? Math.min(1, Math.max(0, (px - p.x) / p.width)) : 0.5;
    this.propose(([from, to]) => {
      const anchor = from + share * (to - from);
      const span = (to - from) * factor;
      return [anchor - share * span, anchor - share * span + span];
    });
  }

  /** Pan by a distance in pixels; positive moves the content right. */
  private panBy(dx: number): void {
    const width = this.layout.plot.width;
    if (width <= 0 || dx === 0) return;
    this.propose(([from, to]) => {
      const delta = (-dx / width) * (to - from);
      return [from + delta, to + delta];
    });
  }

  wheel(event: WheelEvent): void {
    if (!this.hasZoom()) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.layout.plot.width : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // A pinch sends small deltas, a mouse wheel large ones.
      this.zoomAt(event.offsetX, Math.exp(dy * (Math.abs(dy) < 50 ? 0.01 : 0.0015)));
    } else if (Math.abs(dx) > Math.abs(dy) || event.shiftKey) {
      event.preventDefault();
      this.panBy(-(event.shiftKey && dx === 0 ? dy : dx));
    }
  }

  pointerDown(event: PointerEvent): void {
    if (!this.hasZoom()) return;
    if (event.pointerType !== "touch" && event.button !== 0) return;
    this.pointers.set(event.pointerId, event.offsetX);
    this.container?.setPointerCapture?.(event.pointerId);
    if (this.pointers.size === 2) this.pinch = this.pinchWidth();
  }

  /** A drag pans, two fingers pinch. */
  drag(event: PointerEvent): void {
    const last = this.pointers.get(event.pointerId);
    if (last === undefined) return;
    this.pointers.set(event.pointerId, event.offsetX);
    if (this.pointers.size === 1) {
      this.panBy(event.offsetX - last);
      return;
    }
    const width = this.pinchWidth();
    if (this.pinch > 0 && width > 0) {
      const [a = 0, b = 0] = this.pointers.values();
      this.zoomAt((a + b) / 2, this.pinch / width);
    }
    this.pinch = width;
  }

  pointerUp(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    this.pinch = this.pinchWidth();
  }

  private pinchWidth(): number {
    const [a, b] = this.pointers.values();
    return a === undefined || b === undefined ? 0 : Math.abs(a - b);
  }

  /** The whole data range: the extent the axis has without a domain. */
  doubleClick(): void {
    this.propose((_, axisId) => {
      const [from, to] = this.axisExtent("x", axisId);
      return [from, to];
    });
  }

  /** An x value in the format of its x axis - the header's, or a point's own. */
  private xLabel(xAxisId: string, xValue: number, seconds = false): string {
    const xAxis = this.findAxis("x", xAxisId);
    return xAxis === null ? String(xValue) : xAxis.format(xValue, seconds);
  }

  /** What the built-in tooltip writes for one hit. A state has a name and no
      meaningful number; a cell has a number that is not its y position, and so
      no y axis' format; every other value is read against its y axis and
      written in its format. A series' own `format` comes before either. */
  private tooltipRow(k: Candidate, headerXAxisId: string): TooltipRow {
    const config = k.entry.config;
    const label = k.segment?.label;
    let value: string;
    if (label !== undefined && label !== "") value = label;
    else if (k.value !== undefined) value = (config.format ?? formatValue)(k.value);
    else {
      const own = config.format ?? this.findAxisConfig("y", config.yAxisId)?.tickFormat;
      value = own === undefined ? formatValue(k.yValue) : own(k.yValue);
    }
    const x = config.xAxisId === headerXAxisId ? "" : this.xLabel(config.xAxisId, k.xValue);
    return { value, x };
  }

  /** The hit of one series - one different question per kind.

      Every mark that is a point asks "which point lies nearest". A band and a
      cell ask "what lies under the pointer", and that is not the same question:
      for the right half of every segment the nearest point gives the wrong
      answer. */
  private hitIn(
    entry: SeriesEntry,
    mat: MaterializedSeries,
    xAxis: AxisLayout,
    yAxis: AxisLayout,
    mouseY: number,
    targetX: number,
    targetY: number,
    mode: "x" | "nearest",
  ): {
    index: number;
    px: number;
    py: number;
    xValue: number;
    yValue: number;
    marked: boolean;
    areal: boolean;
    color?: string;
    value?: number;
    segment?: { from: number; to: number; label: string };
  } | null {
    const config = entry.config;
    const n = mat.length;

    if (config.kind === "state") {
      const lane = this.lanePx(config, yAxis);
      // A band is hit only within its lane; otherwise the topmost lane of a stack
      // would catch everything lying beneath it.
      if (mouseY < lane.top || mouseY > lane.bottom) return null;
      const index = segmentIndex(mat.x, n, targetX);
      if (index < 0) return null;
      const code = mat.y[index] as number;
      if (Number.isNaN(code)) return null; // a hole is no hit
      const from = mat.x[index] as number;
      const to = segmentEnd(mat.x, n, index, this.lastEnd(entry, mat, xAxis));
      if (index === n - 1 && !(targetX < to)) return null; // after the last report
      const state = config.states[code | 0];
      return {
        index,
        px: xAxis.scale.toPx(from),
        py: (lane.top + lane.bottom) / 2,
        xValue: from,
        yValue: code,
        marked: false,
        areal: true,
        color: state?.color,
        segment: { from, to, label: state?.label ?? "" },
      };
    }

    if (config.kind === "matrix") {
      const index = cellIndex(
        mat.x,
        mat.y,
        n,
        targetX,
        targetY,
        cellSize(entry.step ?? 0, xAxis.scale.domain[1] - xAxis.scale.domain[0]),
        cellSize(entry.cellHeight ?? 0, yAxis.scale.domain[1] - yAxis.scale.domain[0]),
      );
      if (index < 0) return null;
      const w = mat.w;
      const value = w === null ? Number.NaN : (w[index] as number);
      if (!Number.isFinite(value)) return null; // a hole is no hit
      const xValue = mat.x[index] as number;
      const yValue = mat.y[index] as number;
      // The chip shows the cell's own colour, bucketed as the drawing does it.
      const colors = matrixColors(config.coloring, this.theme ?? FALLBACK_THEME);
      entry.buckets ??= matrixBuckets(mat, config.coloring, colors.length);
      return {
        index,
        px: xAxis.scale.toPx(xValue),
        py: yAxis.scale.toPx(yValue),
        color: colors[entry.buckets[index] as number],
        xValue,
        // yValue stays the position on the y axis; the value that carries the
        // colour stands in a field of its own. Colour alone can transport no
        // number - which is why the tooltip has to carry it.
        yValue,
        value,
        marked: false,
        areal: true,
      };
    }

    // A scatter's points are not a course: under "nearest" the one the pointer
    // is at is the nearest in the plane, not the nearest in x.
    // A step line's value at the pointer is the sample its hold began with,
    // not the nearer one after it.
    const index =
      config.kind === "scatter" && mode === "nearest"
        ? nearestPoint(mat.x, mat.y, n, targetX, targetY, xAxis.scale, yAxis.scale)
        : config.kind === "line" && config.step === true
          ? segmentIndex(mat.x, n, targetX)
          : nearestIndex(mat.x, n, targetX);
    if (index < 0) return null;
    const yValue = mat.y[index] as number;
    if (Number.isNaN(yValue)) return null; // gaps are no hits (R-4.6)
    const xValue = mat.x[index] as number;
    return {
      index,
      px: xAxis.scale.toPx(xValue),
      py: yAxis.scale.toPx(yValue),
      xValue,
      yValue,
      marked: true,
      areal: false,
    };
  }

  /** R-4.9: 12 px to the right of the crosshair, flipping at the right edge,
      clamped vertically. */
  private positionTooltip(): void {
    const el = this.tooltipEl;
    if (el === null) return;
    const hover = this.hover;
    if (hover === null) {
      el.style.opacity = "0";
      return;
    }
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    let x = hover.hit.xPx + 12;
    if (x + width > this.cssWidth) x = hover.hit.xPx - 12 - width;
    if (x < 0) x = 0;
    let y = hover.mouseY - height / 2;
    y = Math.min(Math.max(y, 0), Math.max(0, this.cssHeight - height));
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    el.style.opacity = "1";
  }

  /* ================= Snapshots for the HTML layer ================= */

  /** Does a visible series have a point to show - a y that is no gap, and for
      a cell a value? A chart without one says so rather than draw an empty
      frame on [0, 1]. Stops at the first point found. */
  private showsAPoint(): boolean {
    for (const entry of this.series.values()) {
      const mat = entry.materialized;
      if (mat === null || entry.config.hidden === true) continue;
      for (let i = 0; i < mat.length; i++) {
        if (!Number.isNaN(mat.y[i] as number) && (mat.w === null || Number.isFinite(mat.w[i] as number))) return true;
      }
    }
    return false;
  }

  private pushLayoutSnapshot(): void {
    this.scheduleSummary();
    this.layoutSnapshot = {
      version: this.layoutSnapshot.version + 1,
      layout: this.layout,
      legend: this.legend,
      series: this.legendItems(),
      limits: this.limitLabels(),
      empty: !this.showsAPoint(),
    };
    for (const notify of this.layoutSubscribers) notify();
  }

  private pushHoverSnapshot(): void {
    this.hoverSnapshot = {
      version: this.hoverSnapshot.version + 1,
      hover: this.hover,
      tooltip: this.tooltip,
      xLabel: this.hoverXLabel,
      rows: this.hoverRows,
    };
    for (const notify of this.hoverSubscribers) notify();
  }

  readonly subscribeLayout = (notify: () => void): (() => void) => {
    this.layoutSubscribers.add(notify);
    return () => {
      this.layoutSubscribers.delete(notify);
    };
  };

  readonly getLayoutSnapshot = (): LayoutSnapshot => this.layoutSnapshot;
  readonly getLayoutServerSnapshot = (): LayoutSnapshot => EMPTY_LAYOUT_SNAPSHOT;

  readonly subscribeHover = (notify: () => void): (() => void) => {
    this.hoverSubscribers.add(notify);
    return () => {
      this.hoverSubscribers.delete(notify);
    };
  };

  readonly getHoverSnapshot = (): HoverSnapshot => this.hoverSnapshot;
  readonly getHoverServerSnapshot = (): HoverSnapshot => EMPTY_HOVER_SNAPSHOT;

  /** Class name of the measuring span for tick labels - keeps the CSS and the
      layout in step. */
  static readonly classTick = CLASS_TICK;
}
