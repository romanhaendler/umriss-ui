/* Canvas drawing code (R-2.12, R-2.13, R-3.5, R-4.2, R-4.4, R-4.5).

   Principles:
   - Exactly one stroke() call per series; gaps produce a moveTo, not separate
     stroke calls. No drawing per point.
   - Markers are a batched pass of their own.
   - The domain→pixel calculation is taken from the scale as a line equation
     (m, b) and computed inline in the loop: monomorphic, allocation-free.
   - Series are clipped to the plot area.
   - 1-px lines lie on half pixels, so that they are crisp at DPR 1. */

import { segmentEnd } from "./state";
import type { AxisLayout } from "./layout";
import type { ResolvedTheme } from "./theme";
import type { HoverState, Rect, Scale } from "./types";

/** What every series kind needs in order to be drawn: the channels, both scales,
    the colour. */
export interface DrawBase {
  x: Float64Array;
  y: Float64Array;
  length: number;
  xScale: Scale;
  yScale: Scale;
  color: string;
  alpha: number;
}

export interface LineDrawItem extends DrawBase {
  kind: "line";
  strokeWidth: number;
  dash?: readonly number[];
  markers: "auto" | "always" | "never";
  step?: boolean;
}

export interface AreaDrawItem extends DrawBase {
  kind: "area";
  /** Lower edge per point; null = the fixed baseline at `baseline`. */
  y0: Float64Array | null;
  /** Fixed lower edge in domain space; only effective where y0 is null. */
  baseline: number;
  fillOpacity: number;
  strokeWidth: number;
  dash?: readonly number[];
}

export interface BarDrawItem extends DrawBase {
  kind: "bar";
  /** Fixed lower edge in domain space. */
  baseline: number;
  /** Left edge relative to the x value, in domain units (ADR-0002). */
  offset: number;
  /** Bar width in domain units. */
  width: number;
}

export interface ScatterDrawItem extends DrawBase {
  kind: "scatter";
  radius: number;
}

export interface StateDrawItem extends DrawBase {
  kind: "state";
  /** Colours per state code, resolved once per frame. The loop reads a colour
      through its index and never resolves a CSS variable. */
  colors: readonly string[];
  /** Lane in pixels - top and bottom, in container coordinates. */
  laneTop: number;
  laneBottom: number;
  /** Where the last segment ends (lastSegmentEnd). */
  lastEnd: number;
}

export interface MatrixDrawItem extends DrawBase {
  kind: "matrix";
  /** Bucket per point: the index into colors, or -1 for a hole. Computed once
      per frame, so that the loop calls no function per cell. */
  buckets: Int32Array;
  colors: readonly string[];
  /** Cell edges in domain units. */
  width: number;
  height: number;
}

/** Mirrors the union of the series configuration (types.ts). */
export type SeriesDrawItem =
  | LineDrawItem
  | AreaDrawItem
  | BarDrawItem
  | ScatterDrawItem
  | StateDrawItem
  | MatrixDrawItem;

/** A limit, ready in pixels. A band carries two edges, a line twice the same
    one. */
export interface LimitDrawItem {
  orientation: "x" | "y";
  fromPx: number;
  toPx: number;
  color: string;
  band: boolean;
  /** Dash pattern; empty means solid. It carries the difference between a chosen
      and a calculated limit (ADR-0008). */
  dash: readonly number[];
}

export interface SeriesLayerInput {
  width: number;
  height: number;
  plot: Rect;
  axes: readonly AxisLayout[];
  theme: ResolvedTheme;
  series: readonly SeriesDrawItem[];
  /** Bands lie below every series, lines above every series. Two answers,
      because they are two things: a filled area behind a curve is ground, a
      single line is a landmark. One common answer hides one of the two as soon
      as an area series lies in the same chart - and since mixed kinds, that is
      the normal case. */
  limitBands: readonly LimitDrawItem[];
  limitLines: readonly LimitDrawItem[];
}

