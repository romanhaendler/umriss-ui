/* ChartScene - the heart of the library.

   Responsible for:
   - The registration model: series, axes, legend and tooltip register and
     deregister themselves with a configuration; registration order is drawing
     order, palette assignment and band stacking.
   - Materialisation: accessors run exactly once per change of data or
     accessor, into Float64Arrays; gaps as NaN; a DEV sortedness check
     once per change of data.
   - Canvas setup, resize, scheduling.
   - Layout (section 3) and drawing (draw.ts).
   - Hit testing, crosshair and tooltip positioning (4.4).

   On change detection: React creates new config objects and new inline accessors
   on every render. If every new object identity counted as a change, everything
   would be re-materialised on every parent render (unacceptable at a million
   points). That is why updateSeries/updateAxis compare field by field; accessors
   count as equal when their source text is equal - a native or bound function,
   whose text is "[native code]", by identity. Known limit, not solved: an
   accessor that reads a changed closure variable without its source text or its
   data reference changing is not re-materialised - in that case the app must
   pass a new data reference. The same holds for `tickFormat` and the tooltip's
   `render`. A `value` given as a field name has none of it: it comes to one
   reader per name and is compared by that name (value.ts, ADR-0048). */

import { type ResolvedTheme } from "./theme";
import { TextMeasurer } from "./measure";
import { EMPTY_LAYOUT, type AxisLayout, type LayoutResult } from "./layout";
import { type LimitDrawItem, type SeriesDrawItem } from "./draw";
import { DEFAULT_CHARTS_WORDING, type ChartsWording } from "./wording";
import { type Cell } from "./walk";
import { marksFor, stateHatches, type Hatch, type SeriesMarks } from "./marks";
import { formatValue } from "./format";
import { showOnly, type AxisSpans, type ChartView } from "./view";
import { type BarPlacement } from "./bars";
import type {
  AxisConfig,
  LimitConfig,
  StateEntry,
  StateSeriesConfig,
  AxisOrientation,
  ChartPerf,
  ChartRange,
  HoverState,
  LegendConfig,
  Padding,
  SeriesConfig,
  TooltipConfig,
  TooltipHit,
  TooltipPoint,
} from "./types";
import {
  type SeriesEntry,
  type AxisEntry,
  type Categories,
  type LimitEntry,
  type LegendItem,
  type LimitLabel,
  type LayoutSnapshot,
  type DataTableGroup,
  type TooltipRow,
  type LimitText,
  type StackTotal,
  type HoverSnapshot,
  EMPTY_LAYOUT_SNAPSHOT,
  EMPTY_HOVER_SNAPSHOT,
  type SyncedX,
} from "./sceneModel";
import { forget, fnEqual, takesPalette } from "./sceneConfig";
import { dataTableGroups } from "./sceneTable";
import { walkable, emphasised, focus, click, blur, key, keyed } from "./sceneKeys";
import {
  applyView,
  toggleNames,
  showOnlyNames,
  hideSome,
  seriesNames,
  setHidden,
  viewMoved,
  viewToReport,
  isHidden,
  hasZoom,
  zoomAt,
  panBy,
  wheel,
  pointerDown,
  drag,
  pointerUp,
  resetZoom,
} from "./sceneView";
import { paletteSlot, nameFor, legendItems, limitItems, limitLabels } from "./sceneColors";
import { drawItems, placements, lanePx } from "./sceneDraw";
import { pointerMove, showAt, pointerLeave, clearActive } from "./sceneHit";
import { boxParts, positionTooltip } from "./sceneTooltip";
import { validate } from "./sceneChecks";
import { limitAt, mapFor, gapFor, findAxis, axisExtentOf } from "./sceneLayout";
import {
  bind,
  bindTooltip,
  bindA11y,
  setWording,
  unbind,
  rebindDprWatch,
  requestResize,
  markSeriesDirty,
  markOverlayDirty,
  markLayoutDirty,
} from "./sceneBinding";
import { newSyncState, setSyncId, setLoading, share, syncedPx } from "./sceneSync";
import { pushLayoutSnapshot, pushHoverSnapshot } from "./sceneSnapshots";
import { registerSeries, updateSeries, registerAxis, updateAxis, registerLimit, updateLimit } from "./sceneRegistry";


























