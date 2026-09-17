/* Drawing: the two canvases of a schedule.

   The data canvas carries the grid, the layers in their registration order,
   the overlaps and the selection; the overlay carries hover and the ghost.
   Functions over what they are given - no state of their own, no access to the
   pointer - so that what is drawn follows from the data, the view and the
   interaction state and from nothing else. */

import { resolveColours, removedIntervals } from "@umriss-ui/charts";
import type { LateTransport, Overlap } from "./findings";
import { laneTop, subtaskBox, transportPath, xOf, type SubtaskBox, type TransportPath, type Viewport } from "./geometry";
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

/** Whether a colour is dark enough that text on it should be light.

    The sRGB relative luminance of the resolved colour - the canvas gets a
    value like "rgb(37, 99, 235)" back from the theme, and a label lying on it
    has to be readable in both schemes without a caller saying so. */
export function isDark(colour: string): boolean {
  const parts = colour.match(/[\d.]+/g);
  if (parts === null || parts.length < 3) return true;
  const [r, g, b] = parts.slice(0, 3).map((part) => {
    const channel = Number(part) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
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
  if (box.outerTo < 0 || box.outerFrom > view.width || box.y + box.height < 0 || box.y > view.height) return;
  const colour = colours.tasks.get(box.subtask.task) ?? colours.muted;
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
    ctx.fillRect(from, box.y, to - from, box.height);
    ctx.globalAlpha = alpha;
    ctx.strokeRect(from + 0.5, box.y + 0.5, to - from - 1, box.height - 1);
  }
  ctx.globalAlpha = alpha;
  ctx.fillRect(box.mainFrom, box.y, Math.max(1, box.mainTo - box.mainFrom), box.height);
  ctx.globalAlpha = 1;
  /* An offset bar lies over the one it covers; an edge in the surface colour
     keeps the two apart. */
  if (box.depth > 0 && alpha === 1) {
    ctx.strokeStyle = colours.surface;
    ctx.strokeRect(box.outerFrom - 0.5, box.y - 0.5, box.outerTo - box.outerFrom + 1, box.height + 1);
  }
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
