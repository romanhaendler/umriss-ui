/* The keyboard's walk (ADR-0030): the plot area is one tab stop, the keys move
   the Active point over the positions the pointer would hit (walk.ts), and a
   position becomes a hit by asking the hit test at its pixel - so the tooltip,
   the markers and the sync are the pointer's own. Functions over the scene. */

import { type BarPlacement } from "./bars";
import { nearestIndex } from "./hit";
import { type AxisLayout } from "./layout";
import type { ChartScene } from "./scene";
import { type SeriesEntry } from "./sceneModel";
import { say, scheduleReadout } from "./sceneSpeech";
import { rangeOf } from "./sceneView";
import type { MaterializedSeries } from "./types";
import { hasCell, nearestPosition, rowEnd, stepCell, stepPosition, type Cell, type Move, type WalkSeries } from "./walk";









/** The keys that walk a course, a band, bars or points. */
export const MOVES: Readonly<Record<string, Move>> = {
  ArrowRight: "next",
  ArrowLeft: "previous",
  Home: "first",
  End: "last",
  PageDown: "pageNext",
  PageUp: "pagePrevious",
};

/** The keys that walk a matrix. */
export const CELL_STEPS: Readonly<Record<string, "left" | "right" | "up" | "down">> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

/** One zoom key widens the domain by this much; its opposite narrows it back. */
export const KEY_ZOOM = 1.25;

/** The visible series with points, in registration order. */
export function walkable(s: ChartScene): SeriesEntry[] {
  return s.seriesInOrder().filter(
    (e) => !s.isHidden(e.config) && e.materialized !== null && e.materialized.length > 0,
  );
}

export function emphasised(s: ChartScene): SeriesEntry | null {
  const all = walkable(s);
  return all.find((e) => e.order === s.emphasis) ?? all[0] ?? null;
}

/** What ←/→ walk over: under "nearest" the emphasised series alone, under
    "x" every series on its x axis. */
export function walked(s: ChartScene, emph: SeriesEntry): WalkSeries[] {
  const alone = s.tooltip?.mode === "nearest";
  return walkable(s)
    .filter((e) => (alone ? e === emph : e.config.xAxisId === emph.config.xAxisId))
    .map((e) => ({ ...(e.materialized as MaterializedSeries), changesOnly: e.config.kind === "state" }));
}

/** The focus came in: the walk starts at the newest position, unless the
    pointer already stands somewhere. A pointer's focus - a click - does
    not start it. */
export function focus(s: ChartScene, byKeyboard: boolean): void {
  if (s.tooltip === null || !byKeyboard || s.hover !== null) return;
  walk(s, "last");
}

/** A click on the plot: reports the hit under the pointer, once. The second
    click of a double click does not (that one resets the zoom). */
export function click(s: ChartScene, event: MouseEvent): void {
  const travelled = s.travelled;
  s.travelled = false;
  if (travelled || event.detail > 1) return;
  select(s);
}

export function select(s: ChartScene): boolean {
  if (s.onSelect === null || s.hover === null) return false;
  s.onSelect(s.hover.hit);
  return true;
}

/** The focus left: a point the keyboard set goes with it. */
export function blur(s: ChartScene): void {
  s.rangeStart = null;
  if (s.activeBy === "keyboard") s.clearActive();
}

/** A key on the plot area; true where the chart took it. */
export function key(s: ChartScene, event: KeyboardEvent): boolean {
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  // Without a tooltip there is no Active point to walk: only the zoom keys.
  if (s.tooltip === null) return zoomKey(s, event);
  if (event.key === "Enter" && !event.shiftKey) return select(s);
  if (event.key === " " && !event.shiftKey && s.onRange !== null) return rangeKey(s);
  if (event.key === "Escape") {
    // The first Escape cancels a start and leaves the Active point.
    if (s.rangeStart !== null) {
      s.rangeStart = null;
      return true;
    }
    if (s.hover === null) return false;
    s.clearActive();
    return true;
  }
  if (zoomKey(s, event)) return true;
  const emph = emphasised(s);
  if (emph === null) return false;
  if (emph.config.kind === "matrix") return cellKey(s, event.key, emph);
  const move = event.shiftKey ? undefined : MOVES[event.key];
  if (move !== undefined) {
    walk(s, move);
    return true;
  }
  if (!event.shiftKey && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
    changeSeries(s, event.key === "ArrowDown" ? 1 : -1);
    return true;
  }
  return false;
}

