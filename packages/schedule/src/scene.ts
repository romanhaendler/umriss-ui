/* The scene of one schedule: what is registered, what is in view, what the
   pointer is doing - and the drawing.

   Built in the image of the charts' scene (ADR-0022): the children register
   and render nothing, the canvas is drawn in a frame of its own, and the DOM
   parts - lane headers, both bands, the ghost's label and the grips - read a
   snapshot through `useSyncExternalStore`. Canvas access happens only once the
   scene is bound, never while rendering, so the component renders on a server
   and in a DOM without a canvas.

   The data is the caller's and stays as it came (ADR-0023). A drag draws a
   ghost beside it, assesses the ghost like data, and ends in intents; nothing
   here writes a subtask. */

import type { ReactNode } from "react";
import {
  HOUR,
  DAY,
  LinearScale,
  calendarFrom,
  removedIntervals,
  resolveColours,
  subscribeTheme,
  toOperatingTimeClamped,
  toWallClock,
  type CalendarInput,
} from "@umriss-ui/charts";
import { lateTransports, overlapDepth, overlaps, type LateTransport, type Overlap } from "./findings";
import {
  distanceTo,
  edgeAt,
  laneAt,
  laneTop,
  partAt,
  subtaskBox,
  transportPath,
  xOf,
  type SubtaskBox,
  type TransportPath,
  type Viewport,
} from "./geometry";
import { occupied, type Intent, type IntentKind, type Subtask, type Task, type Transport } from "./model";
import { snapTime } from "./snap";
import { days, fineStep, fineTicks, panDomain, zoomDomain, type ZoomLimits } from "./timeAxis";

/* ---------------------------------------------------------------------- */
/* What the caller hears                                                   */
/* ---------------------------------------------------------------------- */

/** What a pointer is on. */
export type ScheduleHit =
  | { readonly kind: "subtask"; readonly subtask: Subtask; readonly part: "setup" | "main" | "teardown" }
  | { readonly kind: "transport"; readonly transport: Transport }
  | { readonly kind: "lane"; readonly lane: string }
  | { readonly kind: "nothing" };

/** A pointer interaction, reported with its target and its position. */
export interface ScheduleInteraction {
  /** `"hover"` is reported when the target under the pointer changes, not on
      every movement. */
  readonly type: "click" | "contextmenu" | "hover";
  /** What the pointer is on. */
  readonly hit: ScheduleHit;
  /** The pointer's horizontal client coordinate - where a `ContextMenu` opens. */
  readonly clientX: number;
  /** The pointer's vertical client coordinate. */
  readonly clientY: number;
  /** The wall-clock instant under the pointer. */
  readonly time: number;
  /** The lane under the pointer, or null below the last one. */
  readonly lane: string | null;
}

export interface SceneHandlers {
  onIntent?: (intent: Intent) => void;
  onInteraction?: (interaction: ScheduleInteraction) => void;
  onSelectedTaskChange?: (task: string | null) => void;
}

/* ---------------------------------------------------------------------- */
/* Registrations                                                           */
/* ---------------------------------------------------------------------- */

export interface LaneConfig {
  readonly id: string;
  readonly label: ReactNode;
}

export type LayerConfig =
  | { readonly kind: "subtasks"; readonly data: readonly Subtask[]; readonly tasks: readonly Task[] }
  | { readonly kind: "transports"; readonly data: readonly Transport[] };

/* ---------------------------------------------------------------------- */
/* What the DOM parts read                                                 */
/* ---------------------------------------------------------------------- */

export interface ScheduleSnapshot {
  readonly width: number;
  readonly height: number;
  readonly laneHeight: number;
  readonly scrollY: number;
  readonly lanes: readonly LaneConfig[];
  /** The days of the coarse band: where they lie and what they are. */
  readonly days: readonly { readonly start: number; readonly x: number; readonly width: number }[];
  /** The ticks of the fine band, and the step they stand on. */
  readonly ticks: readonly { readonly wallClock: number; readonly x: number }[];
  readonly step: number;
  /** The ghost's label while a drag is in flight. */
  readonly ghost: {
    readonly x: number;
    readonly y: number;
    readonly from: number;
    readonly to: number;
    readonly overlap: boolean;
    readonly late: boolean;
  } | null;
  /** The setup and teardown grips of the selected subtask. */
  readonly grips: readonly { readonly kind: "setup" | "teardown"; readonly x: number; readonly y: number; readonly height: number }[];
  readonly cursor: string;
}

const EMPTY_SNAPSHOT: ScheduleSnapshot = {
  width: 0,
  height: 0,
  laneHeight: 44,
  scrollY: 0,
  lanes: [],
  days: [],
  ticks: [],
  step: HOUR,
  ghost: null,
  grips: [],
  cursor: "default",
};