export { fnEqual } from "./sceneConfig";
export type {
  DataTableGroup,
  HoverSnapshot,
  LayoutSnapshot,
  LegendItem,
  LegendMark,
  LimitLabel,
  LimitText,
  StackTotal,
  TooltipRow,
} from "./sceneModel";

export class ChartScene {
  /* ---------- Registration ----------
      @internal */
  series = new Map<number, SeriesEntry>();
  /** @internal */
  axes = new Map<number, AxisEntry>();
  /** @internal */
  legend: LegendConfig | null = null;
  /** @internal */
  tooltip: TooltipConfig | null = null;
  /** @internal */
  dataTable: { id: string; open: boolean } | null = null;
  /** `Chart encoding` (charts-alternatives C3). */
  private encoding: "color" | "marks" = "color";
  /** @internal */
  limits = new Map<number, LimitEntry>();

  /* ---------- Data and layout inputs ----------
      @internal */
  data: readonly unknown[] = [];
  /** The categories of each axis that has them, by orientation and axis id
      (`x:x`); an axis absent is numeric (ADR-0052).
      @internal */
  readonly categories = new Map<string, Categories>();
  /** The x axes whose rows bring a `Date`: they stand in time without `time`
      being said (ADR-0052).
      @internal */
  readonly dated = new Set<string>();
  /** @internal */
  padding: Padding = { top: 8, right: 8, bottom: 8, left: 8 };

  /* ---------- DOM binding ----------
      @internal */
  container: HTMLElement | null = null;
  /** @internal */
  seriesCanvas: HTMLCanvasElement | null = null;
  /** @internal */
  overlayCanvas: HTMLCanvasElement | null = null;
  /** @internal */
  seriesCtx: CanvasRenderingContext2D | null = null;
  /** @internal */
  overlayCtx: CanvasRenderingContext2D | null = null;
  /** @internal */
  tooltipEl: HTMLElement | null = null;
  /** The readout (polite live region) and the summary the plot is described by.
      @internal */
  readoutEl: HTMLElement | null = null;
  /** @internal */
  summaryEl: HTMLElement | null = null;
  /** @internal */
  readoutTimer: ReturnType<typeof setTimeout> | null = null;
  /** @internal */
  summaryTimer: ReturnType<typeof setTimeout> | null = null;
  /** @internal */
  wording: ChartsWording = DEFAULT_CHARTS_WORDING;
  /** @internal */
  measurer: TextMeasurer | null = null;

  /* ---------- Size and DPR ----------
      @internal */
  cssWidth = 0;
  /** @internal */
  cssHeight = 0;
  /** @internal */
  pendingWidth: number | null = null;
  /** @internal */
  pendingHeight: number | null = null;
  /** @internal */
  dpr = 1;
  /** @internal */
  dprMedia: MediaQueryList | null = null;
  /** @internal */
  readonly onDprChange = (): void => {
    rebindDprWatch(this);
    this.pendingWidth = this.cssWidth;
    this.pendingHeight = this.cssHeight;
    markLayoutDirty(this);
  };

  /* ---------- Scheduling ----------
      @internal */
  seriesDirty = false;
  /** @internal */
  overlayDirty = false;
  /** @internal */
  layoutDirty = true;
  /** @internal */
  materialsDirty = false;
  /** @internal */
  frameHandle: number | null = null;

  /* ---------- Theme ----------
      @internal */
  theme: ResolvedTheme | null = null;
  /** @internal */
  unsubscribeTheme: (() => void) | null = null;
  /** A caller's colours - `color`, a state's, a gradient stop - resolved
      through the theme's probe, once per colour and theme: a canvas ignores a
      `var(--…)` or a `light-dark(…)` and keeps the previous fillStyle.
      @internal */
  readonly painted = new Map<string, string>();

