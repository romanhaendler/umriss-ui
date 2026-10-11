/* Drawing: what the scene hands the series and overlay layers - one item per
   visible series, with its colours, placement and marks - and the two layer
   passes themselves. Functions over the scene. */

import { barGroups, barPlacement, type BarPlacement, effectiveStep } from "./bars";
import { cellSize } from "./cells";
import { downsample } from "./downsample";
import { drawOverlayLayer, drawSeriesLayer, type DrawBase, type SeriesDrawItem } from "./draw";
import { type AxisLayout } from "./layout";
import { hatchFor, type Hatch } from "./marks";
import type { ChartScene } from "./scene";
import { matrixColors, matrixBuckets, paint, colorFor, limitItems } from "./sceneColors";
import { LANE_WIDTH, widthOf, stackOf } from "./sceneConfig";
import { type SeriesEntry } from "./sceneModel";
import { isHidden } from "./sceneView";
import { lastSegmentEnd } from "./state";
import { FALLBACK_THEME } from "./theme";
import type { StateSeriesConfig, BoxChannels, MaterializedSeries } from "./types";

export function drawItems(s: ChartScene): SeriesDrawItem[] {
  const items: SeriesDrawItem[] = [];
  let hatches: Map<string, Hatch> | undefined;
  // A hidden bar leaves no empty place in its group.
  const series = s.seriesInOrder().filter((e) => !isHidden(s, e.config));
  // A highlight of nothing drawn - a hidden series' legend entry - dims nothing.
  const lit = s.highlight;
  const highlight = lit !== null && series.some((e) => lit.includes(e.order)) ? lit : null;
  const placed = placements(s);
  series.forEach((entry) => {
    const mat = entry.materialized;
    if (mat === null) return;
    const xAxis = s.findAxis("x", entry.config.xAxisId);
    const yAxis = s.findAxis("y", entry.config.yAxisId);
    if (xAxis === null || yAxis === null) return;
    const dimmed = highlight !== null && !highlight.includes(entry.order);
    const marks = s.marksOf(entry);
    const base: DrawBase = {
      x: mat.x,
      y: mat.y,
      length: mat.length,
      xScale: xAxis.scale,
      yScale: yAxis.scale,
      color: colorFor(s, entry),
      alpha: dimmed ? 0.25 : 1,
    };
    const config = entry.config;
    // A course draws its window, and above two points per pixel column only
    // what shows (downsample.ts); every other kind draws its points.
    const course =
      config.kind === "line" || config.kind === "area"
        ? downsample(mat, xAxis.scale.domain[0], xAxis.scale.domain[1], xAxis.scale.m, xAxis.scale.b, s.layout.plot.width)
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
          // A dash of the caller's own wins over the one its place gives.
          dash: config.dash ?? marks?.dash,
          markers: config.markers,
          step: config.step,
          marker: marks?.marker,
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
          dash: config.dash ?? marks?.dash,
          hatch: marks?.hatch,
          edges: entry.stacked !== null,
        });
        break;
      case "bar": {
        const placement = placed.get(entry.order);
        if (placement === undefined) break;
        items.push({
          ...base,
          kind: "bar",
          y0: mat.y0,
          baseline: 0,
          offset: placement.offset,
          width: placement.width,
          hatch: marks?.hatch,
          edges: entry.stacked !== null,
        });
        break;
      }
      case "box": {
        const placement = placed.get(entry.order);
        if (placement === undefined) break;
        items.push({
          ...base,
          kind: "box",
          box: mat.box as BoxChannels,
          offset: placement.offset,
          width: placement.width,
          hatch: marks?.hatch,
        });
        break;
      }
      case "scatter":
        items.push({ ...base, kind: "scatter", radius: config.radius, marker: marks?.marker });
        break;
      case "state": {
        const lane = lanePx(s, config, yAxis);
        items.push({
          ...base,
          kind: "state",
          colors: config.states.map((z) => paint(s, z.color)),
          laneTop: lane.top,
          laneBottom: lane.bottom,
          lastEnd: lastEnd(s, entry, mat, xAxis),
          hatches: s.marked() ? config.states.map((z) => (hatches ??= s.stateHatches()).get(z.label) ?? "none") : null,
        });
        break;
      }
      case "matrix": {
        const colors = matrixColors(config.coloring, s.theme ?? FALLBACK_THEME).map((c) => paint(s, c));
        items.push({
          ...base,
          kind: "matrix",
          buckets: (entry.buckets ??= matrixBuckets(mat, config.coloring, colors.length)),
          colors: colors,
          hatches: s.marked() ? colors.map((_, k) => hatchFor(k)) : null,
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

/** Where each visible bar and box stands relative to its x value, by its
    place in the group of its x axis (ADR-0002). One pass over the series,
    not over the points. Step and fraction come from the group, not from
    the series, so members of differing density do not overlap. */
export function placements(s: ChartScene): Map<number, BarPlacement> {
  const series = s.seriesInOrder().filter((e) => !isHidden(s, e.config));
  const groups = barGroups(
    series.map((e) => ({
      order: e.order,
      kind: e.config.kind,
      xAxisId: e.config.xAxisId,
      step: e.step ?? 0,
      fraction: widthOf(e.config),
      stack: stackOf(e.config),
    })),
  );
  const out = new Map<number, BarPlacement>();
  for (const entry of series) {
    const xAxis = s.findAxis("x", entry.config.xAxisId);
    if (xAxis === null) continue;
    const group = groups.get(entry.order);
    if (group === undefined) continue;
    const domain = xAxis.scale.domain;
    out.set(entry.order, barPlacement(effectiveStep(group.step, domain[1] - domain[0]), group.fraction, group.index, group.size));
  }
  return out;
}

/** Where a band's last state ends: the latest x of the visible series on its
    x axis, one step past its own last point where that is the latest, never
    beyond the domain (lastSegmentEnd). */
export function lastEnd(s: ChartScene, entry: SeriesEntry, mat: MaterializedSeries, xAxis: AxisLayout): number {
  let latest = Number.NEGATIVE_INFINITY;
  for (const e of s.series.values()) {
    const m = e.materialized;
    if (m === null || m.length === 0 || isHidden(s, e.config) || e.config.xAxisId !== entry.config.xAxisId) continue;
    const x = m.x[m.length - 1] as number;
    if (x > latest) latest = x;
  }
  return lastSegmentEnd(mat.x, mat.length, latest, entry.step ?? 0, xAxis.scale.domain[1]);
}

/** Lane of a state series in pixels. Without a value the whole domain of its y
    axis: a single series fills its band, a stack gets a domain with one unit per
    lane from the caller. */
export function lanePx(s: ChartScene, config: StateSeriesConfig, yAxis: AxisLayout): { top: number; bottom: number } {
  const domain = yAxis.scale.domain;
  let from = config.laneFrom ?? domain[0];
  let to = config.laneTo ?? domain[1];
  if (config.lane !== undefined) {
    // A named lane takes its category's place; one the axis does not know
    // has none.
    const place = s.categoriesAt("y", yAxis.id)?.place.get(config.lane);
    if (place === undefined) return { top: 0, bottom: 0 };
    from = place - LANE_WIDTH / 2;
    to = place + LANE_WIDTH / 2;
  }
  const a = yAxis.scale.toPx(from);
  const b = yAxis.scale.toPx(to);
  return { top: Math.min(a, b), bottom: Math.max(a, b) };
}

export function paintSeriesLayer(s: ChartScene): void {
  const ctx = s.seriesCtx;
  const theme = s.theme;
  if (!ctx || !theme) return;
  const start = typeof performance === "undefined" ? 0 : performance.now();
  drawSeriesLayer(ctx, {
    width: s.cssWidth,
    height: s.cssHeight,
    plot: s.layout.plot,
    axes: s.layout.axes,
    theme,
    series: drawItems(s),
    limitBands: limitItems(s, true),
    limitLines: limitItems(s, false),
  });
  s.perf.seriesDrawMs =
    (typeof performance === "undefined" ? 0 : performance.now()) - start;
  s.onPerf?.({ ...s.perf });
}

export function paintOverlayLayer(s: ChartScene): void {
  const ctx = s.overlayCtx;
  const theme = s.theme;
  if (!ctx || !theme) return;
  drawOverlayLayer(ctx, {
    width: s.cssWidth,
    height: s.cssHeight,
    plot: s.layout.plot,
    theme,
    hover: s.hover,
    syncPx: s.syncedPx(),
  });
  s.positionTooltip();
}
