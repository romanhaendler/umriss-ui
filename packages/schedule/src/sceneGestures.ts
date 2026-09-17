/* Gestures: what the pointer, the wheel and a pinch do to a schedule.

   Pan and zoom change the view; a press that does not move is a click; a drag
   on something the caller lets it edit draws a ghost, assesses it like data
   and ends in intents (ADR-0023). Hover is followed so that it can be drawn
   and reported when its target changes. Nothing here writes data or draws:
   the host lays out, publishes and draws when told that something changed. */

import { calendarFrom, toOperatingTimeClamped, toWallClock } from "@umriss-ui/charts";
import { autoPanSpeed } from "./autoPan";
import { lateTransports, overlaps, type LateTransport, type Overlap } from "./findings";
import { edgeAt, partAt } from "./geometry";
import { occupied, type Intent, type Subtask } from "./model";
import type { SceneData } from "./sceneData";
import { ghostBox, type GhostDrawing } from "./sceneDraw";
import type { ScheduleHit, SceneView } from "./sceneView";
import { snapTime, type SnapRaster } from "./snap";

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

/** What the gestures need from the scene they belong to. */
export interface GestureHost {
  readonly data: SceneData;
  readonly view: SceneView;
  plotElement(): HTMLElement | null;
  handlers(): SceneHandlers;
  selectedSubtask(): string | null;
  /** A click chose a task and possibly one of its subtasks. */
  select(task: string | null, subtask: string | null): void;
  /** The view moved: lay out, publish, draw. */
  viewChanged(): void;
  /** Only interaction state changed: publish and draw. */
  interactionChanged(): void;
}

type EditMode = "move" | "stretch-from" | "stretch-to" | "setup" | "teardown";

type Gesture =
  | { kind: "none" }
  | { kind: "pending"; pointerId: number; x0: number; y0: number; mode: EditMode | "pan"; subtask: Subtask | null }
  | { kind: "pan"; pointerId: number; lastX: number; lastY: number }
  /* `t0` is the operating time the drag took hold at - not a pixel, because
     auto-pan moves the scale under a drag in flight. */
  | { kind: "edit"; pointerId: number; mode: EditMode; subtask: Subtask; t0: number; ghost: Subtask }
  | { kind: "pinch"; distance: number };

/** What the pointer is on, as one comparable value: hover is drawn and
    reported when this changes, not on every movement. */
function keyOf(hit: ScheduleHit): string {
  switch (hit.kind) {
    case "subtask":
      return `subtask:${hit.subtask.id}:${hit.part}`;
    case "transport":
      return `transport:${hit.transport.id}`;
    case "lane":
      return `lane:${hit.lane}`;
    default:
      return "nothing";
  }
}

/** Movement below which a press is a click. */
const CLICK_SLOP = 3;

/** The ghost's label, as the DOM reads it. */
export interface GhostSummary {
  readonly x: number;
  readonly y: number;
  readonly from: number;
  readonly to: number;
  readonly overlap: boolean;
  readonly late: boolean;
}

export class SceneGestures {
  private gesture: Gesture = { kind: "none" };
  private readonly touches = new Map<number, { x: number; y: number }>();
  private hoverKey = "nothing";
  /** The last pointer of a drag, in client coordinates, and the frame that
      pans along while it is near an edge. */
  private lastClient = { x: 0, y: 0 };
  private panFrame = 0;
  hover: ScheduleHit = { kind: "nothing" };
  /** Where the pointer rests on the plot while nothing is being dragged. */
  hoverPoint = { x: 0, y: 0 };
  cursor = "default";

  constructor(private readonly host: GestureHost) {}

  /* ---------------------------------------------------------------- */
  /* What the scene reads                                              */
  /* ---------------------------------------------------------------- */

  get editing(): boolean {
    return this.gesture.kind === "edit";
  }

  /** No press, pan, pinch or drag in flight. */
  get idle(): boolean {
    return this.gesture.kind === "none";
  }

  ghostDrawing(): GhostDrawing | null {
    if (this.gesture.kind !== "edit") return null;
    const found = this.ghostFindings(this.gesture.ghost);
    return { ghost: this.gesture.ghost, overlaps: found.overlaps, late: found.late };
  }

