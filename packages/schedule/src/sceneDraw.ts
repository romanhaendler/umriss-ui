/* Drawing: the two canvases of a schedule.

   The data canvas carries the grid, the layers in their registration order,
   the overlaps and the selection; the overlay carries hover and the ghost.
   Functions over what they are given - no state of their own, no access to the
   pointer - so that what is drawn follows from the data, the view and the
   interaction state and from nothing else. */

import { resolveColours, removedIntervals } from "@umriss-ui/charts";
import type { ViolatedDependency, Overlap } from "./findings";
import {
  CAP,
  CAP_INSET,
  inView,
  slotAt,
  subtaskBox,
  dependencyPath,
  xOf,
  type SubtaskBox,
  type DependencyPath,
  type Viewport,
} from "./geometry";
import { resolveAppearance, type ResolvedAppearance } from "./appearance";
import { rowAt, slotOf } from "./rows";
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
  /* The active subtask's mark - drawn in a colour of its own only under
     forced colours; outside them it is the hover's wash (`drawHover`). */
  active: "var(--u-color-accent)",
  now: "var(--u-color-accent)",
  /* What text and marks take ON a filled bar - the same token the bar labels
     use in CSS, so a cap and the label beside it are one colour. */
  onAccent: "var(--u-color-on-accent)",
} as const;

export type Colours = Record<keyof typeof TOKENS, string> & {
  readonly tasks: ReadonlyMap<string, string>;
  /** The page is in forced colours: every colour above is a system colour. */
  readonly forced: boolean;
};

/* Under forced colours - the Windows contrast mode - the browser repaints the
   page around the plot and none of its pixels, so the plot paints itself in
   the system colours the page now wears (forced-colors 03), as the charts do
   (charts-alternatives C4): the work in the text colour whatever its task's
   colour - lane and label tell the tasks apart - and lines in GrayText. The
   selection colour is the active subtask's alone (forced-colors 04): the
   findings take the text colour and say what they are by a dash, and the
   present steps back to GrayText. A system colour an author names is kept
   under forced colours, so the probe reads these back as they are. */
const FORCED: Record<keyof typeof TOKENS, string> = {
  line: "GrayText",
  lineStrong: "CanvasText",
  text: "CanvasText",
  muted: "GrayText",
  alarm: "CanvasText",
  surface: "Canvas",
  active: "Highlight",
  now: "GrayText",
  onAccent: "Canvas",
};

/** The colours the canvas names, before they are resolved: the tokens, or
    the system colours under forced colours. */
export const canvasTokens = (forced: boolean): Readonly<Record<keyof typeof TOKENS, string>> => (forced ? FORCED : TOKENS);

const forcedColours = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(forced-colors: active)").matches;

