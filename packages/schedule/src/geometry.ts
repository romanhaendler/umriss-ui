/* Where things lie on the plot: subtask boxes, transport paths, and what a
   pointer at a point hits.

   Every horizontal position goes through the scale (ADR-0001) from WORKING
   time: a wall-clock instant is mapped through the calendar first, and one in
   removed time lands on the seam it collapses onto. Positions are rounded to
   whole pixels, so a fill and the hairline beside it meet on the same pixel
   instead of blending into a colour of their own - the measure against the
   charts' non-reproducible pictures (docs/testing.md, Known open).

   Free of the DOM and of the canvas. */

import { toWorkingTimeClamped, type CalendarInput, type Scale } from "@umriss-ui/charts";
import { resolveAppearance } from "./appearance";
import { laneAtY, slotOf, type Rows, type Slot } from "./rows";
import {
  arrival,
  departure,
  occupied,
  type Subtask,
  type Transport,
  type TransportAttachment,
  type TransportEnds,
  type TransportRoute,
} from "./model";

/** What the geometry needs to know about the view. */
export interface Viewport {
  /** Working time → pixel, across the plot's width. */
  readonly scale: Scale;
  readonly calendar: CalendarInput;
  /** Height of one lane in pixels. */
  readonly laneHeight: number;
  /** How far the lanes are scrolled up, in pixels. */
  readonly scrollY: number;
  /** What is laid out from top to bottom, and where every lane sits in it
      (`rows.ts`). Every y in the package comes from here: the multiplication
      of a lane index by a lane height is gone, because a folded group is one
      row and its lanes are strips inside it (ADR-0025). */
  readonly rows: Rows;
}

/** Distance of a bar from the edges of its lane, before any offset. */
export const BAR_INSET = 6;
/** How wide the cap of a fixed bar is and how far it sits in from the bar's
    end and edges. They stand here rather than with the drawing because the
    LABEL has to know them too: a mark and a word must not share a place. */
export const CAP = 3;
export const CAP_INSET = 2;
/** How far each level of overlap moves a bar down, and the deepest level that
    still moves it: the bar is made short enough that the deepest one stays in
    its lane. */
export const DEPTH_STEP = 3;
export const MAX_DEPTH = 3;

/** A subtask as drawn: its three parts along x, its bar along y. */
export interface SubtaskBox {
  readonly subtask: Subtask;
  /** The lane it sits on. */
  readonly lane: string;
  /** Whether it is drawn as a strip inside a folded group. */
  readonly miniature: boolean;
  /** How many earlier subtasks it covers on its lane - its offset level. */
  readonly depth: number;
  readonly y: number;
  readonly height: number;
  /** Start of the setup, start and end of the main time, end of the teardown. */
  readonly outerFrom: number;
  readonly mainFrom: number;
  readonly mainTo: number;
  readonly outerTo: number;
}

/** The pixel of a wall-clock instant. */
export function xOf(view: Viewport, instant: number): number {
  return Math.round(view.scale.toPx(toWorkingTimeClamped(instant, view.calendar)));
}

/** Where a lane is drawn on the plot, scroll included - its own row, or its
    strip inside a folded group. Null for a lane this plot does not have. */
export function slotAt(view: Viewport, lane: string): Slot | null {
  const slot = slotOf(view.rows, lane);
  return slot === null ? null : { ...slot, top: slot.top - view.scrollY };
}

/** The lane under a y, or null off every lane - a group's head and the inset
    of a miniature are both "no lane". */
export function laneAt(view: Viewport, y: number): string | null {
  return laneAtY(view.rows, y + view.scrollY);
}