  /* ---------- Layout and interaction ----------
      @internal */
  layout: LayoutResult = EMPTY_LAYOUT;
  /** @internal */
  readonly hysteresis = new Map<string, number>();
  /** @internal */
  hover: HoverState | null = null;
  /** @internal */
  hoverKey = "";
  /** @internal */
  hoverXLabel = "";
  /** @internal */
  hoverRows: readonly TooltipRow[] = [];
  /** @internal */
  hoverTotals: readonly StackTotal[] = [];
  /** The labelled limits of the hit's y axis, where the tooltip asks for them.
      @internal */
  hoverLimits: readonly LimitText[] = [];
  /** The orders of the series in the current hit, beside its rows.
      @internal */
  hoverOrders: readonly number[] = [];
  /** @internal */
  highlight: readonly number[] | null = null;
  /** Who set the Active point (ADR-0030): the pointer and the keyboard move
      the same one, the last input winning.
      @internal */
  activeBy: "pointer" | "keyboard" | null = null;
  /** Where the keyboard stands, in x of the emphasised series' axis; a
      matrix' cell.
      @internal */
  keyX: number | null = null;
  /** @internal */
  keyCell: Cell | null = null;
  /** The series ↑/↓ chose (its order), read first; null: the first walked.
      @internal */
  emphasis: number | null = null;
  /** The highlight is the keyboard's, and goes with its Active point.
      @internal */
  keyHighlight = false;

  /* ---------- Snapshots for the HTML layer ----------
      @internal */
  layoutSnapshot: LayoutSnapshot = EMPTY_LAYOUT_SNAPSHOT;
  /** @internal */
  hoverSnapshot: HoverSnapshot = EMPTY_HOVER_SNAPSHOT;
  /** @internal */
  readonly layoutSubscribers = new Set<() => void>();
  /** @internal */
  readonly hoverSubscribers = new Set<() => void>();

  /* ---------- Instrumentation ----------
      @internal */
  perf: ChartPerf = { materializeMs: 0, seriesDrawMs: 0, points: 0 };
  /* The palette follows the name. The table only grows: a name
     that goes away keeps its place, so that it finds it again on its return and
     no other name gets it in the meantime.
      @internal */
  readonly slotsByName = new Map<string, number>();
  /** @internal */
  nextSlot = 0;

  /** @internal */
  onPerf: ((perf: ChartPerf) => void) | null = null;

  setOnPerf(callback: ((perf: ChartPerf) => void) | null): void {
    this.onPerf = callback;
  }

  /* ================= Registration model (R-2.1, R-2.2) ================= */

  registerSeries(config: SeriesConfig): number {
    return registerSeries(this, config);
  }

  updateSeries(id: number, config: SeriesConfig): void {
    updateSeries(this, id, config);
  }

  unregisterSeries(id: number): void {
    if (this.series.delete(id)) {
      this.materialsDirty = true;
      markLayoutDirty(this);
    }
  }

  registerAxis(config: AxisConfig): number {
    return registerAxis(this, config);
  }

  updateAxis(id: number, config: AxisConfig): void {
    updateAxis(this, id, config);
  }

  unregisterAxis(id: number): void {
    if (this.axes.delete(id)) {
      this.materialsDirty = true;
      markLayoutDirty(this);
    }
  }

  /* Limits register themselves like series - that is the only way a child says
     anything in this library. They are therefore not series: no accessor, no
     data, no legend entry, no hit. */

  registerLimit(config: LimitConfig): number {
    return registerLimit(this, config);
  }

  updateLimit(id: number, config: LimitConfig): void {
    updateLimit(this, id, config);
  }

  unregisterLimit(id: number): void {
    if (this.limits.delete(id)) markLayoutDirty(this);
  }

  limitsInOrder(): readonly LimitEntry[] {
    return [...this.limits.values()].sort((a, b) => a.order - b.order);
  }

  registerLegend(config: LegendConfig): void {
    this.legend = config;
    markLayoutDirty(this);
  }

  updateLegend(config: LegendConfig): void {
    if (this.legend !== null && this.legend.placement === config.placement) return;
    this.legend = config;
    markLayoutDirty(this);
  }

  unregisterLegend(): void {
    this.legend = null;
    markLayoutDirty(this);
  }

  registerTooltip(config: TooltipConfig): void {
    this.tooltip = config;
    pushHoverSnapshot(this);
  }