  ghostSummary(): GhostSummary | null {
    const gesture = this.gesture;
    if (gesture.kind !== "edit") return null;
    const box = ghostBox(this.host, this.host.view.viewport(), gesture.ghost);
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

  /* ---------------------------------------------------------------- */
  /* Pointer                                                           */
  /* ---------------------------------------------------------------- */

  private local(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.host.plotElement()?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  }

  private report(type: ScheduleInteraction["type"], hit: ScheduleHit, clientX: number, clientY: number, x: number, y: number): void {
    const view = this.host.view;
    this.host.handlers().onInteraction?.({ type, hit, clientX, clientY, time: view.timeAt(x), lane: view.laneIdAt(y) });
  }

  pointerDown(event: PointerEvent): void {
    const { x, y } = this.local(event.clientX, event.clientY);
    if (event.pointerType === "touch") {
      this.touches.set(event.pointerId, { x, y });
      if (this.touches.size === 2) {
        this.cancelEdit();
        this.gesture = { kind: "pinch", distance: this.touchDistance() };
        return;
      }
    }
    if (event.button !== 0) return;
    const grip = (event.target as Element | null)?.closest?.("[data-grip]")?.getAttribute("data-grip");
    const selectedId = this.host.selectedSubtask();
    const selected = selectedId !== null ? (this.host.data.subtaskById.get(selectedId) ?? null) : null;
    if (event.pointerType === "touch") {
      /* Touch pans and pinches; editing by touch is not part of this version
         (spec, Out of Scope), so a finger on a subtask pans as well. */
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, mode: "pan", subtask: null };
    } else if ((grip === "setup" || grip === "teardown") && selected !== null) {
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, mode: grip, subtask: selected };
    } else {
      this.gesture = { kind: "pending", pointerId: event.pointerId, x0: x, y0: y, ...this.modeAt(x, y) };
    }
    this.host.plotElement()?.setPointerCapture?.(event.pointerId);
  }

  /** What a press at a point would start, given the intents the caller handles. */
  private modeAt(x: number, y: number): { mode: EditMode | "pan"; subtask: Subtask | null } {
    const view = this.host.view;
    const intents = view.options.intents;
    for (let i = view.boxes.length - 1; i >= 0; i--) {
      const box = view.boxes[i]!;
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
        if (distance > 0 && this.gesture.distance > 0 && this.host.view.zoomAt(this.touchCentre(), this.gesture.distance / distance)) {
          this.host.viewChanged();
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
        const t0 = this.host.view.viewport().scale.fromPx(gesture.x0);
        this.gesture = { kind: "edit", pointerId: gesture.pointerId, mode: gesture.mode, subtask: gesture.subtask, t0, ghost: gesture.subtask };
        this.setCursor(gesture.mode === "move" ? "grabbing" : "ew-resize");
      }
    }
    const current = this.gesture;
    if (current.kind === "pan" && current.pointerId === event.pointerId) {
      if (this.host.view.pan(current.lastX - x, current.lastY - y)) this.host.viewChanged();
      this.gesture = { ...current, lastX: x, lastY: y };
      return;
    }
    if (current.kind === "edit" && current.pointerId === event.pointerId) {
      this.lastClient = { x: event.clientX, y: event.clientY };
      this.gesture = { ...current, ghost: this.ghostFor(current, x, y) };
      this.host.interactionChanged();
      this.autoPan();
      return;
    }
    if (current.kind === "none") this.hoverAt(event.clientX, event.clientY, x, y);
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
      this.hoverAt(event.clientX, event.clientY, x, y);
    } else if (gesture.kind === "edit" && gesture.pointerId === event.pointerId) {
      this.stopAutoPan();
      this.gesture = { kind: "none" };
      const intents = this.intentsOf(gesture.subtask, gesture.ghost, gesture.mode);
      this.cursor = "default";
      this.host.interactionChanged();
      for (const intent of intents) this.host.handlers().onIntent?.(intent);
    }
  }

  /** While a drag is in flight near an edge, pans along once per frame and
      moves the ghost with the view. Stops by itself when the drag ends or the
      pointer leaves the zone. */
  private autoPan(): void {
    if (this.panFrame !== 0 || typeof requestAnimationFrame !== "function") return;
    const step = () => {
      this.panFrame = 0;
      const gesture = this.gesture;
      if (gesture.kind !== "edit") return;
      const view = this.host.view;
      const { x, y } = this.local(this.lastClient.x, this.lastClient.y);
      const dx = autoPanSpeed(x, view.width);
      const dy = autoPanSpeed(y, view.height);
      if ((dx === 0 && dy === 0) || !view.pan(dx, dy)) return;
      this.gesture = { ...gesture, ghost: this.ghostFor(gesture, x, y) };
      this.host.viewChanged();
      this.panFrame = requestAnimationFrame(step);
    };
    this.panFrame = requestAnimationFrame(step);
  }

  private stopAutoPan(): void {
    if (this.panFrame !== 0) cancelAnimationFrame(this.panFrame);
    this.panFrame = 0;
  }

  pointerCancel(event: PointerEvent): void {
    this.touches.delete(event.pointerId);
    this.cancelEdit();
    this.gesture = { kind: "none" };
  }

  /** Reads the hover anew where the pointer already is - after the data
      changed under it. A drop that moves a subtask changes what lies under the
      pointer without the pointer moving, and a tooltip still naming the old
      times would be a lie. Nothing is reported: no interaction happened. */
  refreshHover(): void {
    if (!this.idle || this.hoverKey === "nothing") return;
    const { x, y } = this.hoverPoint;
    const hit = this.host.view.hitAt(x, y);
    this.hover = hit;
    this.hoverKey = keyOf(hit);
  }

  pointerLeave(): void {
    if (this.gesture.kind !== "none") return;
    this.setHover({ kind: "nothing" }, "nothing");
  }

  /** Escape while a drag is in flight: the ghost goes, and nothing is reported. */
  cancelEdit(): boolean {
    if (this.gesture.kind !== "edit") return false;
    this.stopAutoPan();
    this.gesture = { kind: "none" };
    this.cursor = "default";
    this.host.interactionChanged();
    return true;
  }

  contextMenu(event: MouseEvent): void {
    if (this.host.handlers().onInteraction === undefined) return;
    event.preventDefault();
    const { x, y } = this.local(event.clientX, event.clientY);
    this.report("contextmenu", this.host.view.hitAt(x, y), event.clientX, event.clientY, x, y);
  }

  /** The wheel, as every scrolling area has it (schedule-refinement 02):
      vertical scrolls the lanes, and lets the page scroll on once they are at
      their end; Ctrl or ⌘ zooms - a trackpad pinch arrives as a wheel with
      Ctrl -; horizontal or Shift pans through time. */
  wheel(event: WheelEvent): void {
    const view = this.host.view;
    const { x } = this.local(event.clientX, event.clientY);
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.height : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      /* A pinch sends small deltas, a mouse wheel large ones. */
      const rate = Math.abs(dy) < 50 ? 0.01 : 0.0015;
      if (view.zoomAt(x, Math.exp(dy * rate))) this.host.viewChanged();
      return;
    }
    if (Math.abs(dx) > Math.abs(dy) || event.shiftKey) {
      event.preventDefault();
      if (view.pan(event.shiftKey && dx === 0 ? dy : dx, 0)) this.host.viewChanged();
      return;
    }
    const room = dy > 0 ? view.maxScroll() - view.scrollY : view.scrollY;
    if (dy === 0 || room <= 0) return;
    event.preventDefault();
    if (view.pan(0, dy)) this.host.viewChanged();
  }

  private click(clientX: number, clientY: number, x: number, y: number): void {
    const hit = this.host.view.hitAt(x, y);
    const task =
      hit.kind === "subtask" ? hit.subtask.task : hit.kind === "transport" ? this.host.data.taskOfTransport(hit.transport) : null;
    this.host.select(task, hit.kind === "subtask" ? hit.subtask.id : null);
    this.report("click", hit, clientX, clientY, x, y);
  }

  private hoverAt(clientX: number, clientY: number, x: number, y: number): void {
    const hit = this.host.view.hitAt(x, y);
    const key = keyOf(hit);
    const { mode } = this.modeAt(x, y);
    this.setCursor(mode === "move" ? "grab" : mode === "stretch-from" || mode === "stretch-to" ? "ew-resize" : "default");
    this.hoverPoint = { x, y };
    if (key === this.hoverKey) {
      /* The tooltip follows the pointer along its target. */
      if (hit.kind === "subtask" || hit.kind === "transport") this.host.interactionChanged();
      return;
    }
    this.setHover(hit, key);
    this.report("hover", hit, clientX, clientY, x, y);
  }

  private setHover(hit: ScheduleHit, key: string): void {
    if (key === this.hoverKey) return;
    this.hoverKey = key;
    this.hover = hit;
    this.host.interactionChanged();
  }

  private setCursor(cursor: string): void {
    if (cursor === this.cursor) return;
    this.cursor = cursor;
    this.host.interactionChanged();
  }

  private touchDistance(): number {
    const [a, b] = [...this.touches.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  }

  private touchCentre(): number {
    const [a, b] = [...this.touches.values()];
    return a && b ? (a.x + b.x) / 2 : 0;
  }

  /* ---------------------------------------------------------------- */
  /* Ghost and intents                                                 */
  /* ---------------------------------------------------------------- */

  private snapStep(): SnapRaster {
    const snap = this.host.view.options.snap;
    if (snap === "ticks") return { step: this.host.view.step(), offset: 0 };
    if (snap === false) return { step: 0, offset: 0 };
    return typeof snap === "number" ? { step: snap, offset: 0 } : snap;
  }

  private ghostFor(gesture: Extract<Gesture, { kind: "edit" }>, x: number, y: number): Subtask {
    const view = this.host.view;
    const s = gesture.subtask;
    const step = this.snapStep();
    const intents = view.options.intents;
    const at = this.snapInside(view.timeAt(x), step);
    switch (gesture.mode) {
      case "move": {
        let from = s.from;
        /* A drag straight across the lanes asks for no new time: snapping a
           start that lies off the raster would report a move nobody made. */
        const scale = view.viewport().scale;
        const delta = scale.fromPx(x) - gesture.t0;
        if (intents.includes("move") && Math.abs(delta * scale.m) >= CLICK_SLOP) {
          const calendar = calendarFrom(view.options.calendar);
          const start = toOperatingTimeClamped(s.from, calendar) + delta;
          const wall = calendar.intervals.length === 0 ? start : toWallClock(Math.max(0, Math.min(calendar.total, start)), calendar);
          from = this.snapInside(wall, step);
        }
        const bottom = this.host.data.lanes.length * view.options.laneHeight - view.scrollY - 1;
        const lane = intents.includes("lane") ? (view.laneIdAt(Math.max(0, Math.min(bottom, y))) ?? s.lane) : s.lane;
        return { ...s, from, to: from + (s.to - s.from), lane };
      }
      case "stretch-from":
        return { ...s, from: Math.min(at, s.to - Math.max(step.step, 60_000)) };
      case "stretch-to":
        return { ...s, to: Math.max(at, s.from + Math.max(step.step, 60_000)) };
      case "setup":
        return { ...s, setup: Math.max(0, s.from - at) };
      case "teardown":
        return { ...s, teardown: Math.max(0, at - s.to) };
    }
  }

  /** Snapped - and, where the raster lands in time the calendar removes, moved
      on to the seam, where time counts again. An intent never asks for a time
      the plant does not run. */
  private snapInside(time: number, step: SnapRaster): number {
    const snapped = snapTime(time, step);
    const calendar = calendarFrom(this.host.view.options.calendar);
    if (calendar.intervals.length === 0) return snapped;
    return toWallClock(toOperatingTimeClamped(snapped, calendar), calendar);
  }

  private intentsOf(original: Subtask, ghost: Subtask, mode: EditMode): Intent[] {
    const intents: Intent[] = [];
    const allowed = this.host.view.options.intents;
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
    const data = this.host.data;
    const assessed = data.subtasks.map((s) => (s.id === ghost.id ? ghost : s));
    const own = (o: Overlap) => o.first === ghost.id || o.second === ghost.id;
    const touching = data.transports.filter((t) => t.from === ghost.id || t.to === ghost.id);
    return { overlaps: overlaps(assessed).filter(own), late: lateTransports(assessed, touching) };
  }
}