/** The tokens and the task colours, resolved to values a canvas can draw. */
export function resolveSceneColours(root: Element, data: SceneData): Colours {
  const forced = forcedColours();
  const taskColours: Record<string, string> = {};
  for (const task of data.tasks.values()) taskColours[`task:${task.id}`] = forced ? FORCED.text : task.color;
  const resolved: Record<string, string> = resolveColours<string>(root, { ...canvasTokens(forced), ...taskColours });
  const tasks = new Map<string, string>();
  for (const task of data.tasks.values()) tasks.set(task.id, resolved[`task:${task.id}`] ?? task.color);
  return {
    line: resolved.line!,
    lineStrong: resolved.lineStrong!,
    text: resolved.text!,
    muted: resolved.muted!,
    alarm: resolved.alarm!,
    surface: resolved.surface!,
    active: resolved.active!,
    now: resolved.now!,
    onAccent: resolved.onAccent!,
    tasks,
    forced,
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

/** The sRGB relative luminance of a resolved colour, 0 to 1. */
function luminance(colour: string): number {
  const rgb = channels(colour);
  if (rgb === null) return 0;
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The contrast ratio between two resolved colours, 1 to 21 - the measure
    WCAG defines, used here to CHOOSE between two candidates rather than to
    judge either of them. */
function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
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
  readonly violated: readonly ViolatedDependency[];
  /** The lanes this work may not go to, for the whole run of the gesture. */
  readonly refusedLanes: ReadonlySet<string>;
  /** The pointer, while it stands on a refused lane and the ghost therefore
      is not following it; null otherwise. */
  readonly tether: { readonly x: number; readonly y: number } | null;
}

export interface DrawInput {
  readonly data: SceneData;
  readonly view: SceneView;
  readonly colours: Colours;
  readonly bands: { readonly days: readonly { x: number }[]; readonly ticks: readonly { x: number }[] };
  readonly selectedTask: string | null;
  /** The subtask the last click was on, where it belongs to the selected task.
      Selection takes a whole task; this says which of its bars was touched. */
  readonly selectedSubtask: string | null;
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
    if (layer.kind === "dependencies") {
      for (const path of view.paths) if (own.has(path.dependency)) drawDependency(ctx, input, path, false);
    } else {
      for (const box of view.boxes) if (own.has(box.subtask)) drawSubtask(ctx, input, box, 1);
    }
  }
  for (const overlap of data.overlaps) drawOverlap(ctx, input, viewport, overlap);
  drawViolatedInFolds(ctx, input, viewport);
  drawSelection(ctx, input);
}

export function drawOverlay(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const { view, hover } = input;
  const viewport = view.viewport();
  if (input.ghost === null) {
    if (hover.kind === "subtask") {
      const box = view.boxById.get(hover.subtask.id);
      if (box !== undefined) drawHover(ctx, input, box);
    } else if (hover.kind === "dependency") {
      const path = view.paths.find((p) => p.dependency === hover.dependency);
      if (path !== undefined) drawDependency(ctx, input, path, true);
    }
    return;
  }
  const { ghost, overlaps, violated } = input.ghost;
  /* Under everything the drag draws: the lanes this work may not go to are a
     property of the plot while the gesture runs, not of the ghost. */
  drawRefusedLanes(ctx, input, viewport, input.ghost.refusedLanes);
  const box = ghostBox(viewport, ghost);
  if (box === null) return;
  for (const overlap of overlaps) drawOverlap(ctx, input, viewport, overlap);
  const violatedIds = new Set(violated.map((l) => l.dependency));
  for (const dependency of input.data.dependencies) {
    if (dependency.from !== ghost.id && dependency.to !== ghost.id) continue;
    const other = view.boxById.get(dependency.from === ghost.id ? dependency.to : dependency.from);
    if (other === undefined) continue;
    const path =
      dependency.from === ghost.id
        ? dependencyPath(viewport, dependency, box, other, view.options)
        : dependencyPath(viewport, dependency, other, box, view.options);
    drawDependency(ctx, input, path, true, violatedIds.has(dependency.id));
  }
  drawSubtask(ctx, input, box, 0.55);
  ctx.strokeStyle = input.colours.text;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.strokeRect(box.outerFrom + 0.5, box.y + 0.5, Math.max(1, box.outerTo - box.outerFrom - 1), box.height - 1);
  ctx.setLineDash([]);
  if (input.ghost.tether !== null) drawTether(ctx, input, box, input.ghost.tether);
}

/** The lanes a drag in flight may not put its work on: drawn back under a wash
    of the surface, and hatched.

    The hatch is here and nowhere else on the plot. "Not available" is what a
    hatch says on a plan - which is a statement about a PLACE, not about a bar,
    and the bars gave it up for that reason (schedule-lane-groups 02). No
    warning colour: a mould that fits one press is nobody's mistake
    (CONTEXT.md, **Refusal**). */
function drawRefusedLanes(
  ctx: CanvasRenderingContext2D,
  input: DrawInput,
  viewport: Viewport,
  lanes: ReadonlySet<string>,
): void {
  if (lanes.size === 0) return;
  const { width, height } = input.view;
  for (const id of lanes) {
    const slot = slotAt(viewport, id);
    if (slot === null) continue;
    const { top, height: laneHeight } = slot;
    if (top + laneHeight < 0 || top > height) continue;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = input.colours.surface;
    ctx.fillRect(0, top, width, laneHeight);
    ctx.globalAlpha = 1;
    hatch(ctx, 0, top, width, laneHeight, input.colours.muted, 0.7, REFUSED_HATCH_STEP, 1);
  }
}

/** The line from the held ghost to the pointer it is not following: a hairline,
    dashed, from the nearest point of the ghost's box. Without it a ghost that
    has stopped moving reads as one that is stuck; with it, a planner sees that
    it is being held, and by what. */
function drawTether(
  ctx: CanvasRenderingContext2D,
  input: DrawInput,
  box: SubtaskBox,
  pointer: { readonly x: number; readonly y: number },
): void {
  const x = Math.max(box.outerFrom, Math.min(box.outerTo, pointer.x));
  const y = Math.max(box.y, Math.min(box.y + box.height, pointer.y));
  if (Math.hypot(pointer.x - x, pointer.y - y) < 2) return;
  ctx.strokeStyle = input.colours.text;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(x + 0.5, y + 0.5);
  ctx.lineTo(pointer.x + 0.5, pointer.y + 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Where the ghost is drawn: on its lane, without an offset. */
export function ghostBox(viewport: Viewport, ghost: Subtask): SubtaskBox | null {
  const slot = slotOf(viewport.rows, ghost.lane);
  return slot === null ? null : subtaskBox(viewport, ghost, ghost.lane, slot, 0);
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
  /* One line under every row - a lane's, a group's head, a miniature's. For a
     flat plan that is the same set of lines the multiplication drew. */
  for (const row of viewport.rows.rows) {
    const y = row.top + row.height - viewport.scrollY - 0.5;
    if (y < 0 || y > height) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  /* Inside a folded group, a hairline where one inner group ends and the next
     begins: a miniature is the plant at a smaller scale, and the structure is
     part of the plant. */
  const strips = [...viewport.rows.slots.values()].filter((slot) => slot.miniature).sort((a, b) => a.top - b.top);
  strips.forEach((slot, i) => {
    const next = strips[i + 1];
    if (next === undefined || next.top !== slot.top + slot.height || next.group === slot.group) return;
    const y = slot.top + slot.height - viewport.scrollY - 0.5;
    if (y < 0 || y > height) return;
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  });
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
  ctx.fillStyle = input.colours.now;
  ctx.fillRect(x, 0, 2, input.view.height);
}

/** A bar on a strip of a **Miniature**: the main time in the task's colour,
    the lead-in and the lead-out faint, and nothing else.

    Nothing else on purpose. A folded group is a change of SCALE and not a
    second kind of picture, and at three or four pixels an appearance, a label
    or a progress rail would be a mark nobody can read - or worse, one somebody
    misreads. What a strip promises is where the work is and whose it is; the
    rest is what unfolding is for (ADR-0025). */
function drawStrip(ctx: CanvasRenderingContext2D, input: DrawInput, box: SubtaskBox, alpha: number): void {
  const colour = input.colours.tasks.get(box.subtask.task) ?? input.colours.muted;
  ctx.fillStyle = colour;
  for (const [from, to] of [
    [box.outerFrom, box.mainFrom],
    [box.mainTo, box.outerTo],
  ] as const) {
    if (to <= from) continue;
    ctx.globalAlpha = 0.28 * alpha;
    ctx.fillRect(from, box.y, to - from, box.height);
  }
  ctx.globalAlpha = alpha;
  ctx.fillRect(box.mainFrom, box.y, Math.max(1, box.mainTo - box.mainFrom), box.height);
  ctx.globalAlpha = 1;
}

/** What a bar's face actually is, once its appearance has had its say - and
    what colour text and marks lying ON it have to take.

    `fill` is null for a hollow bar: provisional work paints nothing at all over
    the surface. That is precisely what tells it from a lead-in, which is a FAINT
    fill of the task colour - faint is not empty, and the two must never be
    read for one another.

    Muted work is the task colour mixed half into the surface, OPAQUE. Opaque,
    because transparency is the lead-in's channel; and it carries no outline,
    because an outline is the lead-in's edge. Another shift's work and one
    shift's preparation can then not be confused in either direction - the
    distinction Roman objected to once, settled in the material. */
export function barFace(
  look: ResolvedAppearance,
  colour: string,
  colours: Pick<Colours, "surface" | "text" | "onAccent">,
): { fill: string | null; onDark: boolean } {
  /* A hollow bar IS the surface, so what lies on it takes the page's own text
     colour - which is what `onDark: false` asks the label's CSS for. */
  if (look.dashed) return { fill: null, onDark: false };
  const fill = look.muted ? mix(colour, colours.surface, 0.5) : colour;
  /* Which of the two colours a label may take reads better on this fill -
     measured, not decided by a threshold. A single luminance threshold worked
     only as long as every bar was a saturated task colour; a muted bar is that
     colour mixed half into the surface and lands in the middle, where one
     theme wants the light answer and the other the dark one. Asking which of
     the two actually contrasts is right in both, and needs no tuning. */
  return { fill, onDark: contrast(fill, colours.onAccent) > contrast(fill, colours.text) };
}

/** Two resolved colours mixed, opaquely - not an alpha over the surface, which
    would be transparency, which is the lead-in's channel. */
function mix(a: string, b: string, t: number): string {
  const x = channels(a);
  const y = channels(b);
  if (x === null || y === null) return a;
  const at = (i: 0 | 1 | 2) => Math.round(x[i] + (y[i] - x[i]) * t);
  return `rgb(${at(0)}, ${at(1)}, ${at(2)})`;
}

/** How far the progress rail sits in from the bar's bottom edge, in pixels.
    The cap's width and inset stand in `geometry.ts`, because a bar's label has
    to keep clear of them. */
const RAIL_INSET = 2;

/* ONE CHANNEL PER STATEMENT (schedule-lane-groups 02).

   Everything a bar has to say besides its colour owns exactly one property of
   the drawing, and no property says two things:

     lead-in, lead-out   a faint fill    28 per cent of the task colour, edged
     provisional       the fill        none - the surface shows through
     fixed             the ends        a cap at each end of the main time
     muted             the saturation  the task colour, half mixed into surface
     progress          a rail          inside the main time, above the bottom
     open              a fade          where the bar passes the view's edge

   The hatch is NOT among them any more. It left the bars in this ticket and
   went to the refused lane (`drawRefusedLanes`), where "not available" is what
   a hatch says on a plan. A mark that means two things means neither.

   THE ORDER OF PAINTING IS FIXED, and it is this:

     1 fill   2 rail   3 caps   4 fade   5 outline

   The fade comes after the caps on purpose: a fixed bar that runs past the
   view loses its cap at that edge, and that is exactly the statement - there
   is no end there to mark. The outline comes after the fade, because a dashed
   outline is the whole identity of a provisional bar and must not be eaten by
   it; a provisional bar whose outline faded away would read as released work.

   Adding a sixth statement means finding a sixth CHANNEL, not a sixth
   invention. */
function drawSubtask(ctx: CanvasRenderingContext2D, input: DrawInput, box: SubtaskBox, alpha: number): void {
  const { view, colours } = input;
  if (!inView(box, view.width, view.height)) return;
  if (box.miniature) {
    drawStrip(ctx, input, box, alpha);
    return;
  }
  const look = resolveAppearance(box.subtask.appearance);
  const colour = colours.tasks.get(box.subtask.task) ?? colours.muted;
  const face = barFace(look, colour, colours);
  /* The whole box: no appearance changes what a bar measures any more. */
  const top = box.y;
  const height = box.height;
  const width = Math.max(1, box.mainTo - box.mainFrom);
  /* What reads on this bar - the label's colour, and so the caps' and the
     rail's. On a hollow bar that is the text colour, because a hollow bar is
     the surface. */
  const on = face.onDark ? colours.onAccent : colours.text;

  /* 1. Fill. Lead-in and lead-out first: the task's colour, faint, with its
        edge - preparation reads as belonging to the work, and as not being
        it. Then the face of the main time, or nothing where it is hollow. */
  ctx.lineWidth = 1;
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
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
  if (face.fill !== null) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = face.fill;
    ctx.fillRect(box.mainFrom, top, width, height);
  }

  /* 2. Rail. Progress measures the WORK, so it lies within the main time and
        stops at its end - a rail running on under the lead-out would measure
        the clearing away as well. It sits in from the bottom edge, so that it
        is a mark ON the bar and not the bar's own lower edge. */
  const share = box.subtask.progress;
  if (share !== undefined) {
    const rail = Math.min(4, Math.max(2, Math.round(height / 6)));
    const y = top + height - rail - RAIL_INSET;
    const done = Math.round(width * Math.max(0, Math.min(1, share)));
    /* On a hollow bar the rail takes the TASK colour, not the colour text
       takes: a full-strength text colour on an empty bar is the loudest thing
       in the picture, for the quietest statement in it. The task colour is
       what a hollow bar is already drawn in, and the rail belongs to the bar. */
    ctx.fillStyle = face.fill === null ? colour : on;
    ctx.globalAlpha = 0.3 * alpha;
    ctx.fillRect(box.mainFrom, y, width, rail);
    ctx.globalAlpha = alpha;
    if (done > 0) ctx.fillRect(box.mainFrom, y, done, rail);
  }

  /* 3. Caps. Fixed work is marked at its ENDS and not across its face: the
        face belongs to the label, and the statement is about where the work
        begins and ends - that is where it is nailed down.

        The caps sit INSIDE the bar, framed by its own colour on three sides.
        Flush with the ends they were invisible: a light cap at the start of a
        bar on a light page reads as the bar beginning a few pixels later, not
        as a mark, and the dark scheme has the same problem with the other
        colour. A mark on a bar has to be surrounded by the bar. */
  if (look.hatched) {
    const cap = Math.max(1, Math.min(CAP, Math.floor((width - 2 * CAP_INSET) / 3)));
    const inset = width >= 4 * cap ? CAP_INSET : 0;
    const shrink = height >= 4 * CAP_INSET ? CAP_INSET : 0;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = on;
    ctx.fillRect(box.mainFrom + inset, top + shrink, cap, height - 2 * shrink);
    ctx.fillRect(box.mainTo - inset - cap, top + shrink, cap, height - 2 * shrink);
  }

  /* 4. Fade. */
  if (look.open) fadeOpen(ctx, box, top, height, colours.surface, view.width);

  /* 5. Outline. */
  if (look.dashed) {
    /* Planned, not released: with no fill of its own, the outline is the bar,
       and it survives a colour a caller chose badly. Full weight in the task
       colour, so a hollow bar is still that order's. */
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = colour;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(box.mainFrom + 0.5, top + 0.5, width - 1, height - 1);
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1;
  /* An offset bar lies over the one it covers; an edge in the surface colour
     keeps the two apart. */
  if (box.depth > 0 && alpha === 1) {
    ctx.strokeStyle = colours.surface;
    ctx.strokeRect(box.outerFrom - 0.5, top - 0.5, box.outerTo - box.outerFrom + 1, height + 1);
  }
}

/** The distance between two lines of the hatch on a refused lane, and how far
    a bar that runs on fades into the surface. Both in pixels. */
const REFUSED_HATCH_STEP = 6;
const FADE_SPAN = 16;

/** Diagonal lines, clipped to a rectangle. */
function hatch(
  ctx: CanvasRenderingContext2D,
  from: number,
  top: number,
  width: number,
  height: number,
  colour: string,
  weight: number,
  step: number,
  lineWidth: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(from, top, width, height);
  ctx.clip();
  ctx.globalAlpha = 0.5 * weight;
  ctx.strokeStyle = colour;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let x = from - height; x < from + width + height; x += step) {
    ctx.moveTo(x, top + height);
    ctx.lineTo(x + height, top);
  }
  ctx.stroke();
  ctx.restore();
}

/** A bar that goes on past what is drawn fades into the surface instead of
    ending in an edge a reader would take for its end - at EITHER edge of the
    view, not only the right one. An edge of the screen is an edge of the
    screen on both sides, and a bar that began before the view was saying
    nothing at all about it.

    Where the bar passes NEITHER edge there is no fade at all. It was tempting
    to fade its own end instead - the statement belongs to the work, after all -
    and that was wrong: the painting order puts the fade after the caps so that
    a FIXED bar running past the view loses its cap there, which is the
    statement ("there is no end to mark"). A bar wholly in view has an end, and
    eating its cap would have made a true picture into a false one. An `open`
    bar that passes no edge says nothing about an edge, because there is none
    for it to say anything about. */
function fadeOpen(
  ctx: CanvasRenderingContext2D,
  box: SubtaskBox,
  top: number,
  height: number,
  surface: string,
  plotWidth: number,
): void {
  const before = box.mainFrom < 0;
  const beyond = box.mainTo > plotWidth;
  const visible = Math.max(1, Math.min(box.mainTo, plotWidth) - Math.max(box.mainFrom, 0));
  const span = Math.min(FADE_SPAN, visible);
  /* Opaque where the bar leaves the picture, clear a span further in. */
  if (before) fadeFrom(ctx, 0, span, top, height, surface, 1);
  if (beyond) fadeFrom(ctx, plotWidth, -span, top, height, surface, 1);
}

/** A band of the surface colour, opaque at `edge` and gone `span` pixels away
    from it; a negative span runs to the left. */
function fadeFrom(
  ctx: CanvasRenderingContext2D,
  edge: number,
  span: number,
  top: number,
  height: number,
  surface: string,
  alpha: number,
): void {
  const gradient = ctx.createLinearGradient(edge, 0, edge + span, 0);
  gradient.addColorStop(0, withAlpha(surface, alpha));
  gradient.addColorStop(1, withAlpha(surface, 0));
  ctx.globalAlpha = 1;
  ctx.fillStyle = gradient;
  ctx.fillRect(Math.min(edge, edge + span), top, Math.abs(span), height);
}

/** A resolved colour with an alpha of its own. The theme hands back
    "rgb(…)" or "rgba(…)"; a gradient needs both ends as real colours. */
function withAlpha(colour: string, alpha: number): string {
  const rgb = channels(colour);
  if (rgb === null) return colour;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function drawDependency(ctx: CanvasRenderingContext2D, input: DrawInput, path: DependencyPath, emphasised: boolean, violated?: boolean): void {
  const { data, colours } = input;
  const task = data.taskOfDependency(path.dependency);
  const isViolated = violated ?? data.violatedById.has(path.dependency.id);
  const selected = task !== null && task === input.selectedTask;
  const colour = isViolated ? colours.alarm : (task !== null ? colours.tasks.get(task) : undefined) ?? colours.muted;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = emphasised || selected ? 2 : 1.25;
  ctx.setLineDash(isViolated ? [4, 3] : []);
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
      ctx.arc(x, y, isViolated ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** A violated dependency whose arrival lies inside a folded group, marked on that
    group's row.

    A line between two strips is a few pixels of a few pixels, and the thing a
    planner must not miss is that this order cannot be delivered on time.
    Folding is a planner tidying the view and must never be a planner hiding a
    finding (ADR-0025), so the row says it the way a lane's own overlap says
    it: the danger tone, at the top, over the time that is short. */
function drawViolatedInFolds(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport): void {
  const { data } = input;
  if (data.violatedById.size === 0) return;
  for (const violated of data.violatedById.values()) {
    const dependency = data.dependencies.find((t) => t.id === violated.dependency);
    const to = dependency === undefined ? undefined : data.subtaskById.get(dependency.to);
    if (to === undefined) continue;
    const slot = slotAt(viewport, to.lane);
    if (slot === null || !slot.miniature) continue;
    const row = rowAt(viewport.rows, slot.top + viewport.scrollY);
    if (row === null) continue;
    /* The time that is missing: from when it had to have arrived to when it
       can. */
    const x0 = xOf(viewport, violated.arrival);
    const x1 = Math.max(x0 + 2, xOf(viewport, violated.arrival + violated.shortBy));
    findingBand(ctx, input, x0, x1, row.top - viewport.scrollY + 1, 3);
  }
}

/** The band a finding lays over the time it concerns. Under forced colours it
    is in the text colour like the work beneath it, so it is dashed - the
    mark says "finding" by its pattern, as a violated dependency's line does. */
function findingBand(ctx: CanvasRenderingContext2D, input: DrawInput, x0: number, x1: number, y: number, height: number): void {
  if (!input.colours.forced) {
    ctx.fillStyle = input.colours.alarm;
    ctx.fillRect(x0, y, x1 - x0, height);
    return;
  }
  ctx.strokeStyle = input.colours.alarm;
  ctx.lineWidth = height;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x0, y + height / 2);
  ctx.lineTo(x1, y + height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawOverlap(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport, overlap: Overlap): void {
  const slot = slotAt(viewport, overlap.lane);
  if (slot === null) return;
  const x0 = xOf(viewport, overlap.from);
  const x1 = Math.max(x0 + 2, xOf(viewport, overlap.to));
  ctx.fillStyle = input.colours.alarm;
  ctx.globalAlpha = 0.14;
  ctx.fillRect(x0, slot.top + 1, x1 - x0, Math.max(1, slot.height - 2));
  ctx.globalAlpha = 1;
  findingBand(ctx, input, x0, x1, slot.top + 1, Math.min(3, Math.max(1, slot.height - 1)));
  /* Inside a folded group the mark goes on the ROW as well. Folding is a
     planner tidying the view; it must never be a planner hiding a finding
     (ADR-0025), and a three-pixel strip is not where an alarm can live
     alone. */
  if (slot.miniature) {
    const row = rowAt(viewport.rows, slot.top + viewport.scrollY);
    if (row !== null) findingBand(ctx, input, x0, x1, row.top - viewport.scrollY + 1, 3);
  }
}

/** Hover is a WASH over the bar; selection is an outline. Two different kinds
    of mark, so that they can be seen at once: hovering a selected bar used to
    draw a one-pixel outline inside a two-pixel one of the same colour, which
    is to say it showed nothing at all.

    The wash takes the colour the bar's LABEL takes (`barFace`), which is the
    colour that reads on this bar: a dark bar is lightened, a light one is
    darkened, and a hollow one - which has nothing to lighten - is greyed by
    the page's own ink. One rule, and it is a rule the picture already had. */
function drawHover(ctx: CanvasRenderingContext2D, input: DrawInput, box: SubtaskBox): void {
  const { colours } = input;
  const look = resolveAppearance(box.subtask.appearance);
  const face = barFace(look, colours.tasks.get(box.subtask.task) ?? colours.muted, colours);
  /* Under forced colours every bar is the text colour, and a wash of the
     ground over it reads as a slightly lighter black: the active subtask takes
     an outline in the selection colour instead, around the bar. */
  if (colours.forced) {
    ctx.strokeStyle = colours.active;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.outerFrom - 2, box.y - 2, Math.max(1, box.outerTo - box.outerFrom) + 4, box.height + 4);
    return;
  }
  ctx.globalAlpha = HOVER_WASH;
  ctx.fillStyle = face.onDark ? colours.onAccent : colours.text;
  ctx.fillRect(box.outerFrom, box.y, Math.max(1, box.outerTo - box.outerFrom), box.height);
  ctx.globalAlpha = 1;
}

/** How much of the wash lies on a hovered bar. Low enough that the bar keeps
    its colour and its label keeps its contrast; high enough to be seen under
    an outline. */
const HOVER_WASH = 0.2;

/** Selection takes a whole task, and one of its bars was the one clicked. That
    bar's outline is the heavier of the two, so that a planner knows which bar
    the grips belong to - the grips are the selected SUBTASK'S, and a task with
    six stops would otherwise offer no way to tell which. */
function drawSelection(ctx: CanvasRenderingContext2D, input: DrawInput): void {
  const task = input.selectedTask;
  if (task === null) return;
  ctx.strokeStyle = input.colours.text;
  for (const box of input.view.boxes) {
    if (box.subtask.task !== task) continue;
    const clicked = box.subtask.id === input.selectedSubtask;
    ctx.lineWidth = clicked ? 2 : 1;
    const out = clicked ? 1 : 0.5;
    ctx.strokeRect(box.outerFrom - out, box.y - out, box.outerTo - box.outerFrom + 2 * out, box.height + 2 * out);
  }
}
