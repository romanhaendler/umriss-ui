/* The view (ADR-0047) and the zoom gestures: which series are hidden and which
   span each zoomable x axis shows, and the wheel, drag and pinch that move the
   span. The scene holds the state; these are functions over it. */

import { measureStep } from "./bars";
import { type AxisLayout } from "./layout";
import type { ChartScene } from "./scene";
import { stackOf } from "./sceneConfig";
import { say } from "./sceneSpeech";
import { calendarFrom, toWallClock } from "./workingTime";
import type { AxisConfig, ChartRange, MaterializedSeries, SeriesConfig } from "./types";
import {
  defaultLimits,
  hidesAll,
  onlyKnown,
  onlyVisible,
  showOnly,
  toggleHidden,
  viewKey,
  zoomSpan,
  type ChartView,
  type ZoomLimits,
} from "./view";

/** The smallest step of a materialised series, measured once per
    materialisation - a gesture asks for it on every wheel step. */
const STEPS = new WeakMap<MaterializedSeries, number>();

/** Goes to a whole view (`setView`); what it leaves out goes back to its default -
    also the span or the hidden name of a part not declared at the moment,
    which the view reported does not show. */
export function applyView(s: ChartScene, view: ChartView): void {
  if (viewKey(view) === viewKey(heldView(s))) return;
  s.heldSpans = { ...view.domains };
  setHidden(s, [...(view.hidden ?? [])]);
}

/** Hides the series `names` together, or shows them where every one is
    hidden - a state's legend entry speaks for every band that shows it. */
export function toggleNames(s: ChartScene, names: readonly string[]): void {
  hideSome(s, toggleHidden(s.heldHidden, names));
}

/** The legend's gesture: shows only the series `names` - or all, where they
    were the only ones visible. `from` is the hidden series it judges by: a
    double click by those before its first click. */
export function showOnlyNames(s: ChartScene, names: readonly string[], from: readonly string[] = s.heldHidden): void {
  const series = seriesNames(s);
  hideSome(s, onlyVisible(names, from, series) ? [] : showOnly(names, series));
}

/** Hides `next` - unless it hides every series: then all are shown, and
    the live region says so. */
export function hideSome(s: ChartScene, next: string[]): void {
  if (hidesAll(next, seriesNames(s))) {
    next = [];
    say(s, s.wording.allShown);
  }
  setHidden(s, next);
}

/** The name of every series declared, `undefined` for one without. */
export function seriesNames(s: ChartScene): (string | undefined)[] {
  return [...s.series.values()].map(({ config }) => config.name);
}

export function setHidden(s: ChartScene, next: string[]): void {
  const before = new Map([...s.series.values()].map((e) => [e, isHidden(s, e.config)]));
  s.heldHidden = next;
  // A hidden member leaves its place in the stack: the others sum anew.
  for (const [entry, was] of before) {
    if (was !== isHidden(s, entry.config) && stackOf(entry.config) !== undefined) s.materialsDirty = true;
  }
  viewMoved(s);
}

export function viewMoved(s: ChartScene): void {
  s.actedOn = true;
  publishView(s);
  s.markLayoutDirty();
}

/** Everything the scene holds, also of the parts not declared at the
    moment. */
export function heldView(s: ChartScene): ChartView {
  const domains = s.heldSpans;
  const hidden = s.heldHidden;
  return { ...(Object.keys(domains).length > 0 && { domains }), ...(hidden.length > 0 && { hidden }) };
}

/** What is held as it would be reported now. */
export function viewToReport(s: ChartScene): ChartView {
  const axes = s.axes.size === 0 ? null : new Set(zoomAxisIds(s));
  const names = s.series.size === 0 ? null : new Set(seriesNames(s).filter((n) => n !== undefined));
  return onlyKnown(heldView(s), axes, names);
}

/** Hands the view out where its content changed. A gesture calls it from
    the frame, so that a pan is reported at most once per frame. */
export function publishView(s: ChartScene): void {
  const next = viewToReport(s);
  if (viewKey(next) === viewKey(s.reportedView)) return;
  s.reportedView = next;
  for (const listener of s.viewListeners) listener();
}

export function isHidden(s: ChartScene, config: SeriesConfig): boolean {
  return config.name !== undefined && s.heldHidden.includes(config.name);
}

export function zooms(s: ChartScene, config: AxisConfig): boolean {
  return config.orientation === "x" && config.zoomable === true;
}

export function zoomAxisIds(s: ChartScene): string[] {
  return [...s.axes.values()].filter(({ config }) => zooms(s, config)).map(({ config }) => config.id);
}

/** What an axis shows: on a zoomable x axis the span the view names, and
    its own `domain` where the view names none. */
export function domainOf(s: ChartScene, config: AxisConfig): AxisConfig["domain"] {
  return (zooms(s, config) ? s.heldSpans[config.id] : undefined) ?? config.domain;
}

