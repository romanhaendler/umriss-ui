/* Drawing: the two canvases of a schedule.

   The data canvas carries the grid, the layers in their registration order,
   the overlaps and the selection; the overlay carries hover and the ghost.
   Functions over what they are given - no state of their own, no access to the
   pointer - so that what is drawn follows from the data, the view and the
   interaction state and from nothing else. */

import { resolveColours, removedIntervals } from "@umriss-ui/charts";
import type { LateTransport, Overlap } from "./findings";
import {
  barRect,
  inView,
  laneTop,
  subtaskBox,
  transportPath,
  xOf,
  type SubtaskBox,
  type TransportPath,
  type Viewport,
} from "./geometry";
import { resolveAppearance } from "./appearance";
import type { Subtask } from "./model";
import type { SceneData } from "./sceneData";
import type { ScheduleHit, SceneView } from "./sceneView";

const TOKENS = {
  line: "var(--u-hairline)",
  lineStrong: "var(--u-hairline-strong)",
  text: "var(--u-color-text)",
  muted: "var(--u-color-text-muted)",
  alarm: "var(--u-color-danger)",
  surface: "var(--u-color-surface)",
  accent: "var(--u-color-accent)",
} as const;

export type Colours = Record<keyof typeof TOKENS, string> & { readonly tasks: ReadonlyMap<string, string> };

/** The tokens and the task colours, resolved to values a canvas can draw. */
export function resolveSceneColours(root: Element, data: SceneData): Colours {
  const taskColours: Record<string, string> = {};
  for (const task of data.tasks.values()) taskColours[`task:${task.id}`] = task.color;
  const resolved: Record<string, string> = resolveColours<string>(root, { ...TOKENS, ...taskColours });
  const tasks = new Map<string, string>();
  for (const task of data.tasks.values()) tasks.set(task.id, resolved[`task:${task.id}`] ?? task.color);
  return {
    line: resolved.line!,
    lineStrong: resolved.lineStrong!,
    text: resolved.text!,
    muted: resolved.muted!,
    alarm: resolved.alarm!,
    surface: resolved.surface!,
    accent: resolved.accent!,
    tasks,
  };
}

/** The three channels of a resolved colour, or null where it is not one the
    theme resolved - the canvas gets values like "rgb(37, 99, 235)" back, and
    two places here have to take them apart. */
function channels(colour: string): [number, number, number] | null {
  const parts = colour.match(/[\d.]+/g);
  if (parts === null || parts.length < 3) return null;
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

/** Below this luminance a colour counts as dark and text on it is set light.
    It lies above the middle on purpose: a mid-blue carries white better than
    it carries black. */
const DARK_BELOW = 0.45;

/** Whether a colour is dark enough that text on it should be light - the sRGB
    relative luminance, so that a label reads in both schemes without a caller
    saying so. */
export function isDark(colour: string): boolean {
  const rgb = channels(colour);
  if (rgb === null) return true;
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < DARK_BELOW;
}

/** Sizes a canvas to the plot at the device's pixel ratio and clears it. */
export function prepareCanvas(canvas: HTMLCanvasElement | null, width: number, height: number): CanvasRenderingContext2D | null {
  if (canvas === null) return null;
  const ratio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  const w = Math.round(width * ratio);
  const h = Math.round(height * ratio);
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx === null) return null;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return ctx;
}

/** A drag in flight, as drawing needs it. */
export interface GhostDrawing {
  readonly ghost: Subtask;
  readonly overlaps: readonly Overlap[];
  readonly late: readonly LateTransport[];
}

export interface DrawInput {
  readonly data: SceneData;
  readonly view: SceneView;
  readonly colours: Colours;
  readonly bands: { readonly days: readonly { x: number }[]; readonly ticks: readonly { x: number }[] };
  readonly selectedTask: string | null;
  readonly hover: ScheduleHit;
  readonly ghost: GhostDrawing | null;
}

export function drawData(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const { data, view } = input;
  const viewport = view.viewport();
  drawGrid(ctx, input, viewport);
  drawNow(ctx, input);
  for (const layer of data.layers) {
    const own = new Set<unknown>(layer.data);
    if (layer.kind === "transports") {
      for (const path of view.paths) if (own.has(path.transport)) drawTransport(ctx, input, path, false);
    } else {
      for (const box of view.boxes) if (own.has(box.subtask)) drawSubtask(ctx, input, box, 1);
    }
  }
  for (const overlap of data.overlaps) drawOverlap(ctx, input, viewport, overlap);
  drawSelection(ctx, input);
}