/** Space: the first sets the start at the Active point, the next reports the
    range - the earlier end first - and says it. */
function rangeKey(s: ChartScene): boolean {
  const hover = s.hover;
  const axisId = emphasised(s)?.config.xAxisId;
  if (hover === null || axisId === undefined || s.onRange === null) return false;
  const x = hover.hit.xValue;
  const start = s.rangeStart;
  if (start === null) {
    s.rangeStart = { axisId, x };
    say(s, s.wording.rangeStarted(s.xLabel(axisId, x)));
    return true;
  }
  s.rangeStart = null;
  const [from, to] = start.x <= x ? [start.x, x] : [x, start.x];
  say(s, s.wording.rangeMade(s.xLabel(axisId, from), s.xLabel(axisId, to)));
  s.onRange(rangeOf(s, axisId, from, to));
  return true;
}

/** Zoom and pan by key, only where an x axis is zoomable: each key
    does what its gesture would. */
export function zoomKey(s: ChartScene, event: KeyboardEvent): boolean {
  if (!s.hasZoom()) return false;
  const plot = s.layout.plot;
  const at = s.hover?.hit.xPx ?? plot.x + plot.width / 2;
  if (event.key === "+" || event.key === "=") s.zoomAt(at, 1 / KEY_ZOOM);
  else if (event.key === "-" || event.key === "_") s.zoomAt(at, KEY_ZOOM);
  else if (event.key === "0") s.resetZoom();
  else if (event.shiftKey && (event.key === "ArrowLeft" || event.key === "ArrowRight"))
    s.panBy(((event.key === "ArrowLeft" ? 1 : -1) * plot.width) / 10);
  else return false;
  // Nothing to read after a key where no tooltip does: the span in view
  // is said once the layout has it.
  if (s.tooltip === null) s.sayView = true;
  return true;
}

/** Whether the plot is a tab stop: it has hits to walk or an axis to zoom. */
export function keyed(s: ChartScene): boolean {
  return s.tooltip !== null || s.hasZoom();
}

/** Where the walk starts from: the keyboard's own place, or the pointer's. */
export function walkFrom(s: ChartScene): number | null {
  if (s.activeBy === "keyboard") return s.keyX;
  return s.hover?.hit.xValue ?? null;
}

export function walk(s: ChartScene, move: Move): void {
  const emph = emphasised(s);
  if (emph?.config.kind === "matrix") {
    const cell = lastCell(s, emph);
    if (cell !== null) showCell(s, emph, cell);
    return;
  }
  const xAxis = emph === null ? null : s.findAxis("x", emph.config.xAxisId);
  if (emph === null || xAxis === null) return;
  const from = s.activeBy === null ? null : walkFrom(s);
  const to = stepPosition(walked(s, emph), from, move, xAxis.scale.domain);
  if (to !== null) showPosition(s, emph, to);
}

export function changeSeries(s: ChartScene, step: 1 | -1): void {
  const all = walkable(s);
  const current = emphasised(s);
  if (current === null || all.length < 2) return;
  const next = all[(all.indexOf(current) + step + all.length) % all.length] as SeriesEntry;
  s.emphasis = next.order;
  // The legend's hover emphasis shows which series is read first.
  s.setHighlight([next.order]);
  s.keyHighlight = true;
  const x = walkFrom(s);
  const xAxis = s.findAxis("x", next.config.xAxisId);
  if (xAxis === null) return;
  const to = x === null ? stepPosition(walked(s, next), null, "last", xAxis.scale.domain) : nearestPosition(walked(s, next), x, xAxis.scale.domain);
  if (to === null) return;
  s.keyCell = null;
  if (next.config.kind === "matrix") {
    const cell = columnStart(s, next, to);
    if (cell !== null) showCell(s, next, cell);
  } else showPosition(s, next, to);
}

/** A matrix walks cell by cell in two dimensions. At the top or
    bottom of its column ↑/↓ go on to the chart's other series, so a matrix
    among them does not keep the keys. */
export function cellKey(s: ChartScene, key: string, emph: SeriesEntry): boolean {
  const mat = emph.materialized as MaterializedSeries;
  const at = s.keyCell ?? lastCell(s, emph);
  if (at === null) return false;
  const direction = CELL_STEPS[key];
  let next: Cell;
  if (direction !== undefined) next = stepCell(mat, at, direction);
  else if (key === "Home" || key === "End") next = rowEnd(mat, at, key === "Home" ? "start" : "end");
  else return false;
  if (next === at && (direction === "up" || direction === "down") && walkable(s).length > 1) {
    changeSeries(s, direction === "down" ? 1 : -1);
    return true;
  }
  showCell(s, emph, next);
  return true;
}