/** The narrowest and widest span zoom reaches on an axis: its own, or at
    most the data's extent and at least three data steps. */
export function limitsOf(s: ChartScene, config: AxisConfig): ZoomLimits {
  return (
    config.zoomLimits ??
    defaultLimits(s.axisExtent("x", config.id), dataStep(s, config.id), s.findAxis("x", config.id)?.ownDomain)
  );
}

/** The smallest distance between two neighbouring points of the series on
    an x axis; 0 where none can be measured. */
export function dataStep(s: ChartScene, axisId: string): number {
  let step = Number.POSITIVE_INFINITY;
  for (const { config, materialized } of s.series.values()) {
    if (config.xAxisId !== axisId || materialized === null) continue;
    let own = STEPS.get(materialized);
    if (own === undefined) {
      own = measureStep(materialized.x, materialized.length);
      STEPS.set(materialized, own);
    }
    if (own > 0) step = Math.min(step, own);
  }
  return Number.isFinite(step) ? step : 0;
}

export function hasZoom(s: ChartScene): boolean {
  for (const { config } of s.axes.values()) {
    if (zooms(s, config)) return true;
  }
  return false;
}

/** The x axes a gesture speaks to. */
export function zoomAxes(s: ChartScene): { config: AxisConfig; layout: AxisLayout }[] {
  const out: { config: AxisConfig; layout: AxisLayout }[] = [];
  for (const { config } of s.axesInOrder()) {
    if (!zooms(s, config)) continue;
    const layout = s.findAxis("x", config.id);
    if (layout !== null) out.push({ config, layout });
  }
  return out;
}

/** Moves the span of every zoomable axis; the view is handed out with the
    next frame. A second wheel step in the same frame builds on the first,
    not on the domain still drawn. */
export function move(s: ChartScene, next: (domain: readonly [number, number], config: AxisConfig) => [number, number]): void {
  let moved = false;
  for (const { config, layout } of zoomAxes(s)) {
    const domain = next(s.heldSpans[config.id] ?? layout.scale.domain, config);
    if (!(domain[1] - domain[0] > 0) || !Number.isFinite(domain[1] - domain[0])) continue;
    s.heldSpans = { ...s.heldSpans, [config.id]: domain };
    moved = true;
  }
  if (moved) {
    s.actedOn = true;
    s.markLayoutDirty();
  }
}

/** Zoom by `factor` (below 1 is closer) around a pixel, which keeps its
    value; the span stays within the axis' zoom limits. */
export function zoomAt(s: ChartScene, px: number, factor: number): void {
  const p = s.layout.plot;
  const share = p.width > 0 ? Math.min(1, Math.max(0, (px - p.x) / p.width)) : 0.5;
  move(s, (domain, config) => zoomSpan(domain, share, factor, limitsOf(s, config)));
}

/** Pan by a distance in pixels; positive moves the content right. */
export function panBy(s: ChartScene, dx: number): void {
  const width = s.layout.plot.width;
  if (width <= 0 || dx === 0) return;
  move(s, ([from, to]) => {
    const delta = (-dx / width) * (to - from);
    return [from + delta, to + delta];
  });
}

export function wheel(s: ChartScene, event: WheelEvent): void {
  if (!hasZoom(s)) return;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? s.layout.plot.width : 1;
  const dx = event.deltaX * unit;
  const dy = event.deltaY * unit;
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault();
    // A pinch sends small deltas, a mouse wheel large ones.
    zoomAt(s, event.offsetX, Math.exp(dy * (Math.abs(dy) < 50 ? 0.01 : 0.0015)));
  } else if (Math.abs(dx) > Math.abs(dy) || event.shiftKey) {
    event.preventDefault();
    panBy(s, -(event.shiftKey && dx === 0 ? dy : dx));
  }
}

/** Alt with a drag marks a range where the chart zooms (a plain drag pans, and
    a finger pans); where nothing zooms, any primary drag does (ADR-0074). */
function rangeWanted(s: ChartScene, event: PointerEvent): boolean {
  if (s.onRange === null) return false;
  if (event.pointerType !== "touch" && event.button !== 0) return false;
  return !hasZoom(s) || (event.altKey && event.pointerType !== "touch");
}

const clampToPlot = (s: ChartScene, px: number): number => {
  const p = s.layout.plot;
  return Math.min(p.x + p.width, Math.max(p.x, px));
};

/** The range gone, reported or not; the band with it. */
export function endRange(s: ChartScene): void {
  if (s.range === null) return;
  s.range = null;
  if (typeof document !== "undefined") document.removeEventListener("keydown", cancelOnEscape);
  s.markOverlayDirty();
}

// One range is under the pointer at a time, so one listener, aimed at its scene.
let ranging: ChartScene | null = null;
function cancelOnEscape(event: KeyboardEvent): void {
  if (event.key === "Escape" && ranging !== null) endRange(ranging);
}