/** Align 1-px lines to half pixels (R-3.5). */
function crisp(px: number): number {
  return Math.round(px) + 0.5;
}

function drawGrid(ctx: CanvasRenderingContext2D, input: SeriesLayerInput): void {
  const { plot, axes, theme } = input;
  const x1 = plot.x;
  const x2 = plot.x + plot.width;
  const y1 = plot.y;
  const y2 = plot.y + plot.height;

  ctx.lineWidth = 1;
  for (const axis of axes) {
    if (!axis.grid) continue;
    // The zero line is stronger than the rest of the grid (R-4.2).
    for (const pass of [0, 1] as const) {
      const zeroLine = pass === 1;
      ctx.beginPath();
      let any = false;
      for (const tick of axis.ticks) {
        const isZero = axis.orientation === "y" && tick.value === 0;
        if (isZero !== zeroLine) continue;
        any = true;
        if (axis.orientation === "y") {
          const py = crisp(tick.px);
          ctx.moveTo(x1, py);
          ctx.lineTo(x2, py);
        } else {
          const px = crisp(tick.px);
          ctx.moveTo(px, y1);
          ctx.lineTo(px, y2);
        }
      }
      if (!any) continue;
      ctx.strokeStyle = zeroLine ? theme.colorAxis : theme.colorGrid;
      ctx.stroke();
    }
  }
}

/* ---------------- Line (R-2.12, R-4.4, R-4.5) ---------------- */

/** From this number of points on, markers="auto" marks only isolated points
    (R-4.5). */
const MARKER_LIMIT = 60;

/** Is the value at i present, with a gap or the edge on either side? Such a
    point is a lone moveTo in the path - no stroke, no pixel - and only a marker
    shows it (Q23). */
function isolated(ys: Float64Array, n: number, i: number): boolean {
  return (
    (i === 0 || Number.isNaN(ys[i - 1] as number)) &&
    (i === n - 1 || Number.isNaN(ys[i + 1] as number))
  );
}

