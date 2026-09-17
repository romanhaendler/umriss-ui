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
import type { IntentKind, Subtask, Transport } from "./model";
import type { SceneData } from "./sceneData";
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
  readonly snap: "ticks" | number | false;
  readonly intents: readonly IntentKind[];
}

export class SceneView {
  options: SceneOptions = {
    laneHeight: 44,
    calendar: [],
    zoomLimits: { min: HOUR, max: 28 * DAY },
    snap: "ticks",
    intents: [],
  };
  domain: [number, number] = [0, DAY];
  scrollY = 0;
  width = 0;
  height = 0;
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
    };
  }

  maxScroll(): number {
    return Math.max(0, this.data.lanes.length * this.options.laneHeight - this.height);
  }

  /** The fine band's step at the current zoom. */
  step(): number {
    const span = this.domain[1] - this.domain[0];
    return fineStep(this.width > 0 ? span / this.width : span);
  }

  /** Clamps the scroll and lays the data out anew. */
  layout(): void {
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY));
    const view = this.viewport();
    this.boxes = [];
    this.boxById = new Map();
    for (const subtask of this.data.subtasks) {
      const lane = this.data.laneIndex.get(subtask.lane);
      if (lane === undefined) continue;
      const box = subtaskBox(view, subtask, lane, this.data.depth.get(subtask.id) ?? 0);
      this.boxes.push(box);
      this.boxById.set(subtask.id, box);
    }
    this.paths = [];
    for (const transport of this.data.transports) {
      const from = this.boxById.get(transport.from);
      const to = this.boxById.get(transport.to);
      if (from === undefined || to === undefined) continue;
      this.paths.push(transportPath(view, transport, from, to));
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
    const lane = laneAt(this.viewport(), y, this.data.lanes.length);
    return lane >= 0 ? { kind: "lane", lane: this.data.lanes[lane]!.id } : { kind: "nothing" };
  }

  /** The wall-clock time at a plot x; within the calendar's extent. */
  timeAt(x: number): number {
    const operating = this.viewport().scale.fromPx(x);
    const calendar = calendarFrom(this.options.calendar);
    if (calendar.intervals.length === 0) return operating;
    return toWallClock(Math.max(0, Math.min(calendar.total, operating)), calendar);
  }

  laneIdAt(y: number): string | null {
    const index = laneAt(this.viewport(), y, this.data.lanes.length);
    return index >= 0 ? this.data.lanes[index]!.id : null;
  }

  /** Pans by pixels; says whether anything moved. */
  pan(dx: number, dy: number): boolean {
    const before = `${this.domain[0]}|${this.scrollY}`;
    const span = this.domain[1] - this.domain[0];
    if (this.width > 0 && dx !== 0) this.domain = panDomain(this.domain, (dx / this.width) * span);
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY + dy));
    return before !== `${this.domain[0]}|${this.scrollY}`;
  }

  /** Zooms around a plot x; says whether the span changed. */
  zoomAt(x: number, factor: number): boolean {
    if (this.width <= 0 || !Number.isFinite(factor)) return false;
    const before = this.domain;
    const anchor = this.viewport().scale.fromPx(x);
    this.domain = zoomDomain(this.domain, anchor, factor, this.options.zoomLimits);
    return before[0] !== this.domain[0] || before[1] !== this.domain[1];
  }
}