/** A stretch of an x axis in the axis' own values, from what its channel holds
    (a place, working time, a number): a category axis names the first and the
    last place the stretch touches - half a step either side of a place counts
    - and a calendar axis gives wall-clock instants, the ends of the plot
    holding the first and the last. */
export function rangeOf(s: ChartScene, axisId: string, a: number, b: number): ChartRange<number | string> {
  const [lo = 0, hi = 0] = [a, b].sort((u, v) => u - v);
  const categories = s.categoriesAt("x", axisId);
  if (categories !== undefined) {
    const last = categories.names.length - 1;
    const at = (place: number) => categories.names[Math.min(last, Math.max(0, place))] ?? "";
    return { axisId, from: at(Math.ceil(lo - 0.5)), to: at(Math.floor(hi + 0.5)) };
  }
  const calendar = s.axesInOrder().find(({ config }) => config.orientation === "x" && config.id === axisId)?.config.calendar;
  if (calendar === undefined || calendar.length === 0) return { axisId, from: lo, to: hi };
  const built = calendarFrom(calendar);
  const wall = (v: number) => toWallClock(Math.min(Math.max(v, 0), built.total), built);
  return { axisId, from: wall(lo), to: wall(hi) };
}

/** Reports the range once per x axis, in registration order, `from` first. */
function reportRange(s: ChartScene, a: number, b: number): void {
  const report = s.onRange;
  if (report === null) return;
  for (const { config } of s.axesInOrder()) {
    if (config.orientation !== "x") continue;
    const layout = s.findAxis("x", config.id);
    if (layout === null) continue;
    report(rangeOf(s, config.id, layout.scale.fromPx(a) ?? 0, layout.scale.fromPx(b) ?? 0));
  }
}

export function pointerDown(s: ChartScene, event: PointerEvent): void {
  s.downAt = event.offsetX;
  s.travelled = false;
  if (rangeWanted(s, event)) {
    s.range = { from: clampToPlot(s, event.offsetX), to: clampToPlot(s, event.offsetX), live: false, pointerId: event.pointerId };
    ranging = s;
    document.addEventListener("keydown", cancelOnEscape);
    s.container?.setPointerCapture?.(event.pointerId);
    return;
  }
  if (!hasZoom(s)) return;
  if (event.pointerType !== "touch" && event.button !== 0) return;
  s.pointers.set(event.pointerId, event.offsetX);
  s.container?.setPointerCapture?.(event.pointerId);
  if (s.pointers.size === 2) s.pinch = pinchWidth(s);
}

/** A drag pans, two fingers pinch. */
export function drag(s: ChartScene, event: PointerEvent): void {
  if (s.downAt !== null && Math.abs(event.offsetX - s.downAt) > 4 && event.buttons !== 0) s.travelled = true;
  const range = s.range;
  if (range !== null && range.pointerId === event.pointerId) {
    range.to = clampToPlot(s, event.offsetX);
    // Under 4 px it may still be a click: the tooltip and its hit stay until it is not.
    if (s.travelled && !range.live) {
      range.live = true;
      s.clearActive();
    }
    s.markOverlayDirty();
    return;
  }
  const last = s.pointers.get(event.pointerId);
  if (last === undefined) return;
  s.pointers.set(event.pointerId, event.offsetX);
  if (s.pointers.size === 1) {
    panBy(s, event.offsetX - last);
    return;
  }
  const width = pinchWidth(s);
  if (s.pinch > 0 && width > 0) {
    const [a = 0, b = 0] = s.pointers.values();
    zoomAt(s, (a + b) / 2, s.pinch / width);
  }
  s.pinch = width;
}

export function pointerUp(s: ChartScene, event: PointerEvent): void {
  const range = s.range;
  if (range !== null && range.pointerId === event.pointerId) {
    const end = clampToPlot(s, event.offsetX);
    const made = event.type !== "pointercancel" && Math.abs(event.offsetX - (s.downAt ?? event.offsetX)) > 4;
    endRange(s);
    if (made) {
      s.travelled = true; // the click that follows is the end of a drag
      reportRange(s, range.from, end);
    }
  }
  s.pointers.delete(event.pointerId);
  s.pinch = pinchWidth(s);
}

export function pinchWidth(s: ChartScene): number {
  const [a, b] = s.pointers.values();
  return a === undefined || b === undefined ? 0 : Math.abs(a - b);
}

/** Every zoomable axis back to its own domain: a double click, the key 0
    and 'Show all'. */
export function resetZoom(s: ChartScene): void {
  if (!hasZoom(s)) return;
  const ids = new Set(zoomAxisIds(s));
  s.heldSpans = Object.fromEntries(Object.entries(s.heldSpans).filter(([id]) => !ids.has(id)));
  viewMoved(s);
}