  updateTooltip(config: TooltipConfig): void {
    const previous = this.tooltip;
    if (previous !== null && previous.mode === config.mode && previous.limits === config.limits && fnEqual(previous.render, config.render)) {
      this.tooltip = config;
      return;
    }
    this.tooltip = config;
    pushHoverSnapshot(this);
  }

  unregisterTooltip(): void {
    this.tooltip = null;
    this.hover = null;
    this.hoverKey = "";
    markOverlayDirty(this);
    pushHoverSnapshot(this);
  }

  /* The data table (charts-alternatives 01) registers like the legend: one per
     chart. Whether it is open is the scene's, because two elements show it -
     the key in the legend and the panel. Opening it changes no pixel of the
     plot, so it only pushes the snapshot. */

  registerDataTable(id: string): void {
    this.dataTable = { id, open: false };
    pushLayoutSnapshot(this);
  }

  unregisterDataTable(): void {
    this.dataTable = null;
    pushLayoutSnapshot(this);
  }

  toggleDataTable(): void {
    if (this.dataTable === null) return;
    this.dataTable = { ...this.dataTable, open: !this.dataTable.open };
    pushLayoutSnapshot(this);
  }

  setEncoding(encoding: "color" | "marks"): void {
    if (encoding === this.encoding) return;
    this.encoding = encoding;
    markLayoutDirty(this);
  }

  /** Is every series drawn with its marks as well as its colour? Under forced
      colours always: every series is drawn in the one text colour then (C4).
      @internal */
  marked(): boolean {
    return this.encoding === "marks" || this.theme?.forced === true;
  }

  /** A series' marks by its palette place - the same place its colour comes
      from; null without encoding by marks, and for the kinds that take no
      place (a band and a cell are hatched by state and by step instead).
      @internal */
  marksOf(entry: SeriesEntry): SeriesMarks | null {
    return this.marked() && takesPalette(entry.config) ? marksFor(paletteSlot(this, entry)) : null;
  }

  /** Each state's hatch by its name, across every band of the chart - so the
      legend and each band agree (charts-alternatives 04).
      @internal */
  stateHatches(): Map<string, Hatch> {
    const bands: (readonly StateEntry[])[] = [];
    for (const { config } of this.seriesInOrder()) if (config.kind === "state") bands.push(config.states);
    return stateHatches(bands);
  }

  /** The words the HTML layer writes - the data table's key among them. */
  getWording(): ChartsWording {
    return this.wording;
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
    for (const entry of this.series.values()) forget(entry);
    markLayoutDirty(this);
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
    markLayoutDirty(this);
  }

  /* ================= Checks (R-4.12, R-4.13) ================= */

  /** Called from the Chart after the child effects; DEV only. */
  validate(): void {
    validate(this);
  }

  /* ================= Materialisation (R-2.6, R-2.7) ================= */

  /** A limit's axis: the one it names, or the first of its orientation.
      @internal */
  limitAxisId(config: LimitConfig): string {
    if (config.axisId !== undefined) return config.axisId;
    for (const { config: axis } of this.axes.values()) {
      if (axis.orientation === config.orientation) return axis.id;
    }
    return config.orientation;
  }

  /** @internal */
  findAxisConfig(orientation: AxisOrientation, id: string): AxisConfig | null {
    for (const { config } of this.axes.values()) {
      if (config.orientation === orientation && config.id === id) return config;
    }
    return null;
  }

  /** @internal */
  categoriesAt(orientation: AxisOrientation, id: string): Categories | undefined {
    return this.categories.get(`${orientation}:${id}`);
  }

  /* ================= DOM binding, DPR, resize ================= */

  bind(container: HTMLElement, seriesCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement, themeRoot: HTMLElement): void {
    bind(this, container, seriesCanvas, overlayCanvas, themeRoot);
  }

  /** @internal */
  readonly onFontsLoaded = (): void => {
    this.measurer?.clear();
    this.hysteresis.clear();
    markLayoutDirty(this);
  };

  bindTooltip(el: HTMLElement | null): void {
    bindTooltip(this, el);
  }

  bindA11y(readout: HTMLElement | null, summary: HTMLElement | null): void {
    bindA11y(this, readout, summary);
  }