/* ---------------------------------------------------------------------- */
/* Gestures                                                                */
/* ---------------------------------------------------------------------- */

type EditMode = "move" | "stretch-from" | "stretch-to" | "setup" | "teardown";

type Gesture =
  | { kind: "none" }
  | { kind: "pending"; pointerId: number; x0: number; y0: number; mode: EditMode | "pan"; subtask: Subtask | null }
  | { kind: "pan"; pointerId: number; lastX: number; lastY: number }
  | { kind: "edit"; pointerId: number; mode: EditMode; subtask: Subtask; x0: number; ghost: Subtask }
  | { kind: "pinch"; distance: number };

/** Movement below which a press is a click. */
const CLICK_SLOP = 3;

const TOKENS = {
  line: "var(--u-hairline)",
  lineStrong: "var(--u-hairline-strong)",
  text: "var(--u-color-text)",
  muted: "var(--u-color-text-muted)",
  alarm: "var(--u-color-danger)",
  surface: "var(--u-color-surface)",
} as const;

type Colours = Record<keyof typeof TOKENS, string> & { tasks: Map<string, string> };

export interface SceneOptions {
  readonly laneHeight: number;
  readonly calendar: CalendarInput;
  readonly zoomLimits: ZoomLimits;
  readonly snap: "ticks" | number | false;
  readonly intents: readonly IntentKind[];
}

export class ScheduleScene {
  /* -- registrations ---------------------------------------------------- */
  private nextId = 1;
  private readonly laneEntries = new Map<number, LaneConfig>();
  private readonly layerEntries = new Map<number, LayerConfig>();

  /* -- derived from the data -------------------------------------------- */
  private lanes: LaneConfig[] = [];
  private laneIndex = new Map<string, number>();
  private subtasks: Subtask[] = [];
  private subtaskById = new Map<string, Subtask>();
  private transports: Transport[] = [];
  private tasks = new Map<string, Task>();
  private overlapList: Overlap[] = [];
  private lateById = new Map<string, LateTransport>();
  private depth = new Map<string, number>();
  private dataDirty = true;

  /* -- view ------------------------------------------------------------- */
  private options: SceneOptions = {
    laneHeight: 44,
    calendar: [],
    zoomLimits: { min: HOUR, max: 28 * DAY },
    snap: "ticks",
    intents: [],
  };
  private domain: [number, number] = [0, DAY];
  private scrollY = 0;
  private width = 0;
  private height = 0;
  private boxes: SubtaskBox[] = [];
  private boxById = new Map<string, SubtaskBox>();
  private paths: TransportPath[] = [];

  /* -- interaction ------------------------------------------------------ */
  private handlers: SceneHandlers = {};
  private controlledTask: string | null | undefined = undefined;
  private ownTask: string | null = null;
  private selectedSubtask: string | null = null;
  private hoverKey = "nothing";
  private hoverHit: ScheduleHit = { kind: "nothing" };
  private cursor = "default";
  private gesture: Gesture = { kind: "none" };
  private readonly touches = new Map<number, { x: number; y: number }>();

  /* -- DOM ---------------------------------------------------------------- */
  private root: HTMLElement | null = null;
  private plot: HTMLElement | null = null;
  private dataCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private colours: Colours | null = null;
  private frame = 0;
  private unsubscribeTheme: (() => void) | null = null;
  private snapshot: ScheduleSnapshot = EMPTY_SNAPSHOT;
  private readonly listeners = new Set<() => void>();

  /* ==================================================================== */
  /* Registration                                                          */
  /* ==================================================================== */

  registerLane(config: LaneConfig): number {
    const id = this.nextId++;
    this.laneEntries.set(id, config);
    this.dataChanged();
    return id;
  }

  updateLane(id: number, config: LaneConfig): void {
    if (this.laneEntries.get(id) === config) return;
    this.laneEntries.set(id, config);
    this.dataChanged();
  }

  unregisterLane(id: number): void {
    this.laneEntries.delete(id);
    this.dataChanged();
  }

  registerLayer(config: LayerConfig): number {
    const id = this.nextId++;
    this.layerEntries.set(id, config);
    this.dataChanged();
    return id;
  }

  updateLayer(id: number, config: LayerConfig): void {
    if (this.layerEntries.get(id) === config) return;
    this.layerEntries.set(id, config);
    this.dataChanged();
  }

  unregisterLayer(id: number): void {
    this.layerEntries.delete(id);
    this.dataChanged();
  }

  setOptions(options: SceneOptions, initialDomain: readonly [number, number] | null): void {
    const calendarChanged = options.calendar !== this.options.calendar;
    this.options = options;
    if (initialDomain !== null || calendarChanged) {
      const wall = initialDomain ?? [toWallClock(this.domain[0], this.options.calendar), toWallClock(this.domain[1], this.options.calendar)];
      this.domain = [toOperatingTimeClamped(wall[0], options.calendar), toOperatingTimeClamped(wall[1], options.calendar)];
    }
    this.viewChanged();
  }

