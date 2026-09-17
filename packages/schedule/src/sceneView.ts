/* What is in view, and where things lie in it.

   The domain in operating time, the vertical scroll, the plot's size, and the
   layout that follows from them over the data: a box per subtask, a path per
   transport. Pan and zoom exchange the domain and the scroll and nothing else
   (ADR-0001). The hit and the mapping from a plot point to a time and a lane
   stand here too, because they read exactly this layout. */

import {
  DAY,
  HOUR,
  LinearScale,
  calendarFrom,
  toOperatingTimeClamped,
  toWallClock,
  type CalendarInput,
} from "@umriss-ui/charts";
import {
  distanceTo,
  laneAt,
  partAt,
  subtaskBox,
  transportPath,
  type SubtaskBox,
  type TransportPath,
  type Viewport,
} from "./geometry";
import { effectiveCollapsed, layOutRows, rowAt, slotOf, type Rows } from "./rows";
import type { IntentKind, Subtask, Transport, TransportAttachment, TransportEnds, TransportRoute } from "./model";
import type { SceneData } from "./sceneData";
import type { SnapRaster } from "./snap";
import { days, fineStep, fineTicks, panDomain, zoomDomain, type ZoomLimits } from "./timeAxis";

/** What a pointer is on. */
export type ScheduleHit =
  | { readonly kind: "subtask"; readonly subtask: Subtask; readonly part: "setup" | "main" | "teardown" }
  | { readonly kind: "transport"; readonly transport: Transport }
  | { readonly kind: "lane"; readonly lane: string }
  | { readonly kind: "nothing" };

export interface SceneOptions {
  readonly laneHeight: number;
  readonly calendar: CalendarInput;
  readonly zoomLimits: ZoomLimits;
  readonly snap: "ticks" | number | SnapRaster | false;
  readonly intents: readonly IntentKind[];
  /** The present, as a wall-clock instant, or null for no now line. */
  readonly now: number | null;
  /** How the transports are drawn, where one does not say otherwise. */
  readonly route: TransportRoute;
  readonly attach: TransportAttachment;
  readonly ends: TransportEnds;
}

/** The height of a lane where a caller names none. It stands here because the
    view is what reads it; the component and the empty snapshot take it from
    here rather than writing 44 a second and third time. */
export const DEFAULT_LANE_HEIGHT = 44;

export class SceneView {
  options: SceneOptions = {
    laneHeight: DEFAULT_LANE_HEIGHT,
    calendar: [],
    zoomLimits: { min: HOUR, max: 28 * DAY },
    snap: "ticks",
    intents: [],
    now: null,
    route: "curve",
    attach: "centre",
    ends: "dot",
  };
  domain: [number, number] = [0, DAY];
  scrollY = 0;
  width = 0;
  height = 0;
  /* What is laid out from top to bottom (`rows.ts`). It is derived here and
     not in the data, because a row's height comes from a view option; every y
     in the package reads it. */
  rows: Rows = layOutRows({ lanes: [], groups: [], collapsed: new Set(), laneHeight: DEFAULT_LANE_HEIGHT });
  /** The folded groups, as the scene holds them. */
  collapsed: ReadonlySet<string> = new Set();
  /** The groups a gesture in flight holds open. Dropped when it ends; the
      caller's list never learns of it. */
  openForGesture: ReadonlySet<string> = new Set();
  boxes: SubtaskBox[] = [];
  boxById = new Map<string, SubtaskBox>();
  paths: TransportPath[] = [];

  constructor(private readonly data: SceneData) {}

  /** Takes new options; an initial domain in wall-clock time puts the view
      there, and a new calendar keeps the wall-clock span in view. */
  setOptions(options: SceneOptions, initialDomain: readonly [number, number] | null): void {
    const calendarChanged = options.calendar !== this.options.calendar;
    const previous = this.options.calendar;
    this.options = options;
    if (initialDomain !== null || calendarChanged) {
      const wall = initialDomain ?? [toWallClock(this.domain[0], previous), toWallClock(this.domain[1], previous)];
      this.domain = [toOperatingTimeClamped(wall[0], options.calendar), toOperatingTimeClamped(wall[1], options.calendar)];
    }
  }

  viewport(): Viewport {
    return {
      scale: new LinearScale(this.domain, [0, this.width]),
      calendar: this.options.calendar,
      laneHeight: this.options.laneHeight,
      scrollY: this.scrollY,
      rows: this.rows,
    };
  }

  maxScroll(): number {
    return Math.max(0, this.rows.height - this.height);
  }

  /** The lowest y that still lies on a lane. */
  lanesBottom(): number {
    return this.rows.height - this.scrollY - 1;
  }

  /** The fine band's step at the current zoom. */
  step(): number {
    const span = this.domain[1] - this.domain[0];
    return fineStep(this.width > 0 ? span / this.width : span);
  }