/** Where a matrix' walk starts: the newest column, its lowest row. */
export function lastCell(s: ChartScene, emph: SeriesEntry): Cell | null {
  const mat = emph.materialized as MaterializedSeries;
  const xAxis = s.findAxis("x", emph.config.xAxisId);
  const x = xAxis === null ? null : stepPosition([mat], null, "last", xAxis.scale.domain);
  return x === null ? null : columnStart(s, emph, x);
}

/** The lowest cell with a value in a matrix' column. */
export function columnStart(s: ChartScene, emph: SeriesEntry, x: number): Cell | null {
  const below = { x, y: Number.NEGATIVE_INFINITY };
  const cell = stepCell(emph.materialized as MaterializedSeries, below, "up");
  return cell === below ? null : cell;
}

export function showCell(s: ChartScene, emph: SeriesEntry, cell: Cell, speak = true): void {
  const xAxis = s.findAxis("x", emph.config.xAxisId);
  const yAxis = s.findAxis("y", emph.config.yAxisId);
  if (xAxis === null || yAxis === null) return;
  s.keyCell = cell;
  moveKey(s, cell.x, xAxis.scale.toPx(cell.x), yAxis.scale.toPx(cell.y), speak);
}

/** How far a bar's or a box's centre stands from its x value, in pixels. */
export function centreOf(s: ChartScene, placement: BarPlacement | undefined, xAxis: AxisLayout): number {
  return placement === undefined ? 0 : (placement.offset + placement.width / 2) * xAxis.scale.m;
}

/** The Active point at a position of the emphasised series. The pixel's y
    is that series' own, so that "nearest" picks it and a lane is hit. */
export function showPosition(s: ChartScene, emph: SeriesEntry, x: number, speak = true): void {
  const xAxis = s.findAxis("x", emph.config.xAxisId);
  const yAxis = s.findAxis("y", emph.config.yAxisId);
  const mat = emph.materialized;
  if (xAxis === null || yAxis === null || mat === null) return;
  let py: number;
  if (emph.config.kind === "state") {
    const lane = s.lanePx(emph.config, yAxis);
    py = (lane.top + lane.bottom) / 2;
  } else {
    const v = mat.y[nearestIndex(mat.x, mat.length, x)] as number;
    py = Number.isNaN(v) ? s.layout.plot.y + s.layout.plot.height / 2 : yAxis.scale.toPx(v);
  }
  // A grouped box is asked for at its own centre, so that "nearest" picks it.
  const centre = emph.config.kind === "box" ? centreOf(s, s.placements().get(emph.order), xAxis) : 0;
  moveKey(s, x, xAxis.scale.toPx(x) + centre, py, speak);
}

export function moveKey(s: ChartScene, x: number, px: number, py: number, speak = true): void {
  if (!s.showAt(px, py)) return;
  s.activeBy = "keyboard";
  s.keyX = x;
  if (speak) scheduleReadout(s);
}

/** After a layout - new data, a new domain -, the keyboard's point goes to
    the nearest position still visible, or goes away. */
export function reapplyKey(s: ChartScene): void {
  const emph = emphasised(s);
  const xAxis = emph === null ? null : s.findAxis("x", emph.config.xAxisId);
  const x = emph === null || xAxis === null || s.keyX === null ? null : nearestPosition(walked(s, emph), s.keyX, xAxis.scale.domain);
  if (emph === null || x === null) {
    s.clearActive();
    return;
  }
  if (emph.config.kind !== "matrix") showPosition(s, emph, x, false);
  else {
    // The cell stays where it still stands; a column zoomed away gives way
    // to the nearest one still shown, in the same row where it has a value.
    const kept = s.keyCell;
    const mat = emph.materialized as MaterializedSeries;
    const cell = kept !== null && hasCell(mat, { x, y: kept.y }) ? { x, y: kept.y } : columnStart(s, emph, x);
    if (cell !== null) showCell(s, emph, cell, false);
  }
}

/** The keyboard lets go: its emphasis leaves the series layer. */
export function releaseKey(s: ChartScene): void {
  s.keyX = null;
  s.keyCell = null;
  if (s.keyHighlight) {
    s.keyHighlight = false;
    s.setHighlight(null);
  }
}