export function subtaskBox(view: Viewport, subtask: Subtask, lane: string, slot: Slot, depth: number): SubtaskBox {
  /* Per SLOT and no longer per lane height: a strip inside a folded group is
     a few pixels tall, and a bar on it has to be too. */
  const inset = slot.miniature ? 0 : BAR_INSET;
  const offset = slot.miniature ? 0 : MAX_DEPTH * DEPTH_STEP;
  const height = Math.max(slot.miniature ? 1 : 4, slot.height - 2 * inset - offset);
  /* Depth 0 sits centred in its lane; each level below moves down by a step. */
  const top = slot.top - view.scrollY + Math.floor((slot.height - height) / 2);
  const outer = occupied(subtask);
  return {
    subtask,
    lane,
    miniature: slot.miniature,
    depth,
    y: top + (slot.miniature ? 0 : Math.min(depth, MAX_DEPTH) * DEPTH_STEP),
    height,
    outerFrom: xOf(view, outer.from),
    mainFrom: xOf(view, subtask.from),
    mainTo: xOf(view, subtask.to),
    outerTo: xOf(view, outer.to),
  };
}

/** The part of a subtask a point hits, or null. A bar narrower than a few
    pixels is widened for the pointer, or a short subtask could not be hit. */
export function partAt(box: SubtaskBox, x: number, y: number): "setup" | "main" | "teardown" | null {
  if (y < box.y || y > box.y + box.height) return null;
  const slack = Math.max(0, (6 - (box.outerTo - box.outerFrom)) / 2);
  if (x < box.outerFrom - slack || x > box.outerTo + slack) return null;
  if (x < box.mainFrom) return "setup";
  if (x > box.mainTo) return "teardown";
  return "main";
}

/** Which edge of the main time a point is on, within `reach` pixels. */
export function edgeAt(box: SubtaskBox, x: number, y: number, reach = 5): "from" | "to" | null {
  if (y < box.y || y > box.y + box.height) return null;
  const toFrom = Math.abs(x - box.mainFrom);
  const toTo = Math.abs(x - box.mainTo);
  if (Math.min(toFrom, toTo) > reach) return null;
  /* On a bar narrower than both reaches, the nearer edge wins. */
  return toFrom <= toTo ? "from" : "to";
}

/** Whether any part of a subtask's box lies within the plot. */
export function inView(box: SubtaskBox, plotWidth: number, plotHeight: number): boolean {
  return box.outerTo >= 0 && box.outerFrom <= plotWidth && box.y + box.height >= 0 && box.y <= plotHeight;
}

/** The narrowest bar that still gets a label.

    Measured, not guessed: at the type size the labels are set in, a 47-pixel
    bar showed "A-…" - a letter and an ellipsis, which says less than nothing
    and costs a reader a glance. Sixty-four pixels hold about seven characters,
    which is an order number. Below that the bar stays silent, and the tooltip
    answers instead. */
export const MIN_LABEL_WIDTH = 64;

/** Where a bar's label lies, or null where there is no room for one.

    The label belongs to the main time - the setup is not the work - and to the
    VISIBLE part of it: a bar that began before the view keeps its label at the
    view's edge, the way the day band keeps its date. */
export function barLabelBox(
  box: SubtaskBox,
  plotWidth: number,
): { x: number; width: number; y: number; height: number } | null {
  /* A strip of a miniature carries no word at all: three pixels of height
     hold no text, and a label floating over a folded group would name work
     the reader cannot see the shape of. */
  if (box.miniature) return null;
  /* Fixed work is capped at both ends, and a word must not lie on a mark - the
     hatch across a bar's face was taken away for exactly that reason. So the
     label of a capped bar begins after its cap and stops before the other
     one. */
  const capped = resolveAppearance(box.subtask.appearance).hatched ? CAP_INSET + CAP + 1 : 0;
  const x = Math.max(box.mainFrom + capped, 0);
  const width = Math.min(box.mainTo - capped, plotWidth) - x;
  if (width < MIN_LABEL_WIDTH) return null;
  /* The whole height, always: since schedule-lane-groups 02 no appearance
     changes what a bar MEASURES. Muted work says it in saturation, not in
     height, so every bar keeps its label at its full size. */
  return { x, width, y: box.y, height: box.height };
}

/** How the transports of a schedule are drawn, where a transport does not say
    otherwise. */
export interface TransportStyle {
  readonly route: TransportRoute;
  readonly attach: TransportAttachment;
  readonly ends: TransportEnds;
}

