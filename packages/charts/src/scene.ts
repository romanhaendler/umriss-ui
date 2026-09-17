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
   count as equal when their source text is equal. Known limit: an accessor that
   reads a changed closure variable without its source text or its data reference
   changing is not re-materialised - in that case the app must pass a new data
   reference. */

import { FALLBACK_THEME, resolveTheme, subscribeTheme, type ResolvedTheme } from "./theme";
import { DEV, invariant, warnOnce } from "./dev";
import { TextMeasurer } from "./measure";
import {
  computeLayout,
  CLASS_TICK,
  EMPTY_LAYOUT,
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
import { nearestIndex } from "./hit";
import { segmentEnd, segmentIndex } from "./state";
import { cellSize, cellIndex, measureSpacing } from "./cells";
import { isOpen, spanEnd, spanIndex, overlapDepth } from "./spans";
import { assess } from "./limit";
import { inRemovedTime, toOperatingTimeClamped } from "./operatingTime";
import {
  axisExtent,
  firstUnsortedIndex,
  materializeSeries,
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
  SpanSeriesConfig,
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
      need it (ADR-0002). For the matrix the cell width, for the same reason in
      the same place. */
  step: number | null;
  /** Matrix only: the second cell edge. */
  cellHeight: number | null;
  /** Spans only: how many earlier registered spans each one overlaps. Computed
      quadratically and therefore once per materialisation - not per frame, as the
      drawing loop would do it. */
  depth: Int32Array | null;
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
  color: string;
  /** The series highlighted on hover. */
  seriesId: number;
}

/** A labelled limit, ready for the axis band. */
export interface LimitLabel {
  id: number;
  axisKey: string;
  px: number;
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
}

export interface HoverSnapshot {
  version: number;
  hover: HoverState | null;
  tooltip: TooltipConfig | null;
  /** The x value in the format of the hit x axis (the built-in tooltip uses
      it). */
  xLabel: string;
}

const EMPTY_LAYOUT_SNAPSHOT: LayoutSnapshot = {
  version: 0,
  layout: EMPTY_LAYOUT,
  legend: null,
  series: [],
  limits: [],
};

const EMPTY_HOVER_SNAPSHOT: HoverSnapshot = {
  version: 0,
  hover: null,
  tooltip: null,
  xLabel: "",
};

/** Tolerance within which hits of different series are grouped (R-4.7). */
const GROUP_TOLERANCE = 4;
/** From this number of points on, markers="auto" draws no more markers (R-4.5). */
const MARKER_LIMIT = 60;

let nextRegistration = 0;

/* Replacement values for the degenerate case; as constants, so that the drawing
   path allocates nothing. */
const EMPTY_CHANNEL = new Float64Array(0);
const EMPTY_DEPTH = new Int32Array(0);

function fnEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "function" || typeof b !== "function") return false;
  return String(a) === String(b);
}