  setWording(wording: ChartsWording): void {
    setWording(this, wording);
  }

  /** @internal */
  themeRoot: HTMLElement | null = null;

  unbind(): void {
    unbind(this);
  }

  /** Called by the ResizeObserver; coalesced onto one rAF. */
  requestResize(cssWidth: number, cssHeight: number): void {
    requestResize(this, cssWidth, cssHeight);
  }

  /* ================= Scheduling ================= */

  markSeriesDirty(): void {
    markSeriesDirty(this);
  }

  markOverlayDirty(): void {
    markOverlayDirty(this);
  }

  /** A layout-relevant change: it pulls the series and the overlay layer with
      it. */
  markLayoutDirty(): void {
    markLayoutDirty(this);
  }

  /* ================= Layout ================= */

  /** Extent of an axis out of the series bound to it.

      Materialises on demand and manages without the DOM - that is the seam at
      which extents across series kinds can be tested without asking a canvas.
      The layout path calls extentFor directly. */
  axisExtent(orientation: AxisOrientation, id: string): readonly [number, number] {
    return axisExtentOf(this, orientation, id);
  }

  /** @internal */
  limitAt(config: LimitConfig, value: number): number {
    return limitAt(this, config, value);
  }

  /** @internal */
  mapFor(axis: AxisConfig): ((v: number) => number) | undefined {
    return mapFor(this, axis);
  }

  /** @internal */
  gapFor(axis: AxisConfig): ((v: number) => boolean) | undefined {
    return gapFor(this, axis);
  }

  /** @internal */
  findAxis(orientation: "x" | "y", id: string): AxisLayout | null {
    return findAxis(this, orientation, id);
  }

  /* ================= Series colours and legend entries ================= */

  /** @internal */
  nameFor(entry: SeriesEntry, index: number): string {
    return nameFor(this, entry, index);
  }

  legendItems(): LegendItem[] {
    return legendItems(this);
  }

  /* ---------- Limits, ready in pixels ---------- */

  private limitItems(band: boolean): LimitDrawItem[] {
    return limitItems(this, band);
  }

  /** Labelled limits for the HTML layer: position and colour, ready. */
  limitLabels(): readonly LimitLabel[] {
    return limitLabels(this);
  }

  /* ================= Drawing ================= */

  private drawItems(): SeriesDrawItem[] {
    return drawItems(this);
  }

  /** @internal */
  placements(): Map<number, BarPlacement> {
    return placements(this);
  }

  /** @internal */
  lanePx(config: StateSeriesConfig, yAxis: AxisLayout): { top: number; bottom: number } {
    return lanePx(this, config, yAxis);
  }

  /* ================= Interaction (4.4) ================= */

  setHighlight(ids: readonly number[] | null): void {
    if (this.highlight === ids) return;
    this.highlight = ids;
    // Not a mousemove path: a redraw of the series layer is allowed here.
    markSeriesDirty(this);
  }

  pointerMove(x: number, y: number): void {
    pointerMove(this, x, y);
  }

  /** @internal */
  showAt(x: number, y: number): boolean {
    return showAt(this, x, y);
  }

  /** The pointer went away. A point the keyboard set stays. */
  pointerLeave(): void {
    pointerLeave(this);
  }

  /** @internal */
  clearActive(): void {
    clearActive(this);
  }

  /* ---------- The keyboard's walk (ADR-0030) ----------

     The plot area is one tab stop; the keys move the Active point over the
     positions the pointer would hit (walk.ts), and a position becomes a hit by
     asking the hit test at its pixel - so the tooltip, the markers and the
     sync are the pointer's own. */

  /** @internal */
  walkable(): SeriesEntry[] {
    return walkable(this);
  }

  /** @internal */
  emphasised(): SeriesEntry | null {
    return emphasised(this);
  }

  /** The focus came in: the walk starts at the newest position, unless the
      pointer already stands somewhere. A pointer's focus - a click - does
      not start it. */
  focus(byKeyboard: boolean): void {
    focus(this, byKeyboard);
  }