/** A transport as drawn: its two ends, the shape between them, and the polyline
    it is hit along - the same line that is drawn. */
export interface TransportPath {
  readonly transport: Transport;
  readonly kind: TransportRoute;
  /** Whether its ends carry a dot. */
  readonly ends: TransportEnds;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  /** The two control points of the cubic curve; only a curve has them. */
  readonly c1x: number;
  readonly c2x: number;
  /** The drawn line as a polyline, for the hit. */
  readonly points: readonly number[];
}

/** How far an orthogonal route runs straight out of its bar before it turns. */
const STUB = 10;

/** The y of an end, by the attach: the middle of the bar, or the edge facing
    the other stop. Both ends ask the same question - does the other one lie
    below me? - so a line between two lanes leaves the lower edge of the upper
    bar and meets the upper edge of the lower one. Within one lane there is no
    nearer edge, so both anchors mean the middle: a move that changes nothing
    but time stays in its lane.

    The edge is a pixel INSIDE the bar, not the boundary itself. A bar drawn
    from `y` over `height` fills the rows `y … y + height - 1`, and a line
    centred on `y + height` lies entirely below the last of them - which reads
    as a hairline gap between the line and the bar it leaves. */
function attachY(attach: TransportAttachment, box: SubtaskBox, other: SubtaskBox): number {
  const middle = Math.round(box.y + box.height / 2);
  /* Slots' tops rather than lane indices: a bar inside a folded group and one
     on a lane below it are still "the other lies below me", and a lane index
     could not say so once the two are not both rows. */
  if (attach === "centre" || other.y === box.y) return middle;
  return Math.round(other.y > box.y ? box.y + box.height - 1 : box.y + 1);
}

export function transportPath(
  view: Viewport,
  transport: Transport,
  from: SubtaskBox,
  to: SubtaskBox,
  style: TransportStyle,
): TransportPath {
  const route = transport.route ?? style.route;
  const attach = transport.attach ?? style.attach;
  const ends = transport.ends ?? style.ends;
  const x1 = xOf(view, departure(transport, from.subtask));
  const x2 = xOf(view, arrival(transport, to.subtask));
  const y1 = attachY(attach, from, to);
  const y2 = attachY(attach, to, from);

  if (route === "straight") {
    return { transport, kind: route, ends, x1, y1, x2, y2, c1x: x1, c2x: x2, points: [x1, y1, x2, y2] };
  }

  if (route === "orthogonal") {
    /* Out of the bar, across, and in again. The turn lies halfway between the
       stub and the arrival, so two transports of neighbouring stops do not
       share a vertical. */
    const out = x1 + STUB;
    const turn = y1 === y2 ? out : Math.round((out + x2) / 2);
    const points = y1 === y2 ? [x1, y1, x2, y2] : [x1, y1, turn, y1, turn, y2, x2, y2];
    return { transport, kind: route, ends, x1, y1, x2, y2, c1x: x1, c2x: x2, points };
  }

  /* A curve that leaves forwards and arrives forwards, even where the arrival
     lies before the departure - a late transport then loops back, which is the
     picture of what it is. */
  const bend = Math.max(14, Math.abs(x2 - x1) / 2);
  const c1x = x1 + bend;
  const c2x = x2 - bend;
  const points: number[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const u = 1 - t;
    points.push(
      u * u * u * x1 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x2,
      u * u * u * y1 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y2,
    );
  }
  return { transport, kind: "curve", ends, x1, y1, x2, y2, c1x, c2x, points };
}

/** Distance from a point to a transport's curve, in pixels. */
export function distanceTo(path: TransportPath, x: number, y: number): number {
  let best = Infinity;
  const p = path.points;
  for (let i = 0; i + 3 < p.length; i += 2) {
    const ax = p[i]!;
    const ay = p[i + 1]!;
    const bx = p[i + 2]!;
    const by = p[i + 3]!;
    const dx = bx - ax;
    const dy = by - ay;
    const length = dx * dx + dy * dy;
    const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length));
    best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
  }
  return best;
}
