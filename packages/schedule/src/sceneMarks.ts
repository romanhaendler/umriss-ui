/* The marks of places and findings on the plot: the hatch of a refused lane and
   of blocked time, and the bands a finding lays over the time it concerns.
   Functions over what they are given, like the rest of the drawing. */

import { slotAt, xOf, type Viewport } from "./geometry";
import type { BlockedTime } from "./model";
import { rowAt } from "./rows";
import type { DrawInput } from "./sceneDraw";

/** The distance between two lines of the hatch, in pixels. */
const REFUSED_HATCH_STEP = 6;

/** Diagonal lines, clipped to a rectangle. */
function hatch(
  ctx: CanvasRenderingContext2D,
  from: number,
  top: number,
  width: number,
  height: number,
  colour: string,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(from, top, width, height);
  ctx.clip();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = from - height; x < from + width + height; x += REFUSED_HATCH_STEP) {
    ctx.moveTo(x, top + height);
    ctx.lineTo(x + height, top);
  }
  ctx.stroke();
  ctx.restore();
}

/** The lanes a drag in flight may not put its work on: drawn back under a wash
    of the surface, and hatched.

    The hatch is here and on blocked time (`drawBlocked`), and nowhere else on
    the plot. "Not available" is what a hatch says on a plan - a statement about
    a PLACE, not about a bar. No warning colour: a mould that fits one press is nobody's mistake
    (CONTEXT.md, **Refusal**). */
export function drawRefusedLanes(
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
    hatch(ctx, 0, top, width, laneHeight, input.colours.muted);
  }
}

/** A violated dependency whose arrival lies inside a folded group, marked on that
    group's row.

    A line between two strips is a few pixels of a few pixels, and the thing a
    planner must not miss is that this order cannot be delivered on time.
    Folding is a planner tidying the view and must never be a planner hiding a
    finding (ADR-0025), so the row says it the way a lane's own overlap says
    it: the danger tone, at the top, over the time that is short. */
export function drawViolatedInFolds(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport): void {
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

/** A lane's blocked time: a band of the muted ink under the hatch, across the
    lane for its interval, behind all the work. The hatch says "not available"
    of a place, as it does on a refused lane - here of a place in time. Under
    forced colours both are GrayText on Canvas, and the hatch alone carries it. */
export function drawBlocked(ctx: CanvasRenderingContext2D, input: DrawInput, viewport: Viewport, blocked: BlockedTime): void {
  const slot = slotAt(viewport, blocked.lane);
  if (slot === null || slot.top + slot.height < 0 || slot.top > input.view.height) return;
  const x0 = Math.max(0, xOf(viewport, blocked.from));
  const x1 = Math.min(input.view.width, xOf(viewport, blocked.to));
  if (x1 <= x0) return;
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = input.colours.muted;
  ctx.fillRect(x0, slot.top, x1 - x0, slot.height);
  ctx.globalAlpha = 1;
  hatch(ctx, x0, slot.top, x1 - x0, slot.height, input.colours.muted);
}

/** The mark of a finding on a lane - two subtasks overlapping, or a subtask in
    blocked time: a wash of the danger tone over the time it concerns, and a
    band at the top. */
export function drawOverlap(
  ctx: CanvasRenderingContext2D,
  input: DrawInput,
  viewport: Viewport,
  overlap: { readonly lane: string; readonly from: number; readonly to: number },
): void {
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