export function drawOverlay(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const { view, colours, hover } = input;
  const viewport = view.viewport();
  if (input.ghost === null) {
    if (hover.kind === "subtask") {
      const box = view.boxById.get(hover.subtask.id);
      if (box !== undefined) {
        ctx.strokeStyle = colours.text;
        ctx.lineWidth = 1;
        ctx.strokeRect(box.outerFrom - 1.5, box.y - 1.5, box.outerTo - box.outerFrom + 3, box.height + 3);
      }
    } else if (hover.kind === "transport") {
      const path = view.paths.find((p) => p.transport === hover.transport);
      if (path !== undefined) drawTransport(ctx, input, path, true);
    }
    return;
  }
  const { ghost, overlaps, late } = input.ghost;
  const box = ghostBox(input, viewport, ghost);
  if (box === null) return;
  for (const overlap of overlaps) drawOverlap(ctx, input, viewport, overlap);
  const lateIds = new Set(late.map((l) => l.transport));
  for (const transport of input.data.transports) {
    if (transport.from !== ghost.id && transport.to !== ghost.id) continue;
    const other = view.boxById.get(transport.from === ghost.id ? transport.to : transport.from);
    if (other === undefined) continue;
    const path =
      transport.from === ghost.id
        ? transportPath(viewport, transport, box, other, view.options)
        : transportPath(viewport, transport, other, box, view.options);
    drawTransport(ctx, input, path, true, lateIds.has(transport.id));
  }
  drawSubtask(ctx, input, box, 0.55);
  ctx.strokeStyle = input.colours.text;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.strokeRect(box.outerFrom + 0.5, box.y + 0.5, Math.max(1, box.outerTo - box.outerFrom - 1), box.height - 1);
  ctx.setLineDash([]);
}

/** Where the ghost is drawn: on its lane, without an offset. */
export function ghostBox(input: Pick<DrawInput, "data">, viewport: Viewport, ghost: Subtask): SubtaskBox | null {
  const lane = input.data.laneIndex.get(ghost.lane);
  return lane === undefined ? null : subtaskBox(viewport, ghost, lane, 0);
}

