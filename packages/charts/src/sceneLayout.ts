/* Layout: the extent every axis shows, the limits and calendars that enter
   it, and the pass that hands the axes and series to computeLayout. Functions
   over the scene. */

import { warnOnce } from "./dev";
import { computeLayout, type AxisInput, type AxisLayout } from "./layout";
import { axisExtent, visibleExtent, type Extent } from "./materialize";
import type { ChartScene } from "./scene";
import { labelled, baselineOf } from "./sceneConfig";
import { inTime, materialize } from "./sceneMaterial";
import { type SeriesEntry } from "./sceneModel";
import { yTickFormat } from "./sceneSpeech";
import { publishView, isHidden, zooms, domainOf, hasZoom } from "./sceneView";
import type { AxisConfig, LimitConfig, AxisOrientation } from "./types";
import { sameSpan } from "./view";
import { inRemovedTime, toWorkingTimeClamped } from "./workingTime";














/** The effective grid default: only the first registered axis per orientation has a grid. */
export function gridDefault(s: ChartScene): Map<number, boolean> {
  const out = new Map<number, boolean>();
  let firstX = true;
  let firstY = true;
  for (const [id, entry] of [...s.axes.entries()].sort((a, b) => a[1].order - b[1].order)) {
    const first = entry.config.orientation === "x" ? firstX : firstY;
    out.set(id, entry.config.grid ?? first);
    if (entry.config.orientation === "x") firstX = false;
    else firstY = false;
  }
  return out;
}

/** Extent of an axis out of the series bound to it.

    Materialises on demand and manages without the DOM - that is the seam at
    which extents across series kinds can be tested without asking a canvas.
    The layout path calls extentFor directly. */
export function axisExtentOf(
  s: ChartScene,
  orientation: AxisOrientation,
  id: string,
): readonly [number, number] {
  if (s.materialsDirty) materialize(s);
  const categories = s.categoriesAt(orientation, id);
  if (categories !== undefined) {
    // Every category has its place, half a step to either side - whatever
    // kind stands on it, and whichever series is shown (ADR-0052).
    const from = -0.5;
    const to = categories.names.length - 0.5;
    const span = { xMin: from, xMax: to, yMin: from, yMax: to };
    return axisExtent(orientation, id, [{ xAxisId: id, yAxisId: id, extent: span }], limitValues(s, orientation, id));
  }
  const visible = orientation === "y" && s.findAxisConfig("y", id)?.domain === "visible";
  const bindings = [...s.series.values()].map((entry) => ({
    xAxisId: entry.config.xAxisId,
    yAxisId: entry.config.yAxisId,
    // A hidden series has no say: the axis fits what is shown.
    extent: isHidden(s, entry.config) ? null : visible ? visibleExtentOf(s, entry) : entry.extent,
  }));
  return axisExtent(orientation, id, bindings, limitValues(s, orientation, id));
}

/** The extent of what a fixed x domain shows. A domain that is not fixed
    shows every point - "nice" and "data" both contain the data -, and a band
    and a cell keep theirs: a lane is no value, a cell's edge no point. */
