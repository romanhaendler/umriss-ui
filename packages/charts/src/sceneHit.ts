/* The pointer's hit test: which point of which series lies under the
   pointer, how hits of several series are grouped into one tooltip, and the
   Active point they set. Functions over the scene. */

import { type BarPlacement } from "./bars";
import { cellSize, cellIndex } from "./cells";
import { nearestIndex, nearestPoint } from "./hit";
import { type AxisLayout } from "./layout";
import type { ChartScene } from "./scene";
import { matrixColors, matrixBuckets, colorFor, nameFor } from "./sceneColors";
import { boxAt } from "./sceneConfig";
import { placements, lastEnd, lanePx } from "./sceneDraw";
import { centreOf, releaseKey } from "./sceneKeys";
import { type SeriesEntry, type Candidate } from "./sceneModel";
import { rowsOfSeries } from "./sceneMaterial";
import { limitTexts, totalsOf } from "./sceneSpeech";
import { isHidden } from "./sceneView";
import { segmentEnd, segmentIndex } from "./state";
import { FALLBACK_THEME } from "./theme";
import type { HoverState, MaterializedSeries, Rect, TooltipHit, TooltipPoint } from "./types";
import { subMinute, tooltipRow } from "./sceneTooltip";
















/** Tolerance within which hits of different series are grouped. */
export const GROUP_TOLERANCE = 4;

/** Under "nearest", a point this close to the pointer wins over a band or a
    cell under it: the area covers the pointer everywhere, the point is the
    precise answer. */
export const SNAP_DISTANCE = 12;

export function inPlot(s: ChartScene, x: number, y: number): boolean {
  const p: Rect = s.layout.plot;
  return x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height;
}

export function pointerMove(s: ChartScene, x: number, y: number): void {
  if (s.range?.live === true) return; // marking a range: no tooltip
  if (!inPlot(s, x, y)) {
    pointerLeave(s);
    return;
  }
  if (s.tooltip === null) {
    // No hit to snap to - the pointer's own x is what a synced chart shows.
    const axis = s.layout.axes.find((a) => a.orientation === "x");
    if (axis !== undefined) s.share({ axisId: axis.id, value: axis.scale.fromPx(x) });
    return;
  }
  if (!showAt(s, x, y)) {
    pointerLeave(s);
    return;
  }
  if (s.activeBy === "keyboard") releaseKey(s);
  s.activeBy = "pointer";
}

/** The Active point at a pixel - the pointer's, or the one a key resolved
    to. False where nothing is hit there. */
export function showAt(s: ChartScene, x: number, y: number): boolean {
  const hit = hitTest(s, x, y);
  if (hit === null) return false;
  const key = hit.key;
  s.hover = hit.state;
  s.hover.mouseX = x;
  s.hover.mouseY = y;
  s.markOverlayDirty(); // a hover never touches the series layer
  const xAxis = s.findAxis("x", hit.primary.entry.config.xAxisId);
  if (xAxis !== null) s.share({ axisId: xAxis.id, value: xAxis.scale.fromPx(hit.state.hit.xPx) });
  if (key !== s.hoverKey) {
    // Written out once per hit, not per movement: a format is not free.
    const xAxisId = hit.primary.entry.config.xAxisId;
    s.hoverKey = key;
    s.hoverXLabel = s.xLabel(xAxisId, hit.primary.xValue, subMinute(hit.primary));
    s.hoverRows = hit.chosen.map((k) => tooltipRow(s, k, xAxisId));
    s.hoverOrders = hit.chosen.map((k) => k.entry.order);
    s.hoverTotals = totalsOf(s, hit.chosen);
    s.hoverLimits = s.tooltip?.limits === true ? limitTexts(s, hit.primary.entry.config.yAxisId) : [];
    s.pushHoverSnapshot();
  }
  return true;
}

/** The pointer went away. A point the keyboard set stays. */
export function pointerLeave(s: ChartScene): void {
  if (s.activeBy === "keyboard") return;
  clearActive(s);
}

/** No Active point, by whoever set it. */
export function clearActive(s: ChartScene): void {
  releaseKey(s);
  s.activeBy = null;
  s.share(null);
  if (s.hover === null && s.hoverKey === "") return;
  s.hover = null;
  s.hoverKey = "";
  s.markOverlayDirty();
  s.pushHoverSnapshot();
}