  /** Who hears the Active point chosen: a click on a hit, Enter on the Active
      point. `useChart` sets it; the chart keeps no selection and draws none. */
  onSelect: ((hit: TooltipHit) => void) | null = null;
  /** Whether a tooltip is registered - the hits a selection is made of. */
  get hasTooltip(): boolean {
    return this.tooltip !== null;
  }
  /** Who hears the range the reader marked; `useChart` sets it. */
  onRange: ((range: ChartRange) => void) | null = null;
  /** The range being marked, in pixels, while the pointer is down: `live` once
      the press became a drag, and the band is drawn.
      @internal */
  range: { from: number; to: number; live: boolean; pointerId: number } | null = null;
  /** Where the press that may become a click began; a click after the pointer
      travelled is the end of a drag, and selects nothing.
      @internal */
  downAt: number | null = null;
  /** @internal */
  travelled = false;

  /** A click on the plot: reports the hit under the pointer, once. The second
      click of a double click does not (that one resets the zoom). */
  click(event: MouseEvent): void {
    click(this, event);
  }

  /** The focus left: a point the keyboard set goes with it. */
  blur(): void {
    blur(this);
  }

  /** A key on the plot area; true where the chart took it. */
  key(event: KeyboardEvent): boolean {
    return key(this, event);
  }

  /** Whether the plot is a tab stop: it has hits to walk or an axis to zoom. */
  keyed(): boolean {
    return keyed(this);
  }

  /* ---------- What is spoken ---------- */

  /** @internal */
  readonly percent = (v: number): string => this.wording.percent(formatValue(v, this.wording.locale));

  /* ---------- The data table (charts-alternatives 01) ---------- */

  /** What the data table lists: one table per x axis for the series on it, one
      per matrix - a matrix has two positions per value, and shares no rows.
      Only the visible domain, and above the limit its downsampled course
      (table.ts). Called by the open table, once per layout. */
  dataTableGroups(): DataTableGroup[] {
    return dataTableGroups(this);
  }

  /* ---------- Cursor sync (charts-long-series 04) ----------

     Only the x position travels, in domain units: each chart draws its own
     crosshair there, on its x axis of the same id - or its first -, and the
     tooltip stays with the chart under the pointer. Zoom is not shared; the
     caller gives every chart the same controlled domain. */

  /** @internal */
  readonly sync = newSyncState();
  /** @internal */
  loading = false;

  setSyncId(id: string | null): void {
    setSyncId(this, id);
  }

  setLoading(loading: boolean): void {
    setLoading(this, loading);
  }

  /** @internal */
  share(x: SyncedX | null): void {
    share(this, x);
  }

  /** @internal */
  syncedPx(): number | null {
    return syncedPx(this);
  }

  /* ---------- The view (ADR-0047) ----------

     How the reader is looking: which series are hidden and which span each
     zoomable x axis shows. The scene holds it and asks only here; `useChart`
     takes a start through `initialView`, goes to a view through `applyView` and reads it through `getView`. */

  /** Held, and drawn: the span each zoomable x axis shows, by id - also of
      an axis not declared at the moment, which gets its span back.
      @internal */
  heldSpans: AxisSpans;
  /** Held, and drawn: the hidden series, by name - also of a series not
      declared at the moment, which comes back hidden.
      @internal */
  heldHidden: readonly string[];
  /** Reported: what is held less the parts not declared at the moment, as
      `useChart` reads it - a new object only when its content changed.
      @internal */
  reportedView: ChartView;
  /** @internal */
  readonly viewListeners = new Set<() => void>();
  /** Whether the reader, a setter or `setView` has changed the view
      yet. Until then a change is the start losing what does not occur here -
      where the chart starts, not a change to report.
      @internal */
  actedOn = false;
  /** A zoom key was pressed on a chart without a tooltip: the next layout
      says the span it shows.
      @internal */
  sayView = false;
  get acted(): boolean {
    return this.actedOn;
  }

  constructor(initial: ChartView = {}) {
    this.heldSpans = { ...initial.domains };
    this.heldHidden = [...(initial.hidden ?? [])];
    this.reportedView = viewToReport(this);
  }

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  getView = (): ChartView => this.reportedView;