function listEqual(a: readonly number[] | undefined, b: readonly number[] | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Everything materialisation reads: the y accessor, the data reference, the
    baseline and the series kind - the kind, because it decides about the baseline
    and the step. If any of that changes, the channels are stale and have to come
    into being anew; a field comparison alone is not enough here. */
function materialEqual(previous: SeriesConfig, next: SeriesConfig): boolean {
  return (
    previous.kind === next.kind &&
    fnEqual(previous.accessor, next.accessor) &&
    previous.data === next.data &&
    fnEqual(baselineOf(previous), baselineOf(next)) &&
    fnEqual(valueChannelOf(previous), valueChannelOf(next)) &&
    fnEqual(xEndOf(previous), xEndOf(next))
  );
}

/** The value channel, where the kind has one (ADR-0011). */
function valueChannelOf(config: SeriesConfig): Accessor<unknown> | undefined {
  return config.kind === "matrix" ? config.value : undefined;
}

/** The second x channel, where the kind has one (ADR-0011). */
function xEndOf(config: SeriesConfig): Accessor<unknown> | undefined {
  return config.kind === "span" ? config.to : undefined;
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
    case "span":
      // None of the three has a foot: a state is not a height, a cell not a
      // column, a span an interval on x.
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
        listEqual(a.dash as number[] | undefined, next.dash as number[] | undefined)
      );
    }
    case "area": {
      const a = previous as AreaSeriesConfig;
      return (
        fnEqual(a.baseline, next.baseline) &&
        a.fillOpacity === next.fillOpacity &&
        a.strokeWidth === next.strokeWidth
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
    case "span": {
      const a = previous as SpanSeriesConfig;
      return a.height === next.height;
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
  if (coloring.kind === "assessment") {
    for (let i = 0; i < n; i++) {
      const b = assess(w[i] as number, coloring.limits);
      // Four outcomes, four answers. Folding "unknown" onto the same bucket as
      // "ok" would be exactly the defect the limit model is written against: a
      // value nobody has would look like a good one.
      buckets[i] =
        b.verdict === "alarm"
          ? 2
          : b.verdict === "warning"
            ? 1
            : b.verdict === "ok"
              ? 0
              : -1; // unknown: a hole, and a hole carries no colour
    }
    return buckets;
  }
  let min = coloring.range?.[0];
  let max = coloring.range?.[1];
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
  const span = max - min;
  for (let i = 0; i < n; i++) {
    const v = w[i] as number;
    if (!Number.isFinite(v)) {
      buckets[i] = -1;
      continue;
    }
    // Degenerate span: everything into the middle, instead of dividing by zero.
    const share = span > 0 ? (v - min) / span : 0.5;
    const k = Math.floor(share * count);
    buckets[i] = k < 0 ? 0 : k >= count ? count - 1 : k;
  }
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

  /* ---------- Layout and interaction ---------- */
  private layout: LayoutResult = EMPTY_LAYOUT;
  private readonly hysteresis = new Map<string, number>();
  private hover: HoverState | null = null;
  private hoverKey = "";
  private hoverXLabel = "";
  private highlight: number | null = null;

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
      slot: this.slotFor(config.name),
      lastSlot: null,
      materialized: null,
      extent: null,
      step: null,
      cellHeight: null,
      depth: null,
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
      previous.color === config.color &&
      previous.tone === config.tone &&
      ownFieldsEqual(previous, config);
    if (previous.name !== config.name && config.name !== undefined) {
      // A rename takes its colour with it - unless the new name already has a
      // free place; then the name wins.
      const known = this.slotsByName.get(config.name);
      if (known === undefined) this.slotsByName.set(config.name, entry.slot);
      else if (!this.slotTaken(known, entry)) entry.slot = known;
    }
    entry.config = config;
    if (equal) return; // R-2.2: no dirty flag without a change of substance
    if (!dataEqual) {
      entry.materialized = null;
      entry.extent = null;
      entry.step = null;
      entry.cellHeight = null;
      entry.depth = null;
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
      fnEqual(previous.accessor, config.accessor) && previous.calendar === config.calendar;
    const equal =
      accessorEqual &&
      previous.id === config.id &&
      previous.orientation === config.orientation &&
      previous.position === config.position &&
      previous.label === config.label &&
      previous.tickCount === config.tickCount &&
      previous.grid === config.grid &&
      listEqual(previous.ticks as number[] | undefined, config.ticks as number[] | undefined) &&
      domainEqual(previous.domain, config.domain) &&
      fnEqual(previous.tickFormat, config.tickFormat);
    entry.config = config;
    if (equal) return;
    if (!accessorEqual || previous.id !== config.id) {
      for (const entries of this.series.values()) {
        entries.materialized = null;
        entries.extent = null;
        entries.step = null;
        entries.cellHeight = null;
        entries.depth = null;
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
    this.sortednessChecked = false; // R-2.6: once per change of data
    for (const entry of this.series.values()) {
      entry.materialized = null;
      entry.extent = null;
      entry.step = null;
      entry.cellHeight = null;
      entry.depth = null;
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
          "there is no tick alignment between axes in V0 (R-4.15).",
      );
    }
  }

  /* ================= Materialisation (R-2.6, R-2.7) ================= */

  private sortednessChecked = false;

  private findXAxis(xAxisId: string): AxisConfig | null {
    for (const { config } of this.axes.values()) {
      if (config.orientation === "x" && config.id === xAxisId) return config;
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
      const xAxis = this.findXAxis(config.xAxisId);
      if (xAxis === null) continue; // validate() reports this in DEV
      const material = materializeSeries(
        data,
        xAxis.accessor,
        config.accessor,
        baselineOf(config),
        {
          value: valueChannelOf(config),
          xEnd: xEndOf(config),
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
        entry.step = null;
        entry.extent = {
          ...material.extent,
          yMin: Number.POSITIVE_INFINITY,
          yMax: Number.NEGATIVE_INFINITY,
        };
      } else if (config.kind === "span") {
        entry.depth = overlapDepth(
          material.series.x,
          material.series.x1 ?? new Float64Array(material.series.length),
          material.series.length,
          // The end of the domain is not yet fixed at materialisation time. The
          // covering of an open span reaches to the end of everything there is -
          // and that is exactly the value it gets here.
          material.extent.xMax,
        );
        // Half the span height upwards and downwards, so that the topmost and the
        // bottommost lane are not cut into.
        const half = (config.height ?? 0.6) / 2;
        entry.step = null;
        entry.extent = {
          ...material.extent,
          yMin: material.extent.yMin - half,
          yMax: material.extent.yMax + half,
        };
      } else {
        entry.step = null;
        entry.extent = material.extent;
      }

      if (!this.sortednessChecked && DEV) {
        this.sortednessChecked = true;
        const index = firstUnsortedIndex(material.series.x, material.series.length);
        if (index >= 0) {
          warnOnce(
            "x-unsorted",
            `X values are not sorted ascending (index ${index}). ` +
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
      this.measurer?.clear();
      this.markLayoutDirty();
    });
    this.theme = null;
    this.markLayoutDirty();
  }

  bindTooltip(el: HTMLElement | null): void {
    this.tooltipEl = el;
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
    this.measurer?.remove();
    this.measurer = null;
    this.container = null;
    this.themeRoot = null;
    this.seriesCanvas = null;
    this.overlayCanvas = null;
    this.seriesCtx = null;
    this.overlayCtx = null;
    this.tooltipEl = null;
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
    if (cssWidth === this.cssWidth && cssHeight === this.cssHeight) return;
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
    const bindings = [...this.series.values()].map((entry) => ({
      xAxisId: entry.config.xAxisId,
      yAxisId: entry.config.yAxisId,
      extent: entry.extent,
    }));
    return axisExtent(orientation, id, bindings, this.limitValues(orientation, id));
  }

  /** The values of the limits that are to pull this axis along. */
  private limitValues(orientation: AxisOrientation, id: string): number[] {
    const out: number[] = [];
    for (const { config } of this.limits.values()) {
      if (!config.inExtent) continue;
      if (config.orientation !== orientation || config.axisId !== id) continue;
      if (config.kind === "line") out.push(config.value);
      else out.push(config.from, config.to);
    }
    return out;
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
        calendar: c.calendar,
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

  private colorFor(entry: SeriesEntry, index: number): string {
    if (entry.config.color !== undefined) return entry.config.color;
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
    return palette[this.paletteSlot(entry, index) % Math.max(1, palette.length)] ?? FALLBACK_THEME.series[0] ?? "#2563eb";
  }

  /** Named: the place of the name. Nameless: the index in the registration, as
      before - and a warning as soon as that shifts underneath it. */
  private paletteSlot(entry: SeriesEntry, index: number): number {
    if (entry.config.name !== undefined) return entry.slot;
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
    const seen = new Set<string>();
    this.seriesInOrder().forEach((entry, i) => {
      const config = entry.config;
      if (config.kind === "state") {
        // A state series does not explain itself but its colours. "Line 4" next to
        // a grey box says nothing; the reader wants to know what orange means.
        config.states.forEach((z, k) => {
          const key = `${z.label} ${z.color}`;
          if (seen.has(key)) return;
          seen.add(key);
          out.push({
            id: `${entry.order}:${k}`,
            name: z.label,
            color: z.color,
            seriesId: entry.order,
          });
        });
        return;
      }
      out.push({
        id: String(entry.order),
        name: this.nameFor(entry, i),
        color: this.colorFor(entry, i),
        seriesId: entry.order,
      });
    });
    return out;
  }

  /* ---------- Limits, ready in pixels ---------- */

  private limitColor(config: LimitConfig, theme: ResolvedTheme): string {
    if (config.color !== undefined) return config.color;
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
      const axis = this.findAxis(config.orientation, config.axisId);
      if (axis === null) continue;
      const color = this.limitColor(config, theme);
      const dash = this.limitDash(config);
      if (config.kind === "band") {
        out.push({
          orientation: config.orientation,
          fromPx: axis.scale.toPx(config.from),
          toPx: axis.scale.toPx(config.to),
          color,
          band: true,
          dash,
        });
      } else {
        const px = axis.scale.toPx(config.value);
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
      const axis = this.findAxis(config.orientation, config.axisId);
      if (axis === null) continue;
      const value = config.kind === "line" ? config.value : (config.from + config.to) / 2;
      out.push({
        id: order,
        axisKey: axis.key,
        px: axis.scale.toPx(value),
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
    const series = this.seriesInOrder();
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
    series.forEach((entry, i) => {
      const mat = entry.materialized;
      if (mat === null) return;
      const xAxis = this.findAxis("x", entry.config.xAxisId);
      const yAxis = this.findAxis("y", entry.config.yAxisId);
      if (xAxis === null || yAxis === null) return;
      const dimmed = this.highlight !== null && this.highlight !== entry.order;
      const base: DrawBase = {
        x: mat.x,
        y: mat.y,
        length: mat.length,
        xScale: xAxis.scale,
        yScale: yAxis.scale,
        color: this.colorFor(entry, i),
        alpha: dimmed ? 0.25 : 1,
      };
      const config = entry.config;
      switch (config.kind) {
        case "line":
          items.push({
            ...base,
            kind: "line",
            strokeWidth: config.strokeWidth,
            dash: config.dash,
            marker:
              config.markers === "always" ||
              (config.markers === "auto" && mat.length <= MARKER_LIMIT),
          });
          break;
        case "area":
          items.push({
            ...base,
            kind: "area",
            y0: mat.y0,
            baseline: 0,
            fillOpacity: config.fillOpacity,
            strokeWidth: config.strokeWidth,
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
            colors: config.states.map((z) => z.color),
            laneTop: lane.top,
            laneBottom: lane.bottom,
            domainEnd: xAxis.scale.domain[1],
          });
          break;
        }
        case "matrix": {
          const colors = matrixColors(config.coloring, this.theme ?? FALLBACK_THEME);
          items.push({
            ...base,
            kind: "matrix",
            buckets: matrixBuckets(mat, config.coloring, colors.length),
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
        case "span": {
          items.push({
            ...base,
            kind: "span",
            x1: mat.x1 ?? EMPTY_CHANNEL,
            // Computed once per materialisation, not per frame: the calculation
            // is quadratic, and a schedule with five hundred spans is pushed and
            // pulled like any other chart.
            depth: entry.depth ?? EMPTY_DEPTH,
            height: config.height ?? 0.6,
            domainEnd: xAxis.scale.domain[1],
          });
          break;
        }
      }
    });
    return items;
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
    });
    this.positionTooltip();
  }

  /* ================= Interaction (4.4) ================= */

  setHighlight(id: number | null): void {
    if (this.highlight === id) return;
    this.highlight = id;
    // Not a mousemove path: a redraw of the series layer is allowed here (R-4.11).
    this.markSeriesDirty();
  }

  private inPlot(x: number, y: number): boolean {
    const p: Rect = this.layout.plot;
    return x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height;
  }

  pointerMove(x: number, y: number): void {
    if (this.tooltip === null) return;
    if (!this.inPlot(x, y)) {
      this.pointerLeave();
      return;
    }
    const hit = this.hitTest(x, y);
    if (hit === null) {
      this.pointerLeave();
      return;
    }
    const key = hit.key;
    this.hover = hit.state;
    this.hover.mouseX = x;
    this.hover.mouseY = y;
    this.markOverlayDirty(); // R-2.11: a hover never touches the series layer
    if (key !== this.hoverKey) {
      this.hoverKey = key;
      this.hoverXLabel = hit.xLabel;
      this.pushHoverSnapshot();
    }
  }

  pointerLeave(): void {
    if (this.hover === null && this.hoverKey === "") return;
    this.hover = null;
    this.hoverKey = "";
    this.markOverlayDirty();
    this.pushHoverSnapshot();
  }

  private hitTest(
    mouseX: number,
    mouseY: number,
  ): { key: string; state: HoverState; xLabel: string } | null {
    const mode = this.tooltip?.mode ?? "x";
    interface Candidate {
      entry: SeriesEntry;
      index: number;
      color: string;
      name: string;
      px: number;
      py: number;
      xValue: number;
      yValue: number;
      /** Does this hit get a hover marker? Not on a band, a cell or a span: there
          the mark is the area itself, and a point on it points at nothing. */
      marked: boolean;
      /** Does this mark cover an area instead of sitting on a point? A band, a
          span and a cell lie under the pointer where they cover it - their px is
          the beginning of the section and not the place being pointed at. */
      areal: boolean;
      value?: number;
      segment?: { from: number; to: number; label: string; open: boolean };
    }
    const candidates: Candidate[] = [];
    this.seriesInOrder().forEach((entry, i) => {
      const mat = entry.materialized;
      if (mat === null || mat.length === 0) return;
      const config = entry.config;
      const xAxis = this.findAxis("x", config.xAxisId);
      const yAxis = this.findAxis("y", config.yAxisId);
      if (xAxis === null || yAxis === null) return;
      // Mouse position in the axis space of this series (R-4.6).
      const targetX = xAxis.scale.fromPx(mouseX);
      const targetY = yAxis.scale.fromPx(mouseY);
      const hit = this.hitIn(entry, mat, xAxis, yAxis, mouseY, targetX, targetY);
      if (hit === null) return;
      candidates.push({
        entry,
        index: hit.index,
        color: hit.color ?? this.colorFor(entry, i),
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
      for (const k of candidates) {
        // An area covering the pointer is nearer than any point beside it - it is
        // exactly where the pointing happens.
        const dx = k.areal ? 0 : k.px - mouseX;
        const dy = k.areal ? 0 : k.py - mouseY;
        const d = dx * dx + dy * dy; // Euclidean comparison in pixel space
        if (d < best) {
          best = d;
          primary = k;
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
      yValue: k.yValue,
      datum: (k.entry.config.data ?? this.data)[k.index],
      index: k.index,
      value: k.value,
      segment: k.segment,
    }));
    const hit: TooltipHit = {
      xValue: primary.xValue,
      points,
      xPx: primary.px,
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
    const xAxis = this.findAxis("x", primary.entry.config.xAxisId);
    const xLabel = xAxis === null ? String(primary.xValue) : xAxis.format(primary.xValue);
    return { key, state, xLabel };
  }

  /** The hit of one series - one different question per kind.

      Every mark that is a point asks "which point lies nearest". A band, a cell
      and a span ask "what lies under the pointer", and that is not the same
      question: for the right half of every segment the nearest point gives the
      wrong answer. */
  private hitIn(
    entry: SeriesEntry,
    mat: MaterializedSeries,
    xAxis: AxisLayout,
    yAxis: AxisLayout,
    mouseY: number,
    targetX: number,
    targetY: number,
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
    segment?: { from: number; to: number; label: string; open: boolean };
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
      const to = segmentEnd(mat.x, n, index, xAxis.scale.domain[1]);
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
        segment: { from, to, label: state?.label ?? "", open: false },
      };
    }

    if (config.kind === "span") {
      const ends = mat.x1;
      if (ends === null) return null;
      const domainEnd = xAxis.scale.domain[1];
      const height = config.height ?? 0.6;
      // The rule under covering - the one registered last wins - stands in the
      // pure module and is not written a second time here.
      const index = spanIndex(
        mat.x,
        ends,
        mat.y,
        n,
        targetX,
        targetY,
        height,
        domainEnd,
      );
      if (index < 0) return null;
      const from = mat.x[index] as number;
      const lane = mat.y[index] as number;
      const rawEnd = ends[index] as number;
      return {
        index,
        px: xAxis.scale.toPx(from),
        py: yAxis.scale.toPx(lane),
        xValue: from,
        yValue: lane,
        marked: false,
        areal: true,
        segment: {
          from,
          to: spanEnd(rawEnd, domainEnd),
          label: "",
          open: isOpen(rawEnd),
        },
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
      return {
        index,
        px: xAxis.scale.toPx(xValue),
        py: yAxis.scale.toPx(yValue),
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

    const index = nearestIndex(mat.x, n, targetX);
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

  private pushLayoutSnapshot(): void {
    this.layoutSnapshot = {
      version: this.layoutSnapshot.version + 1,
      layout: this.layout,
      legend: this.legend,
      series: this.legendItems(),
      limits: this.limitLabels(),
    };
    for (const notify of this.layoutSubscribers) notify();
  }

  private pushHoverSnapshot(): void {
    this.hoverSnapshot = {
      version: this.hoverSnapshot.version + 1,
      hover: this.hover,
      tooltip: this.tooltip,
      xLabel: this.hoverXLabel,
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