  setHandlers(handlers: SceneHandlers): void {
    this.handlers = handlers;
  }

  /** `undefined`: the scene keeps the selection itself. */
  setControlledTask(task: string | null | undefined): void {
    if (task === this.controlledTask) return;
    this.controlledTask = task;
    this.viewChanged();
  }

  private get selectedTask(): string | null {
    return this.controlledTask !== undefined ? this.controlledTask : this.ownTask;
  }

  private dataChanged(): void {
    this.dataDirty = true;
    this.viewChanged();
  }

  private rebuildData(): void {
    if (!this.dataDirty) return;
    this.dataDirty = false;
    const laneIds = [...this.laneEntries.keys()].sort((a, b) => a - b);
    this.lanes = laneIds.map((id) => this.laneEntries.get(id)!);
    this.laneIndex = new Map(this.lanes.map((lane, i) => [lane.id, i] as const));
    const layerIds = [...this.layerEntries.keys()].sort((a, b) => a - b);
    this.subtasks = [];
    this.transports = [];
    this.tasks = new Map();
    for (const id of layerIds) {
      const layer = this.layerEntries.get(id)!;
      if (layer.kind === "subtasks") {
        this.subtasks.push(...layer.data);
        for (const task of layer.tasks) this.tasks.set(task.id, task);
      } else {
        this.transports.push(...layer.data);
      }
    }
    this.subtaskById = new Map(this.subtasks.map((s) => [s.id, s] as const));
    this.overlapList = overlaps(this.subtasks);
    this.lateById = new Map(lateTransports(this.subtasks, this.transports).map((l) => [l.transport, l] as const));
    this.depth = overlapDepth(this.subtasks);
    this.colours = null;
    if (this.selectedSubtask !== null && !this.subtaskById.has(this.selectedSubtask)) this.selectedSubtask = null;
  }

  /* ==================================================================== */
  /* DOM binding                                                           */
  /* ==================================================================== */

  bind(root: HTMLElement, plot: HTMLElement, data: HTMLCanvasElement, overlay: HTMLCanvasElement): void {
    this.root = root;
    this.plot = plot;
    this.dataCanvas = data;
    this.overlayCanvas = overlay;
    this.unsubscribeTheme = subscribeTheme(() => {
      this.colours = null;
      this.requestDraw();
    });
    this.viewChanged();
  }

  unbind(): void {
    this.unsubscribeTheme?.();
    this.unsubscribeTheme = null;
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.root = this.plot = this.dataCanvas = this.overlayCanvas = null;
  }

  resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return;
    this.width = Math.max(0, Math.round(width));
    this.height = Math.max(0, Math.round(height));
    this.viewChanged();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ScheduleSnapshot => this.snapshot;

  getServerSnapshot = (): ScheduleSnapshot => EMPTY_SNAPSHOT;

  /* ==================================================================== */
  /* Viewport                                                                  */
  /* ==================================================================== */

  private view(): Viewport {
    return {
      scale: new LinearScale(this.domain, [0, this.width]),
      calendar: this.options.calendar,
      laneHeight: this.options.laneHeight,
      scrollY: this.scrollY,
    };
  }

  private maxScroll(): number {
    return Math.max(0, this.lanes.length * this.options.laneHeight - this.height);
  }

  private step(): number {
    const span = this.domain[1] - this.domain[0];
    return fineStep(this.width > 0 ? span / this.width : span);
  }