export function hitTest(
  s: ChartScene,
  mouseX: number,
  mouseY: number,
): { key: string; state: HoverState; primary: Candidate; chosen: readonly Candidate[] } | null {
  const mode = s.tooltip?.mode ?? "x";
  const candidates: Candidate[] = [];
  let placed: Map<number, BarPlacement> | undefined;
  s.seriesInOrder().forEach((entry, i) => {
    const mat = entry.materialized;
    if (mat === null || mat.length === 0 || isHidden(s, entry.config)) return;
    const config = entry.config;
    const xAxis = s.findAxis("x", config.xAxisId);
    const yAxis = s.findAxis("y", config.yAxisId);
    if (xAxis === null || yAxis === null) return;
    // Mouse position in the axis space of this series.
    const targetX = xAxis.scale.fromPx(mouseX);
    const targetY = yAxis.scale.fromPx(mouseY);
    const hit = hitIn(s, entry, mat, xAxis, yAxis, mouseY, targetX, targetY, mode);
    if (hit === null) return;
    candidates.push({
      entry,
      index: hit.index,
      color: hit.color ?? colorFor(s, entry),
      name: nameFor(s, entry, i),
      px: hit.px,
      py: hit.py,
      xValue: hit.xValue,
      yValue: hit.yValue,
      marked: hit.marked,
      areal: hit.areal,
      covers: hit.covers === true,
      level: hit.level,
      segment: hit.segment,
      box: hit.box,
      markX:
        config.kind === "box"
          ? hit.px + centreOf(s, (placed ??= placements(s)).get(entry.order), xAxis)
          : undefined,
    });
  });
  if (candidates.length === 0) return null;

  /* The primary hit determines the crosshair and the grouping, and for that
     only whoever has a comparable place counts. The px of an area is the
     beginning of its section and lies arbitrarily far left of the pointer, so
     it stays out of the distance comparison. */
  const pointLike = candidates.filter((k) => !k.areal);
  const comparable = pointLike.length > 0 ? pointLike : candidates;
  let primary = comparable[0] as Candidate;
  if (mode === "nearest") {
    let best = Number.POSITIVE_INFINITY;
    const covering = pointLike.filter((k) => k.covers);
    for (const k of covering.length > 0 ? covering : pointLike) {
      // A grouped box is near where it is drawn, not at its x value.
      const dx = (k.markX ?? k.px) - mouseX;
      const dy = k.py - mouseY;
      const d = dx * dx + dy * dy; // Euclidean comparison in pixel space
      // Two stacked segments meet where one's top is the other's foot; a
      // tie there goes to the upper one, which a segment of zero height is -
      // otherwise the walk could never land on it.
      if (d < best || (d === best && k.covers)) {
        best = d;
        primary = k;
      }
    }
    // An area covers the pointer wherever it is hit, so its distance is always
    // zero - it would beat every point. It answers only where no point is
    // within reach.
    if (covering.length === 0 && best > SNAP_DISTANCE * SNAP_DISTANCE) {
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

  const points: TooltipPoint[] = chosen.map((k) => {
    // The caller's row, also where the series is held in another order.
    const row = k.entry.rows?.[k.index] ?? k.index;
    return {
      seriesName: k.name,
      color: k.color,
      xValue: k.xValue,
      yValue: k.yValue,
      datum: rowsOfSeries(s, k.entry.config)[row],
      index: row,
      level: k.level,
      segment: k.segment,
      box: k.box,
    };
  });
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
      .map((k) => ({ x: k.markX ?? k.px, y: k.py, color: k.color })),
    mouseX,
    mouseY,
  };
  const key = chosen.map((k) => `${k.entry.order}:${k.index}`).join("|");
  return { key, state, primary, chosen };
}

/** The hit of one series - one different question per kind.

    Every mark that is a point asks "which point lies nearest". A band and a
    cell ask "what lies under the pointer", and that is not the same question:
    for the right half of every segment the nearest point gives the wrong
    answer. */
export function hitIn(
  s: ChartScene,
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
  covers?: boolean;
  color?: string;
  level?: number;
  segment?: { from: number; to: number; label: string };
  box?: TooltipPoint["box"];
} | null {
  const config = entry.config;
  const n = mat.length;

  if (config.kind === "state") {
    const lane = lanePx(s, config, yAxis);
    // A band is hit only within its lane; otherwise the topmost lane of a stack
    // would catch everything lying beneath it.
    if (mouseY < lane.top || mouseY > lane.bottom) return null;
    const index = segmentIndex(mat.x, n, targetX);
    if (index < 0) return null;
    const code = mat.y[index] as number;
    if (Number.isNaN(code)) return null; // a hole is no hit
    const from = mat.x[index] as number;
    const to = segmentEnd(mat.x, n, index, lastEnd(s, entry, mat, xAxis));
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
    const level = w === null ? Number.NaN : (w[index] as number);
    if (!Number.isFinite(level)) return null; // a hole is no hit
    const xValue = mat.x[index] as number;
    const yValue = mat.y[index] as number;
    // The chip shows the cell's own colour, bucketed as the drawing does it.
    const colors = matrixColors(config.coloring, s.theme ?? FALLBACK_THEME);
    entry.buckets ??= matrixBuckets(mat, config.coloring, colors.length);
    return {
      index,
      px: xAxis.scale.toPx(xValue),
      py: yAxis.scale.toPx(yValue),
      color: colors[entry.buckets[index] as number],
      xValue,
      // yValue stays the position on the y axis; the level that carries the
      // colour stands in a field of its own, for the tooltip.
      yValue,
      level,
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
  const top = mat.y[index] as number;
  if (Number.isNaN(top)) return null; // gaps are no hits
  const xValue = mat.x[index] as number;
  // A stacked point is marked at its top and named by its own value.
  const foot = entry.stacked === null || mat.y0 === null ? Number.NaN : (mat.y0[index] as number);
  return {
    index,
    px: xAxis.scale.toPx(xValue),
    py: yAxis.scale.toPx(top),
    xValue,
    yValue: entry.stacked === null ? top : (entry.stacked.value[index] as number),
    marked: true,
    areal: false,
    covers: targetY >= Math.min(foot, top) && targetY <= Math.max(foot, top),
    box: mat.box === null ? undefined : boxAt(mat.box, index),
  };
}