export function visibleExtentOf(s: ChartScene, entry: SeriesEntry): Extent | null {
  const xConfig = s.findAxisConfig("x", entry.config.xAxisId);
  const domain = xConfig === null ? undefined : domainOf(s, xConfig);
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
export function limitValues(s: ChartScene, orientation: AxisOrientation, id: string): number[] {
  const out: number[] = [];
  for (const { config } of s.limits.values()) {
    if (!config.inExtent) continue;
    if (config.orientation !== orientation || s.limitAxisId(config) !== id) continue;
    if (config.kind === "line") out.push(limitAt(s, config, config.value));
    else out.push(limitAt(s, config, config.from), limitAt(s, config, config.to));
  }
  return out;
}

/** A limit's value in the units of its axis. An x limit on a working-time
    axis is named on the wall clock, like the data, and mapped as they are. */
export function limitAt(s: ChartScene, config: LimitConfig, value: number): number {
  if (config.orientation !== "x") return value;
  const axis = s.findAxisConfig("x", s.limitAxisId(config));
  const map = axis === null ? undefined : mapFor(s, axis);
  return map === undefined ? value : map(value);
}

/** Pre-mapping of the x values of an axis with a working calendar. The scale
    stays affine; the mapping happens beforehand, once per point, in
    materialisation - exactly the route ADR-0001 prescribes for a non-affine
    axis. */
export function mapFor(s: ChartScene, axis: AxisConfig): ((v: number) => number) | undefined {
  const calendar = calendarOf(s, axis);
  if (calendar === undefined) return undefined;
  // Clamped, not NaN: the channel has to stay ascending, otherwise every binary
  // search over it runs into nothing. The working time module builds a
  // calendar out of the list once and keeps it; there is therefore no second
  // cache here.
  return (v: number) => toWorkingTimeClamped(v, calendar);
}

/** An axis' working calendar - none where it reads categories: a place is
    no time. */
export function calendarOf(s: ChartScene, axis: AxisConfig): AxisConfig["calendar"] {
  const calendar = axis.calendar;
  if (calendar === undefined || calendar.length === 0) return undefined;
  return s.categoriesAt(axis.orientation, axis.id) === undefined ? calendar : undefined;
}

export function gapFor(s: ChartScene, axis: AxisConfig): ((v: number) => boolean) | undefined {
  const calendar = calendarOf(s, axis);
  if (calendar === undefined) return undefined;
  return (v: number) => inRemovedTime(v, calendar);
}

export function extentFor(s: ChartScene, config: AxisConfig): readonly [number, number] {
  return axisExtentOf(s, config.orientation, config.id);
}

export function updateLayout(s: ChartScene): void {
  const measurer = s.measurer;
  // A zooming chart keeps the horizontal drag and the pinch; the page keeps
  // the vertical scroll.
  if (s.container !== null) s.container.style.touchAction = hasZoom(s) || s.onRange !== null ? "pan-y" : "";
  const grid = gridDefault(s);
  const inputs: AxisInput[] = [];
  for (const [id, entry] of [...s.axes.entries()].sort((a, b) => a[1].order - b[1].order)) {
    const c = entry.config;
    const categories = s.categoriesAt(c.orientation, c.id);
    if (categories !== undefined && (c.tickFormat !== undefined || c.ticks !== undefined || c.tickCount !== undefined)) {
      warnOnce(
        `category-ticks-${c.orientation}-${c.id}`,
        `The ${c.orientation} axis "${c.id}" reads categories: tickFormat, ticks and tickCount do not apply - ` +
          "every category has its tick, and is its own label (ADR-0052).",
      );
    }
    inputs.push({
      key: `${c.orientation}:${c.id}`,
      id: c.id,
      orientation: c.orientation,
      position: c.position,
      label: c.label,
      grid: grid.get(id) ?? false,
      extent: extentFor(s, c),
      domainMode: domainOf(s, c),
      ...(zooms(s, c) && { ownDomainMode: c.domain }),
      tickCount: categories === undefined ? c.tickCount : undefined,
      tickFormat:
        categories === undefined
          ? c.orientation === "y" ? (c.tickFormat ?? yTickFormat(s, c.id)) : c.tickFormat
          : labelled(categories, c.categoryLabel),
      tickValues: categories?.ticks ?? c.ticks,
      time: categories === undefined && inTime(s, c) ? true : undefined,
      calendar: categories === undefined ? c.calendar : undefined,
      alignTicks: c.alignTicks,
      limitLabels:
        c.orientation === "y"
          ? s.limitsInOrder()
              .map((l) => l.config)
              .filter((l) => l.orientation === "y" && s.limitAxisId(l) === c.id && l.label !== undefined && l.label !== "")
              .map((l) => l.label as string)
          : undefined,
    });
  }
  s.layout = computeLayout({
    width: s.cssWidth,
    height: s.cssHeight,
    padding: s.padding,
    axes: inputs,
    measure: (text, className) =>
      measurer === null ? { width: 0, height: 0 } : measurer.measure(text, className),
    hysteresis: s.hysteresis,
    locale: s.wording.locale,
  });
  // A span that is the axis' own domain is its default, no part of the view.
  for (const axis of s.layout.axes) {
    const span = s.heldSpans[axis.id];
    if (axis.ownDomain !== undefined && span !== undefined && sameSpan(span, axis.ownDomain)) {
      const rest = { ...s.heldSpans };
      delete rest[axis.id];
      s.heldSpans = rest;
    }
  }
  // A gesture's span goes out with the frame that draws it, and an axis
  // declared or gone may take a span out of the view or give it back.
  publishView(s);
}

export function findAxis(s: ChartScene, orientation: "x" | "y", id: string): AxisLayout | null {
  for (const axis of s.layout.axes) {
    if (axis.orientation === orientation && axis.id === id) return axis;
  }
  return null;
}