function drawGrid(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport): void {
  const { view, colours, bands } = input;
  const { width, height } = view;
  ctx.lineWidth = 1;
  ctx.strokeStyle = colours.line;
  ctx.beginPath();
  for (const tick of bands.ticks) {
    ctx.moveTo(tick.x + 0.5, 0);
    ctx.lineTo(tick.x + 0.5, height);
  }
  for (let i = 1; i <= input.data.lanes.length; i++) {
    const y = laneTop(viewport, i) - 0.5;
    if (y < 0 || y > height) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.strokeStyle = colours.lineStrong;
  ctx.beginPath();
  for (const day of bands.days) {
    ctx.moveTo(day.x + 0.5, 0);
    ctx.lineTo(day.x + 0.5, height);
  }
  ctx.stroke();
  /* A seam of the operating calendar: time was taken out here, and the plot
     says so as the axis does. */
  const seams = removedIntervals(view.options.calendar);
  if (seams.length > 0) {
    ctx.strokeStyle = colours.muted;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    for (const seam of seams) {
      const x = Math.round(viewport.scale.toPx(seam.operatingTime)) + 0.5;
      if (x < 0 || x > width) continue;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* The present, across the lanes: above the grid, beneath the work - a subtask
   that runs now is in front of the line, not crossed out by it. */
function drawNow(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const x = input.view.nowX();
  if (x === null) return;
  ctx.fillStyle = input.colours.accent;
  ctx.fillRect(x, 0, 2, input.view.height);
}

function drawSubtask(ctx: CanvasRenderingContext2D, input: DrawInput, box: SubtaskBox, alpha: number): void {
  const { view, colours } = input;
  if (!inView(box, view.width, view.height)) return;
  const look = resolveAppearance(box.subtask.appearance);
  const colour = colours.tasks.get(box.subtask.task) ?? colours.muted;

  /* Muted is drawn SLIM, not faint: a faint bar would read as a setup, which
     is exactly what a faint fill means everywhere else in this picture. Half
     the height, the whole colour - another shift's work, unmistakably lesser
     and unmistakably not a setup. The rule stands in `geometry.ts`, because a
     bar's label has to lie on the bar as it is drawn. */
  const { top, height } = barRect(box);

  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  /* Setup and teardown: the task's colour, faint, with its edge - preparation
     reads as belonging to the work, and as not being it. */
  for (const [from, to] of [
    [box.outerFrom, box.mainFrom],
    [box.mainTo, box.outerTo],
  ] as const) {
    if (to <= from) continue;
    ctx.globalAlpha = 0.28 * alpha;
    ctx.fillRect(from, top, to - from, height);
    ctx.globalAlpha = alpha;
    ctx.strokeRect(from + 0.5, top + 0.5, to - from - 1, height - 1);
  }

  const width = Math.max(1, box.mainTo - box.mainFrom);
  ctx.globalAlpha = look.dashed ? alpha * 0.45 : alpha;
  ctx.fillRect(box.mainFrom, top, width, height);

  if (look.hatched) hatch(ctx, box.mainFrom, top, width, height, colours.surface, alpha);

  /* Progress is a rail along the bottom of the bar, not a lighter remainder:
     a lighter part of a bar is a setup or a teardown in this picture, and a
     planner must not have to ask which of the two a pale end is. */
  const share = box.subtask.progress;
  if (share !== undefined) {
    const done = Math.round(width * Math.max(0, Math.min(1, share)));
    const rail = Math.min(4, Math.max(2, Math.round(height / 6)));
    ctx.globalAlpha = 0.35 * alpha;
    ctx.fillStyle = isDark(colour) ? colours.surface : colours.text;
    ctx.fillRect(box.mainFrom, top + height - rail, width, rail);
    ctx.globalAlpha = alpha;
    if (done > 0) ctx.fillRect(box.mainFrom, top + height - rail, done, rail);
    ctx.fillStyle = colour;
  }

  if (look.dashed) {
    /* Planned, not released: the outline says it, and it survives a colour a
       caller chose badly. */
    ctx.globalAlpha = alpha;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(box.mainFrom + 0.5, top + 0.5, width - 1, height - 1);
    ctx.setLineDash([]);
  }

  if (look.open) fadeEnd(ctx, box, top, height, colours.surface, view.width);
  ctx.globalAlpha = 1;
  /* An offset bar lies over the one it covers; an edge in the surface colour
     keeps the two apart. */
  if (box.depth > 0 && alpha === 1) {
    ctx.strokeStyle = colours.surface;
    ctx.strokeRect(box.outerFrom - 0.5, top - 0.5, box.outerTo - box.outerFrom + 1, height + 1);
  }
}

/** The distance between two lines of the hatch, and how far a bar that runs on
    fades into the surface - both in pixels. */
const HATCH_STEP = 7;
const FADE_SPAN = 16;

/** Diagonal lines in the surface colour, clipped to the main time: the mark of
    work that may not be moved. */
function hatch(
  ctx: CanvasRenderingContext2D,
  from: number,
  top: number,
  width: number,
  height: number,
  surface: string,
  weight: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(from, top, width, height);
  ctx.clip();
  ctx.globalAlpha = 0.5 * weight;
  ctx.strokeStyle = surface;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = from - height; x < from + width + height; x += HATCH_STEP) {
    ctx.moveTo(x, top + height);
    ctx.lineTo(x + height, top);
  }
  ctx.stroke();
  ctx.restore();
}

/** The end of a bar that continues past what is drawn: it fades into the
    surface instead of ending in an edge a reader would take for its end - and
    it fades at the edge of the VIEW where the bar's own end lies beyond it,
    because that is the edge a reader would misread. */
function fadeEnd(
  ctx: CanvasRenderingContext2D,
  box: SubtaskBox,
  top: number,
  height: number,
  surface: string,
  plotWidth: number,
): void {
  const end = Math.min(box.mainTo, plotWidth);
  const width = Math.max(1, end - box.mainFrom);
  const span = Math.min(FADE_SPAN, width);
  const gradient = ctx.createLinearGradient(end - span, 0, end, 0);
  gradient.addColorStop(0, withAlpha(surface, 0));
  gradient.addColorStop(1, withAlpha(surface, 1));
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(end - span, top, span, height);
}

/** A resolved colour with an alpha of its own. The theme hands back
    "rgb(…)" or "rgba(…)"; a gradient needs both ends as real colours. */
function withAlpha(colour: string, alpha: number): string {
  const rgb = channels(colour);
  if (rgb === null) return colour;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function drawTransport(ctx: CanvasRenderingContext2D, input: DrawInput, path: TransportPath, emphasised: boolean, late?: boolean): void {
  const { data, colours } = input;
  const task = data.taskOfTransport(path.transport);
  const isLate = late ?? data.lateById.has(path.transport.id);
  const selected = task !== null && task === input.selectedTask;
  const colour = isLate ? colours.alarm : (task !== null ? colours.tasks.get(task) : undefined) ?? colours.muted;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = emphasised || selected ? 2 : 1.25;
  ctx.setLineDash(isLate ? [4, 3] : []);
  ctx.beginPath();
  ctx.moveTo(path.x1, path.y1);
  if (path.kind === "curve") {
    ctx.bezierCurveTo(path.c1x, path.y1, path.c2x, path.y2, path.x2, path.y2);
  } else {
    /* Straight and orthogonal are drawn as the polyline they are hit along:
       one line, one truth. */
    for (let i = 2; i + 1 < path.points.length; i += 2) ctx.lineTo(path.points[i]!, path.points[i + 1]!);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  if (path.ends === "dot") {
    for (const [x, y] of [
      [path.x1, path.y1],
      [path.x2, path.y2],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, isLate ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawOverlap(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport, overlap: Overlap): void {
  const lane = input.data.laneIndex.get(overlap.lane);
  if (lane === undefined) return;
  const x0 = xOf(viewport, overlap.from);
  const x1 = Math.max(x0 + 2, xOf(viewport, overlap.to));
  const top = laneTop(viewport, lane);
  ctx.fillStyle = input.colours.alarm;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(x0, top + 1, x1 - x0, input.view.options.laneHeight - 2);
  ctx.globalAlpha = 1;
  ctx.fillRect(x0, top + 1, x1 - x0, 3);
}

function drawSelection(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const task = input.selectedTask;
  if (task === null) return;
  ctx.strokeStyle = input.colours.text;
  ctx.lineWidth = 2;
  for (const box of input.view.boxes) {
    if (box.subtask.task !== task) continue;
    ctx.strokeRect(box.outerFrom - 1, box.y - 1, box.outerTo - box.outerFrom + 2, box.height + 2);
  }
}