  /** Lays the rows out, clamps the scroll, and lays the data out anew. */
  layout(): void {
    this.rows = layOutRows({
      lanes: this.data.lanes,
      groups: this.data.groups,
      collapsed: effectiveCollapsed(this.collapsed, this.openForGesture),
      laneHeight: this.options.laneHeight,
    });
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY));
    const view = this.viewport();
    this.boxes = [];
    this.boxById = new Map();
    for (const subtask of this.data.subtasks) {
      const slot = slotOf(this.rows, subtask.lane);
      if (slot === null) continue;
      const box = subtaskBox(view, subtask, subtask.lane, slot, this.data.depth.get(subtask.id) ?? 0);
      this.boxes.push(box);
      this.boxById.set(subtask.id, box);
    }
    this.paths = [];
    for (const transport of this.data.transports) {
      const from = this.boxById.get(transport.from);
      const to = this.boxById.get(transport.to);
      if (from === undefined || to === undefined) continue;
      this.paths.push(transportPath(view, transport, from, to, this.options));
    }
  }

  /** The days of the coarse band and the ticks of the fine band, in pixels. */
  bands(): { days: { start: number; x: number; width: number }[]; ticks: { wallClock: number; x: number }[]; step: number } {
    const step = this.step();
    if (this.width <= 0) return { days: [], ticks: [], step };
    const scale = this.viewport().scale;
    const calendar = this.options.calendar;
    return {
      days: days(this.domain, calendar).map((day) => {
        const x = Math.round(scale.toPx(day.from));
        return { start: day.start, x, width: Math.round(scale.toPx(day.to)) - x };
      }),
      ticks: fineTicks(this.domain, step, calendar).map((tick) => ({ wallClock: tick.wallClock, x: Math.round(scale.toPx(tick.operatingTime)) })),
      step,
    };
  }

  /** The now line's x, or null where there is none or it lies outside the plot. */
  nowX(): number | null {
    const now = this.options.now;
    if (now === null || this.width <= 0) return null;
    const x = Math.round(this.viewport().scale.toPx(toOperatingTimeClamped(now, this.options.calendar)));
    return x >= 0 && x <= this.width ? x : null;
  }

  hitAt(x: number, y: number): ScheduleHit {
    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const box = this.boxes[i]!;
      const part = partAt(box, x, y);
      if (part !== null) return { kind: "subtask", subtask: box.subtask, part };
    }
    let nearest: TransportPath | null = null;
    let distance = 4;
    for (const path of this.paths) {
      const d = distanceTo(path, x, y);
      if (d <= distance) {
        distance = d;
        nearest = path;
      }
    }
    if (nearest !== null) return { kind: "transport", transport: nearest.transport };
    const lane = laneAt(this.viewport(), y);
    return lane !== null ? { kind: "lane", lane } : { kind: "nothing" };
  }

  /** The wall-clock time at a plot x; within the calendar's extent. */
  timeAt(x: number): number {
    const operating = this.viewport().scale.fromPx(x);
    const calendar = calendarFrom(this.options.calendar);
    if (calendar.intervals.length === 0) return operating;
    return toWallClock(Math.max(0, Math.min(calendar.total, operating)), calendar);
  }

  /** The lane at a y, strips included: what the pointer is ON.

      One line, and it stays a line of its own: it is one of the three
      questions this object answers about a y - this one, `dropLaneIdAt` and
      `foldedGroupAt` - and a caller that reached through `viewport()` for it
      would be depending on the layout rather than asking the view. */
  laneIdAt(y: number): string | null {
    return laneAt(this.viewport(), y);
  }

  /** The lane a DROP at this y would land on.

      A **Miniature** is no drop target. A strip is three pixels of a machine's
      whole day, and a drop aimed at one would be a guess; resting over the
      group opens it for the gesture instead, and then there is a real lane to
      aim at. Hover, the tooltip and selection do read a strip - they cost
      nothing if they are a pixel out. */
  dropLaneIdAt(y: number): string | null {
    const row = rowAt(this.rows, y + this.scrollY);
    if (row === null || row.kind !== "lane") return null;
    return row.lane ?? null;
  }

  /** The folded group a y lies over, or null. */
  foldedGroupAt(y: number): string | null {
    const row = rowAt(this.rows, y + this.scrollY);
    return row !== null && row.kind === "miniature" ? (row.group ?? null) : null;
  }

  /** Pans by pixels. Says what moved: the span through time, the lanes, or
      neither - a scroll through the lanes is no news about the time. */
  pan(dx: number, dy: number): { moved: boolean; time: boolean } {
    const from = this.domain[0];
    const scrolled = this.scrollY;
    const span = this.domain[1] - from;
    if (this.width > 0 && dx !== 0) this.domain = panDomain(this.domain, (dx / this.width) * span);
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY + dy));
    const time = this.domain[0] !== from;
    return { moved: time || this.scrollY !== scrolled, time };
  }

  /** Zooms around a plot x; says whether the span changed. */
  zoomAt(x: number, factor: number): boolean {
    if (this.width <= 0 || !Number.isFinite(factor)) return false;
    const before = this.domain;
    const attach = this.viewport().scale.fromPx(x);
    this.domain = zoomDomain(this.domain, attach, factor, this.options.zoomLimits);
    return before[0] !== this.domain[0] || before[1] !== this.domain[1];
  }
}