  /** Goes to a whole view (`setView`); what it leaves out goes back to its default -
      also the span or the hidden name of a part not declared at the moment,
      which the view reported does not show. */
  applyView(view: ChartView): void {
    applyView(this, view);
  }

  /** Puts a span in view on a zoomable x axis; `null` shows the axis' own
      `domain` again. */
  setDomain = (axisId: string, span: readonly [number, number] | null): void => {
    const next = { ...this.heldSpans };
    if (span === null) delete next[axisId];
    else next[axisId] = [span[0], span[1]];
    this.heldSpans = next;
    viewMoved(this);
  };

  /** Hides the series `name`, or shows it where it is hidden. */
  toggleSeries = (name: string): void => toggleNames(this, [name]);

  /** Hides the series `names` together, or shows them where every one is
      hidden - a state's legend entry speaks for every band that shows it. */
  toggleNames(names: readonly string[]): void {
    toggleNames(this, names);
  }

  /** Hides every series but `name`. */
  showOnly = (name: string): void => hideSome(this, showOnly([name], seriesNames(this)));

  /** The legend's gesture: shows only the series `names` - or all, where they
      were the only ones visible. `from` is the hidden series it judges by: a
      double click by those before its first click. */
  showOnlyNames(names: readonly string[], from: readonly string[] = this.heldHidden): void {
    showOnlyNames(this, names, from);
  }

  /** Shows every series again. */
  showAllSeries = (): void => setHidden(this, []);

  /** The hidden series held now, by name - what a double click comes back
      to. */
  hiddenNames = (): readonly string[] => this.heldHidden;

  /** @internal */
  seriesNames(): (string | undefined)[] {
    return seriesNames(this);
  }

  /** @internal */
  isHidden(config: SeriesConfig): boolean {
    return isHidden(this, config);
  }

  /* ---------- Zoom and pan (charts-long-series 01) ----------

     The schedule's model, not its code: Ctrl or ⌘ with the wheel zooms - a
     trackpad pinch arrives as exactly that -, a horizontal wheel or Shift pans,
     the plain wheel is the page's. A drag pans, two fingers pinch, a double
     click goes back to the axis' own domain. Each moves the span the view
     holds, only on an axis that is `zoomable`. */

  /** @internal */
  readonly pointers = new Map<number, number>();
  /** @internal */
  pinch = 0;

  /** @internal */
  hasZoom(): boolean {
    return hasZoom(this);
  }

  /** @internal */
  zoomAt(px: number, factor: number): void {
    zoomAt(this, px, factor);
  }

  /** @internal */
  panBy(dx: number): void {
    panBy(this, dx);
  }

  wheel(event: WheelEvent): void {
    wheel(this, event);
  }

  pointerDown(event: PointerEvent): void {
    pointerDown(this, event);
  }

  /** A drag pans, two fingers pinch. */
  drag(event: PointerEvent): void {
    drag(this, event);
  }

  pointerUp(event: PointerEvent): void {
    pointerUp(this, event);
  }

  /** Every zoomable axis back to its own domain: a double click, the key 0
      and 'Show all'. */
  resetZoom(): void {
    resetZoom(this);
  }

  /** An x value in the format of its x axis - the header's, or a point's own.
      @internal */
  xLabel(xAxisId: string, xValue: number, seconds = false): string {
    const xAxis = findAxis(this, "x", xAxisId);
    return xAxis === null ? String(xValue) : xAxis.format(xValue, seconds);
  }

  /** A box's readings top to bottom as drawn (B9): the five, then mean,
      notch, n and outliers - each only where the series has it. One list for
      the tooltip's rows and the table's columns; without numbers (a table
      row with no box) every value is empty, and so is one not given.
      @internal */
  boxParts(
    entry: SeriesEntry,
    v: (NonNullable<TooltipPoint["box"]> & { median: number }) | null,
  ): { label: string; value: string }[] {
    return boxParts(this, entry, v);
  }

  /** @internal */
  positionTooltip(): void {
    positionTooltip(this);
  }

  /* ================= Snapshots for the HTML layer ================= */

  /** @internal */
  pushHoverSnapshot(): void {
    pushHoverSnapshot(this);
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
}