function drawLine(ctx: CanvasRenderingContext2D, item: LineDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const ym = item.yScale.m;
  const yb = item.yScale.b;
  const xs = item.x;
  const ys = item.y;

  const step = item.step === true;
  const path = new Path2D();
  let penDown = false;
  let held = 0; // a step line's last y in pixels
  for (let i = 0; i < n; i++) {
    const value = ys[i] as number;
    const px = (xs[i] as number) * xm + xb;
    if (Number.isNaN(value)) {
      // A held value holds until the gap's x: that sample says it is no longer
      // known from there, not that it never was.
      if (step && penDown) path.lineTo(px, held);
      penDown = false; // gap (R-2.5)
      continue;
    }
    const py = value * ym + yb;
    if (penDown) {
      if (step) path.lineTo(px, held);
      path.lineTo(px, py);
    } else {
      path.moveTo(px, py);
      penDown = true;
    }
    held = py;
  }

  ctx.strokeStyle = item.color;
  ctx.lineWidth = item.strokeWidth;
  if (item.dash !== undefined && item.dash.length > 0) {
    ctx.setLineDash(item.dash as number[]);
  } else {
    ctx.setLineDash([]);
  }
  ctx.stroke(path); // exactly one stroke per series (R-2.12)
  ctx.setLineDash([]);

  if (item.markers !== "never") {
    const every = item.markers === "always" || n <= MARKER_LIMIT;
    const r = item.strokeWidth + 1.5;
    const points = new Path2D();
    for (let i = 0; i < n; i++) {
      const value = ys[i] as number;
      if (Number.isNaN(value)) continue;
      if (!every && !isolated(ys, n, i)) continue;
      const px = (xs[i] as number) * xm + xb;
      const py = value * ym + yb;
      points.moveTo(px + r, py);
      points.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = item.color;
    ctx.fill(points); // batched marker pass
  }
}

/* ---------------- Area ----------------

   Two paths over the same channels: the fill closes along the lower edge, the
   outline follows only the upper one. A shared path would be the way by which
   the baseline gets stroked along.

   A gap in either channel ends the current section; the next present point
   begins a new one. A gap is a hole, not a straight line across it (R-2.5).
   A section of one point has no width to fill: it is a stroke from its foot to
   its value, or it would not be drawn at all (Q23). */

function drawArea(ctx: CanvasRenderingContext2D, item: AreaDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const ym = item.yScale.m;
  const yb = item.yScale.b;
  const xs = item.x;
  const ys = item.y;
  const us = item.y0;
  const baselinePx = item.baseline * ym + yb;

  const fill = new Path2D();
  const outline = new Path2D();
  const lone = new Path2D();
  let i = 0;
  while (i < n) {
    while (
      i < n &&
      (Number.isNaN(ys[i] as number) || (us !== null && Number.isNaN(us[i] as number)))
    ) {
      i++;
    }
    if (i >= n) break;
    const start = i;
    while (
      i < n &&
      !Number.isNaN(ys[i] as number) &&
      (us === null || !Number.isNaN(us[i] as number))
    ) {
      i++;
    }
    const end = i - 1;

    if (start === end) {
      const px = (xs[start] as number) * xm + xb;
      lone.moveTo(px, us === null ? baselinePx : (us[start] as number) * ym + yb);
      lone.lineTo(px, (ys[start] as number) * ym + yb);
      continue;
    }

    for (let k = start; k <= end; k++) {
      const px = (xs[k] as number) * xm + xb;
      const py = (ys[k] as number) * ym + yb;
      if (k === start) {
        fill.moveTo(px, py);
        outline.moveTo(px, py);
      } else {
        fill.lineTo(px, py);
        outline.lineTo(px, py);
      }
    }
    if (us === null) {
      fill.lineTo((xs[end] as number) * xm + xb, baselinePx);
      fill.lineTo((xs[start] as number) * xm + xb, baselinePx);
    } else {
      for (let k = end; k >= start; k--) {
        fill.lineTo((xs[k] as number) * xm + xb, (us[k] as number) * ym + yb);
      }
    }
    fill.closePath();
  }

  ctx.globalAlpha = item.alpha * item.fillOpacity;
  ctx.fillStyle = item.color;
  ctx.fill(fill);

  ctx.globalAlpha = item.alpha;
  ctx.strokeStyle = item.color;
  if (item.strokeWidth > 0) {
    ctx.setLineDash((item.dash ?? []) as number[]);
    ctx.lineWidth = item.strokeWidth;
    ctx.stroke(outline);
  }
  ctx.setLineDash([]);
  // Even without an outline: a lone point has nothing else to be seen by.
  ctx.lineWidth = Math.max(1, item.strokeWidth);
  ctx.stroke(lone);
}

/* ---------------- Bars (ADR-0002) ----------------

   Offset and width come in in domain units and are turned into pixels with the
   slope of the x scale - a distance, not a place, hence without the intercept.
   One Path2D for the whole series, one fill(). */

function drawBars(ctx: CanvasRenderingContext2D, item: BarDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const ym = item.yScale.m;
  const yb = item.yScale.b;
  const xs = item.x;
  const ys = item.y;
  const baselinePx = item.baseline * ym + yb;
  const edgePx = item.offset * xm;
  const widthPx = item.width * xm;

  const path = new Path2D();
  for (let i = 0; i < n; i++) {
    const value = ys[i] as number;
    if (Number.isNaN(value)) continue; // a gap leaves its bar out (R-2.5)
    const px = (xs[i] as number) * xm + xb + edgePx;
    const py = value * ym + yb;
    path.rect(px, py, widthPx, baselinePx - py);
  }
  ctx.fillStyle = item.color;
  ctx.fill(path);
}

/* ---------------- Scatter ----------------

   No connecting path: a scatter claims no order between its points. One Path2D
   for the whole series, one fill() - the same batched move as the marker pass of
   the line. */

function drawScatter(ctx: CanvasRenderingContext2D, item: ScatterDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const ym = item.yScale.m;
  const yb = item.yScale.b;
  const xs = item.x;
  const ys = item.y;
  const r = item.radius;

  const points = new Path2D();
  for (let i = 0; i < n; i++) {
    const value = ys[i] as number;
    if (Number.isNaN(value)) continue; // a gap leaves its point out (R-2.5)
    const px = (xs[i] as number) * xm + xb;
    const py = value * ym + yb;
    points.moveTo(px + r, py);
    points.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fillStyle = item.color;
  ctx.fill(points);
}


/* ---------------- State band (ADR-0007) ----------------

   A segment runs from the x value of one point to the x value of the next; the
   last one to the end of the domain, because otherwise the current state would
   be missing - and that is the one read first.

   One path per state, not per segment: the set of states is small and closed, so
   this costs as many fill() calls as there are states and not as many as there
   are changes. */

function drawStateBand(ctx: CanvasRenderingContext2D, item: StateDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const xs = item.x;
  const ys = item.y;
  const top = item.laneTop;
  const height = item.laneBottom - item.laneTop;
  const count = item.colors.length;
  if (count === 0 || height <= 0) return;

  const paths: Path2D[] = [];
  for (let k = 0; k < count; k++) paths.push(new Path2D());
  let any = false;

  for (let i = 0; i < n; i++) {
    const code = ys[i] as number;
    // A gap is a hole: not drawn, and not in a colour for "unknown". A colour
    // would be a claim about the interval.
    if (Number.isNaN(code)) continue;
    const k = code | 0;
    const path = paths[k];
    if (path === undefined) continue; // code outside the state list
    const from = xs[i] as number;
    const to = segmentEnd(xs, n, i, item.lastEnd);
    if (!(to > from)) continue;
    path.rect(from * xm + xb, top, (to - from) * xm, height);
    any = true;
  }
  if (!any) return;

  for (let k = 0; k < count; k++) {
    ctx.fillStyle = item.colors[k] as string;
    ctx.fill(paths[k] as Path2D);
  }
}

/* ---------------- Matrix (ADR-0002 in two dimensions) ----------------

   The colour per cell already stands as a bucket index when this loop runs. One
   path per bucket: the same batched move as with the state band, and for the same
   reason - the number of colours is small, the number of cells is not. */

function drawMatrix(ctx: CanvasRenderingContext2D, item: MatrixDrawItem): void {
  const n = item.length;
  const xm = item.xScale.m;
  const xb = item.xScale.b;
  const ym = item.yScale.m;
  const yb = item.yScale.b;
  const xs = item.x;
  const ys = item.y;
  const buckets = item.buckets;
  const count = item.colors.length;
  if (count === 0) return;

  // Width and height are distances, not places: without the intercept.
  // The y slope is negative (domain minimum at the bottom), hence the absolute
  // value.
  const widthPx = item.width * xm;
  const heightPx = Math.abs(item.height * ym);

  const paths: Path2D[] = [];
  for (let k = 0; k < count; k++) paths.push(new Path2D());

  for (let i = 0; i < n; i++) {
    const k = buckets[i] as number;
    if (k < 0) continue; // hole (R-2.5)
    const path = paths[k];
    if (path === undefined) continue;
    // A cell is centred on its pair of values.
    const px = (xs[i] as number) * xm + xb - widthPx / 2;
    const py = (ys[i] as number) * ym + yb - heightPx / 2;
    path.rect(px, py, widthPx, heightPx);
  }

  for (let k = 0; k < count; k++) {
    ctx.fillStyle = item.colors[k] as string;
    ctx.fill(paths[k] as Path2D);
  }
}

/* ---------------- Limits ---------------- */

function drawLimits(
  ctx: CanvasRenderingContext2D,
  plot: Rect,
  limits: readonly LimitDrawItem[],
): void {
  for (const g of limits) {
    if (g.band) {
      const a = Math.min(g.fromPx, g.toPx);
      const b = Math.max(g.fromPx, g.toPx);
      ctx.fillStyle = g.color;
      ctx.save();
      // A band is ground, not a mark: it carries only enough opacity to make the
      // zone readable, without colouring the data above it.
      ctx.globalAlpha = 0.12;
      if (g.orientation === "y") {
        ctx.fillRect(plot.x, a, plot.width, b - a);
      } else {
        ctx.fillRect(a, plot.y, b - a, plot.height);
      }
      ctx.restore();
      continue;
    }
    ctx.beginPath();
    if (g.orientation === "y") {
      const py = crisp(g.fromPx);
      ctx.moveTo(plot.x, py);
      ctx.lineTo(plot.x + plot.width, py);
    } else {
      const px = crisp(g.fromPx);
      ctx.moveTo(px, plot.y);
      ctx.lineTo(px, plot.y + plot.height);
    }
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 1;
    ctx.setLineDash(g.dash as number[]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawSeriesLayer(
  ctx: CanvasRenderingContext2D,
  input: SeriesLayerInput,
): void {
  const { width, height, plot, series } = input;
  ctx.clearRect(0, 0, width, height);
  if (plot.width <= 0 || plot.height <= 0) return;

  drawGrid(ctx, input);

  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.x, plot.y, plot.width, plot.height);
  ctx.clip(); // R-2.13

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Bands first: they are ground.
  ctx.globalAlpha = 1;
  drawLimits(ctx, plot, input.limitBands);

  for (const item of series) {
    if (item.length === 0) continue;
    ctx.globalAlpha = item.alpha;
    // Exactly one branch per series, outside the point loop: the calculation in
    // the loop thereby stays monomorphic and allocation-free (R-5.2).
    switch (item.kind) {
      case "line":
        drawLine(ctx, item);
        break;
      case "area":
        drawArea(ctx, item);
        break;
      case "bar":
        drawBars(ctx, item);
        break;
      case "scatter":
        drawScatter(ctx, item);
        break;
      case "state":
        drawStateBand(ctx, item);
        break;
      case "matrix":
        drawMatrix(ctx, item);
        break;
    }
  }

  // Lines last: they are landmarks and must stay visible above a filled area.
  ctx.globalAlpha = 1;
  drawLimits(ctx, plot, input.limitLines);

  ctx.restore();
}

export interface OverlayLayerInput {
  width: number;
  height: number;
  plot: Rect;
  theme: ResolvedTheme;
  hover: HoverState | null;
  /** The crosshair another chart's pointer asks for (`syncId`); the own
      hover wins. */
  syncPx: number | null;
}

export function drawOverlayLayer(
  ctx: CanvasRenderingContext2D,
  input: OverlayLayerInput,
): void {
  const { width, height, plot, theme, hover } = input;
  ctx.clearRect(0, 0, width, height);
  const at = hover?.hit.xPx ?? input.syncPx;
  if (at === null || plot.width <= 0 || plot.height <= 0) return;

  // Crosshair at the snapped x pixel position (R-4.7).
  const px = crisp(at);
  if (px >= plot.x && px <= plot.x + plot.width) {
    ctx.beginPath();
    ctx.moveTo(px, plot.y);
    ctx.lineTo(px, plot.y + plot.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = theme.colorAxis;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // Hover marker: fill in the series colour, a 2-px ring in the background
  // colour (R-4.5). The overlay is not clipped: a reading beyond a zoomed edge
  // - the nearest one can lie there - gets no marker on the axis.
  for (const marker of hover?.marker ?? []) {
    if (marker.x < plot.x || marker.x > plot.x + plot.width || marker.y < plot.y || marker.y > plot.y + plot.height) {
      continue;
    }
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = theme.colorBg;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = marker.color;
    ctx.fill();
  }
}