  private viewChanged(): void {
    this.rebuildData();
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY));
    this.layout();
    this.publish();
    this.requestDraw();
  }

  private layout(): void {
    const view = this.view();
    this.boxes = [];
    this.boxById = new Map();
    for (const subtask of this.subtasks) {
      const lane = this.laneIndex.get(subtask.lane);
      if (lane === undefined) continue;
      const box = subtaskBox(view, subtask, lane, this.depth.get(subtask.id) ?? 0);
      this.boxes.push(box);
      this.boxById.set(subtask.id, box);
    }
    this.paths = [];
    for (const transport of this.transports) {
      const from = this.boxById.get(transport.from);
      const to = this.boxById.get(transport.to);
      if (from === undefined || to === undefined) continue;
      this.paths.push(transportPath(view, transport, from, to));
    }
  }

  private publish(): void {
    const view = this.view();
    const step = this.step();
    const calendar = this.options.calendar;
    const ghost = this.gesture.kind === "edit" ? this.ghostSummary(view, this.gesture) : null;
    const selected = this.selectedSubtask !== null ? this.boxById.get(this.selectedSubtask) : undefined;
    const grips: { kind: "setup" | "teardown"; x: number; y: number; height: number }[] = [];
    if (selected !== undefined && this.gesture.kind !== "edit" && selected.subtask.task === this.selectedTask) {
      if (this.options.intents.includes("setup")) grips.push({ kind: "setup", x: selected.outerFrom, y: selected.y, height: selected.height });
      if (this.options.intents.includes("teardown")) grips.push({ kind: "teardown", x: selected.outerTo, y: selected.y, height: selected.height });
    }
    this.snapshot = {
      width: this.width,
      height: this.height,
      laneHeight: this.options.laneHeight,
      scrollY: this.scrollY,
      lanes: this.lanes,
      days:
        this.width > 0
          ? days(this.domain, calendar).map((day) => {
              const x = Math.round(view.scale.toPx(day.from));
              return { start: day.start, x, width: Math.round(view.scale.toPx(day.to)) - x };
            })
          : [],
      ticks:
        this.width > 0
          ? fineTicks(this.domain, step, calendar).map((tick) => ({ wallClock: tick.wallClock, x: Math.round(view.scale.toPx(tick.operatingTime)) }))
          : [],
      step,
      ghost,
      grips,
      cursor: this.cursor,
    };
    for (const listener of this.listeners) listener();
  }

  /* ==================================================================== */
  /* Hit                                                                   */
  /* ==================================================================== */

  private hitAt(x: number, y: number): ScheduleHit {
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
    const lane = laneAt(this.view(), y, this.lanes.length);
    return lane >= 0 ? { kind: "lane", lane: this.lanes[lane]!.id } : { kind: "nothing" };
  }

  private timeAt(x: number): number {
    const operating = this.view().scale.fromPx(x);
    const calendar = calendarFrom(this.options.calendar);
    if (calendar.intervals.length === 0) return operating;
    return toWallClock(Math.max(0, Math.min(calendar.total, operating)), calendar);
  }

  private laneIdAt(y: number): string | null {
    const index = laneAt(this.view(), y, this.lanes.length);
    return index >= 0 ? this.lanes[index]!.id : null;
  }

  private local(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.plot?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  }

  private report(type: ScheduleInteraction["type"], hit: ScheduleHit, clientX: number, clientY: number, x: number, y: number): void {
    this.handlers.onInteraction?.({ type, hit, clientX, clientY, time: this.timeAt(x), lane: this.laneIdAt(y) });
  }

  /* ==================================================================== */
  /* Pointer                                                               */
  /* ==================================================================== */

  pointerDown(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      const { x, y } = this.local(event.clientX, event.clientY);
      this.touches.set(event.pointerId, { x, y });
      if (this.touches.size === 2) {
        this.cancelEdit();
        this.gesture = { kind: "pinch", distance: this.touchDistance() };
        return;
      }
    }
    if (event.button !== 0) return;
    const { x, y } = this.local(event.clientX, event.clientY);
    const grip = (event.target as Element | null)?.closest?.("[data-grip]")?.getAttribute("data-grip");
    const selected = this.selectedSubtask !== null ? this.subtaskById.get(this.selectedSubtask) ?? null : null;
    if (event.pointerType === "touch") {
      /* Touch pans and pinches; editing by touch is not part of this version
         (spec, Out of Scope), so a finger on a subtask pans as well. */
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, mode: "pan", subtask: null };
    } else if ((grip === "setup" || grip === "teardown") && selected !== null) {
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, mode: grip, subtask: selected };
    } else {
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, ...this.modeAt(x, y) };
    }
    this.plot?.setPointerCapture?.(event.pointerId);
  }

  /** What a press at a point would start, given the intents the caller handles. */
  private modeAt(x: number, y: number): { mode: EditMode | "pan"; subtask: Subtask | null } {
    const intents = this.options.intents;
    for (let i = this.boxes.length - 1; i >= 0; i--) {
      const box = this.boxes[i]!;
      if (intents.includes("stretch")) {
        const edge = edgeAt(box, x, y);
        if (edge !== null) return { mode: edge === "from" ? "stretch-from" : "stretch-to", subtask: box.subtask };
      }
      if (partAt(box, x, y) !== null) {
        return intents.includes("move") || intents.includes("lane") ? { mode: "move", subtask: box.subtask } : { mode: "pan", subtask: box.subtask };
      }
    }
    return { mode: "pan", subtask: null };
  }

  pointerMove(event: PointerEvent): void {
    const { x, y } = this.local(event.clientX, event.clientY);
    if (event.pointerType === "touch" && this.touches.has(event.pointerId)) {
      this.touches.set(event.pointerId, { x, y });
      if (this.gesture.kind === "pinch") {
        const distance = this.touchDistance();
        if (distance > 0 && this.gesture.distance > 0) {
          const centre = this.touchCentre();
          this.zoomAt(centre, this.gesture.distance / distance);
        }
        this.gesture = { kind: "pinch", distance };
        return;
      }
    }
    const gesture = this.gesture;
    if (gesture.kind === "pending" && gesture.pointerId === event.pointerId) {
      if (Math.hypot(x - gesture.x0, y - gesture.y0) < CLICK_SLOP) return;
      if (gesture.mode === "pan" || gesture.subtask === null) {
        this.gesture = { kind: "pan", pointerId: gesture.pointerId, lastX: gesture.x0, lastY: gesture.y0 };
        this.setCursor("grabbing");
      } else {
        this.gesture = { kind: "edit", pointerId: gesture.pointerId, mode: gesture.mode, subtask: gesture.subtask, x0: gesture.x0, ghost: gesture.subtask };
        this.setCursor(gesture.mode === "move" ? "grabbing" : "ew-resize");
      }
    }
    const current = this.gesture;
    if (current.kind === "pan" && current.pointerId === event.pointerId) {
      this.pan(current.lastX - x, current.lastY - y);
      this.gesture = { ...current, lastX: x, lastY: y };
      return;
    }
    if (current.kind === "edit" && current.pointerId === event.pointerId) {
      this.gesture = { ...current, ghost: this.ghostFor(current, x, y) };
      this.publish();
      this.requestDraw();
      return;
    }
    if (current.kind === "none") this.hover(event.clientX, event.clientY, x, y);
  }

  pointerUp(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      this.touches.delete(event.pointerId);
      if (this.gesture.kind === "pinch") {
        if (this.touches.size < 2) this.gesture = { kind: "none" };
        return;
      }
    }
    const gesture = this.gesture;
    const { x, y } = this.local(event.clientX, event.clientY);
    if (gesture.kind === "pending" && gesture.pointerId === event.pointerId) {
      this.gesture = { kind: "none" };
      this.click(event.clientX, event.clientY, x, y);
    } else if (gesture.kind === "pan" && gesture.pointerId === event.pointerId) {
      this.gesture = { kind: "none" };
      this.setCursor("default");
      this.hover(event.clientX, event.clientY, x, y);
    } else if (gesture.kind === "edit" && gesture.pointerId === event.pointerId) {
      this.gesture = { kind: "none" };
      const intents = this.intentsOf(gesture.subtask, gesture.ghost, gesture.mode);
      this.setCursor("default");
      this.publish();
      this.requestDraw();
      for (const intent of intents) this.handlers.onIntent?.(intent);
    }
  }

  pointerCancel(event: PointerEvent): void {
    this.touches.delete(event.pointerId);
    this.cancelEdit();
    this.gesture = { kind: "none" };
  }

  pointerLeave(): void {
    if (this.gesture.kind !== "none") return;
    this.setHover({ kind: "nothing" }, "nothing");
  }

  /** Escape while a drag is in flight: the ghost goes, and nothing is reported. */
  cancelEdit(): boolean {
    if (this.gesture.kind !== "edit") return false;
    this.gesture = { kind: "none" };
    this.setCursor("default");
    this.publish();
    this.requestDraw();
    return true;
  }

  contextMenu(event: MouseEvent): void {
    if (this.handlers.onInteraction === undefined) return;
    event.preventDefault();
    const { x, y } = this.local(event.clientX, event.clientY);
    this.report("contextmenu", this.hitAt(x, y), event.clientX, event.clientY, x, y);
  }

  wheel(event: WheelEvent): void {
    event.preventDefault();
    const { x } = this.local(event.clientX, event.clientY);
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.height : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    if (!event.ctrlKey && (Math.abs(dx) > Math.abs(dy) || event.shiftKey)) {
      this.pan(event.shiftKey && dx === 0 ? dy : dx, 0);
      return;
    }
    /* A pinch on a trackpad arrives as a wheel with ctrlKey and small deltas. */
    this.zoomAt(x, Math.exp(dy * (event.ctrlKey ? 0.01 : 0.0015)));
  }

  private click(clientX: number, clientY: number, x: number, y: number): void {
    const hit = this.hitAt(x, y);
    const task =
      hit.kind === "subtask"
        ? hit.subtask.task
        : hit.kind === "transport"
          ? (this.subtaskById.get(hit.transport.from)?.task ?? null)
          : null;
    this.selectedSubtask = hit.kind === "subtask" ? hit.subtask.id : null;
    if (task !== this.selectedTask) {
      if (this.controlledTask === undefined) this.ownTask = task;
      this.handlers.onSelectedTaskChange?.(task);
    }
    this.publish();
    this.requestDraw();
    this.report("click", hit, clientX, clientY, x, y);
  }

  private hover(clientX: number, clientY: number, x: number, y: number): void {
    const hit = this.hitAt(x, y);
    const key =
      hit.kind === "subtask"
        ? `subtask:${hit.subtask.id}:${hit.part}`
        : hit.kind === "transport"
          ? `transport:${hit.transport.id}`
          : hit.kind === "lane"
            ? `lane:${hit.lane}`
            : "nothing";
    const { mode } = this.modeAt(x, y);
    this.setCursor(mode === "move" ? "grab" : mode === "stretch-from" || mode === "stretch-to" ? "ew-resize" : "default");
    if (key === this.hoverKey) return;
    this.setHover(hit, key);
    this.report("hover", hit, clientX, clientY, x, y);
  }

  private setHover(hit: ScheduleHit, key: string): void {
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    this.hoverHit = hit;
    this.requestDraw();
  }

  private setCursor(cursor: string): void {
    if (cursor === this.cursor) return;
    this.cursor = cursor;
    this.publish();
  }

  private pan(dx: number, dy: number): void {
    const span = this.domain[1] - this.domain[0];
    if (this.width > 0 && dx !== 0) this.domain = panDomain(this.domain, (dx / this.width) * span);
    this.scrollY = Math.max(0, Math.min(this.maxScroll(), this.scrollY + dy));
    this.viewChanged();
  }

  private zoomAt(x: number, factor: number): void {
    if (this.width <= 0 || !Number.isFinite(factor)) return;
    const anchor = this.view().scale.fromPx(x);
    this.domain = zoomDomain(this.domain, anchor, factor, this.options.zoomLimits);
    this.viewChanged();
  }

  private touchDistance(): number {
    const [a, b] = [...this.touches.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private touchCentre(): number {
    const [a, b] = [...this.touches.values()];
    return a && b ? (a.x + b.x) / 2 : 0;
  }

  /* ==================================================================== */
  /* Ghost and intents                                                     */
  /* ==================================================================== */

  private snapStep(): number {
    const snap = this.options.snap;
    return snap === "ticks" ? this.step() : snap === false ? 0 : snap;
  }

  private ghostFor(gesture: Extract<Gesture, { kind: "edit" }>, x: number, y: number): Subtask {
    const s = gesture.subtask;
    const step = this.snapStep();
    const intents = this.options.intents;
    const at = this.snapInside(this.timeAt(x), step);
    switch (gesture.mode) {
      case "move": {
        let from = s.from;
        /* A drag straight across the lanes asks for no new time: snapping a
           start that lies off the raster would report a move nobody made. */
        if (intents.includes("move") && Math.abs(x - gesture.x0) >= CLICK_SLOP) {
          const calendar = this.options.calendar;
          const delta = this.view().scale.fromPx(x) - this.view().scale.fromPx(gesture.x0);
          const start = toOperatingTimeClamped(s.from, calendar) + delta;
          const total = calendarFrom(calendar);
          const wall = total.intervals.length === 0 ? start : toWallClock(Math.max(0, Math.min(total.total, start)), total);
          from = this.snapInside(wall, step);
        }
        const laneId = intents.includes("lane") ? (this.laneIdAt(Math.max(0, Math.min(this.lanes.length * this.options.laneHeight - this.scrollY - 1, y))) ?? s.lane) : s.lane;
        return { ...s, from, to: from + (s.to - s.from), lane: laneId };
      }
      case "stretch-from":
        return { ...s, from: Math.min(at, s.to - Math.max(step, 60_000)) };
      case "stretch-to":
        return { ...s, to: Math.max(at, s.from + Math.max(step, 60_000)) };
      case "setup":
        return { ...s, setup: Math.max(0, s.from - at) };
      case "teardown":
        return { ...s, teardown: Math.max(0, at - s.to) };
    }
  }

  /** Snapped - and, where the raster lands in time the calendar removes, moved
      on to the seam, where time counts again. An intent never asks for a time
      the plant does not run. */
  private snapInside(time: number, step: number): number {
    const snapped = snapTime(time, step);
    const calendar = calendarFrom(this.options.calendar);
    if (calendar.intervals.length === 0) return snapped;
    return toWallClock(toOperatingTimeClamped(snapped, calendar), calendar);
  }

  private intentsOf(original: Subtask, ghost: Subtask, mode: EditMode): Intent[] {
    const intents: Intent[] = [];
    const allowed = this.options.intents;
    const id = original.id;
    if (mode === "move") {
      if (ghost.from !== original.from && allowed.includes("move")) intents.push({ kind: "move", subtask: id, from: ghost.from, to: ghost.to });
      if (ghost.lane !== original.lane && allowed.includes("lane")) intents.push({ kind: "lane", subtask: id, lane: ghost.lane });
    } else if (mode === "stretch-from" || mode === "stretch-to") {
      if (ghost.from !== original.from || ghost.to !== original.to) intents.push({ kind: "stretch", subtask: id, from: ghost.from, to: ghost.to });
    } else if (mode === "setup") {
      if ((ghost.setup ?? 0) !== (original.setup ?? 0)) intents.push({ kind: "setup", subtask: id, setup: ghost.setup ?? 0 });
    } else if ((ghost.teardown ?? 0) !== (original.teardown ?? 0)) {
      intents.push({ kind: "teardown", subtask: id, teardown: ghost.teardown ?? 0 });
    }
    return intents;
  }

  /** The findings the ghost would create, assessed as if it were data. */
  private ghostFindings(ghost: Subtask): { overlaps: Overlap[]; late: LateTransport[] } {
    const assessed = this.subtasks.map((s) => (s.id === ghost.id ? ghost : s));
    const own = (o: Overlap) => o.first === ghost.id || o.second === ghost.id;
    const touching = this.transports.filter((t) => t.from === ghost.id || t.to === ghost.id);
    return { overlaps: overlaps(assessed).filter(own), late: lateTransports(assessed, touching) };
  }

  private ghostBox(view: Viewport, ghost: Subtask): SubtaskBox | null {
    const lane = this.laneIndex.get(ghost.lane);
    return lane === undefined ? null : subtaskBox(view, ghost, lane, 0);
  }

  private ghostSummary(view: Viewport, gesture: Extract<Gesture, { kind: "edit" }>): ScheduleSnapshot["ghost"] {
    const box = this.ghostBox(view, gesture.ghost);
    if (box === null) return null;
    const found = this.ghostFindings(gesture.ghost);
    const outer = gesture.mode === "setup" || gesture.mode === "teardown";
    const shown = outer ? occupied(gesture.ghost) : gesture.ghost;
    return {
      x: outer ? box.outerFrom : box.mainFrom,
      y: box.y,
      from: shown.from,
      to: shown.to,
      overlap: found.overlaps.length > 0,
      late: found.late.length > 0,
    };
  }

  /* ==================================================================== */
  /* Drawing                                                               */
  /* ==================================================================== */

  private requestDraw(): void {
    if (this.frame !== 0 || this.dataCanvas === null || typeof requestAnimationFrame !== "function") return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.draw();
    });
  }

  private resolve(): Colours | null {
    if (this.colours !== null) return this.colours;
    if (this.root === null) return null;
    const taskColours: Record<string, string> = {};
    for (const task of this.tasks.values()) taskColours[`task:${task.id}`] = task.color;
    const resolved: Record<string, string> = resolveColours<string>(this.root, { ...TOKENS, ...taskColours });
    const tasks = new Map<string, string>();
    for (const task of this.tasks.values()) tasks.set(task.id, resolved[`task:${task.id}`] ?? task.color);
    this.colours = {
      line: resolved.line!,
      lineStrong: resolved.lineStrong!,
      text: resolved.text!,
      muted: resolved.muted!,
      alarm: resolved.alarm!,
      surface: resolved.surface!,
      tasks,
    };
    return this.colours;
  }

  private context(canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null {
    if (canvas === null) return null;
    const ratio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    const width = Math.round(this.width * ratio);
    const height = Math.round(this.height * ratio);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return null;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    return ctx;
  }

  private draw(): void {
    const colours = this.resolve();
    const data = this.context(this.dataCanvas);
    const overlay = this.context(this.overlayCanvas);
    if (colours === null || data === null || overlay === null || this.width === 0) return;
    const view = this.view();
    this.drawGrid(data, view, colours);
    const layerIds = [...this.layerEntries.keys()].sort((a, b) => a - b);
    for (const id of layerIds) {
      const layer = this.layerEntries.get(id)!;
      if (layer.kind === "transports") {
        const own = new Set(layer.data);
        for (const path of this.paths) if (own.has(path.transport)) this.drawTransport(data, path, colours, false);
      } else {
        const own = new Set(layer.data);
        for (const box of this.boxes) if (own.has(box.subtask)) this.drawSubtask(data, box, colours, 1);
      }
    }
    for (const overlap of this.overlapList) this.drawOverlap(data, view, overlap, colours);
    this.drawSelection(data, colours);
    this.drawOverlay(overlay, view, colours);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, view: Viewport, colours: Colours): void {
    const snapshot = this.snapshot;
    ctx.lineWidth = 1;
    ctx.strokeStyle = colours.line;
    ctx.beginPath();
    for (const tick of snapshot.ticks) {
      ctx.moveTo(tick.x + 0.5, 0);
      ctx.lineTo(tick.x + 0.5, this.height);
    }
    for (let i = 1; i <= this.lanes.length; i++) {
      const y = laneTop(view, i) - 0.5;
      if (y < 0 || y > this.height) continue;
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();
    ctx.strokeStyle = colours.lineStrong;
    ctx.beginPath();
    for (const day of snapshot.days) {
      ctx.moveTo(day.x + 0.5, 0);
      ctx.lineTo(day.x + 0.5, this.height);
    }
    ctx.stroke();
    /* A seam of the operating calendar: time was taken out here, and the plot
       says so as the axis does. */
    const seams = removedIntervals(this.options.calendar);
    if (seams.length > 0) {
      ctx.strokeStyle = colours.muted;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      for (const seam of seams) {
        const x = Math.round(view.scale.toPx(seam.operatingTime)) + 0.5;
        if (x < 0 || x > this.width) continue;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  private drawSubtask(ctx: CanvasRenderingContext2D, box: SubtaskBox, colours: Colours, alpha: number): void {
    if (box.outerTo < 0 || box.outerFrom > this.width || box.y + box.height < 0 || box.y > this.height) return;
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

  private drawTransport(ctx: CanvasRenderingContext2D, path: TransportPath, colours: Colours, emphasised: boolean, late?: boolean): void {
    const from = this.subtaskById.get(path.transport.from);
    const isLate = late ?? this.lateById.has(path.transport.id);
    const selected = from !== undefined && from.task === this.selectedTask;
    const colour = isLate ? colours.alarm : (from !== undefined ? colours.tasks.get(from.task) : undefined) ?? colours.muted;
    ctx.strokeStyle = colour;
    ctx.fillStyle = colour;
    ctx.lineWidth = emphasised || selected ? 2 : 1.25;
    ctx.setLineDash(isLate ? [4, 3] : []);
    ctx.beginPath();
    ctx.moveTo(path.x1, path.y1);
    ctx.bezierCurveTo(path.c1x, path.y1, path.c2x, path.y2, path.x2, path.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    for (const [x, y] of [
      [path.x1, path.y1],
      [path.x2, path.y2],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, isLate ? 3 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawOverlap(ctx: CanvasRenderingContext2D, view: Viewport, overlap: Overlap, colours: Colours): void {
    const lane = this.laneIndex.get(overlap.lane);
    if (lane === undefined) return;
    const x0 = xOf(view, overlap.from);
    const x1 = Math.max(x0 + 2, xOf(view, overlap.to));
    const top = laneTop(view, lane);
    ctx.fillStyle = colours.alarm;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(x0, top + 1, x1 - x0, this.options.laneHeight - 2);
    ctx.globalAlpha = 1;
    ctx.fillRect(x0, top + 1, x1 - x0, 3);
  }

  private drawSelection(ctx: CanvasRenderingContext2D, colours: Colours): void {
    const task = this.selectedTask;
    if (task === null) return;
    ctx.strokeStyle = colours.text;
    ctx.lineWidth = 2;
    for (const box of this.boxes) {
      if (box.subtask.task !== task) continue;
      ctx.strokeRect(box.outerFrom - 1, box.y - 1, box.outerTo - box.outerFrom + 2, box.height + 2);
    }
  }

  private drawOverlay(ctx: CanvasRenderingContext2D, view: Viewport, colours: Colours): void {
    const hover = this.hoverHit;
    if (this.gesture.kind !== "edit") {
      if (hover.kind === "subtask") {
        const box = this.boxById.get(hover.subtask.id);
        if (box !== undefined) {
          ctx.strokeStyle = colours.text;
          ctx.lineWidth = 1;
          ctx.strokeRect(box.outerFrom - 1.5, box.y - 1.5, box.outerTo - box.outerFrom + 3, box.height + 3);
        }
      } else if (hover.kind === "transport") {
        const path = this.paths.find((p) => p.transport === hover.transport);
        if (path !== undefined) this.drawTransport(ctx, path, colours, true);
      }
      return;
    }
    const ghost = this.gesture.ghost;
    const box = this.ghostBox(view, ghost);
    if (box === null) return;
    const found = this.ghostFindings(ghost);
    for (const overlap of found.overlaps) this.drawOverlap(ctx, view, overlap, colours);
    const late = new Set(found.late.map((l) => l.transport));
    for (const transport of this.transports) {
      if (transport.from !== ghost.id && transport.to !== ghost.id) continue;
      const other = this.boxById.get(transport.from === ghost.id ? transport.to : transport.from);
      if (other === undefined) continue;
      const path = transport.from === ghost.id ? transportPath(view, transport, box, other) : transportPath(view, transport, other, box);
      this.drawTransport(ctx, path, colours, true, late.has(transport.id));
    }
    this.drawSubtask(ctx, box, colours, 0.55);
    ctx.strokeStyle = colours.text;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(box.outerFrom + 0.5, box.y + 0.5, Math.max(1, box.outerTo - box.outerFrom - 1), box.height - 1);
    ctx.setLineDash([]);
  }
}
