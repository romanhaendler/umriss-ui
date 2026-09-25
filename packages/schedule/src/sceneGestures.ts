/* Gestures: what the pointer, the wheel and a pinch do to a schedule.

   Pan and zoom change the view; a press that does not move is a click; a drag
   on something the caller lets it edit draws a ghost, assesses it like data
   and ends in intents (ADR-0023). Hover is followed so that it can be drawn
   and reported when its target changes. Nothing here writes data or draws:
   the host lays out, publishes and draws when told that something changed. */

import { MINUTE, calendarFrom, toOperatingTimeClamped, toWallClock } from "@umriss-ui/charts";
import { autoPanSpeed } from "./autoPan";
import { lateTransports, overlaps, type LateTransport, type Overlap } from "./findings";
import { edgeAt, partAt } from "./geometry";
import { occupied, type Intent, type PlaceIntent, type Subtask } from "./model";
import { refusedLanes } from "./refusal";
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
  /** Whether this subtask may go to this lane. Asked while a drag runs and
      again at the drop; absent means every lane is open. */
  canMoveTo?: (subtask: Subtask, lane: string) => boolean;
  onIntent?: (intent: Intent) => void;
  onDomainChange?: (domain: readonly [number, number]) => void;
  onInteraction?: (interaction: ScheduleInteraction) => void;
  onSelectedTaskChange?: (task: string | null, subtask: string | null) => void;
  /** Called when the planner folds or unfolds a **Lane group**, with the whole
      list. It is a view state and not an **Intent**: it says what is on
      screen, never what the plan is (ADR-0025). */
  onCollapsedGroupsChange?: (groups: readonly string[]) => void;
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
  /** The planner panned or zoomed. As `viewChanged`; where the span through
      time changed, it is reported as well. */
  viewMoved(time: boolean): void;
  /** Only interaction state changed: publish and draw. */
  interactionChanged(): void;
}

type EditMode = "move" | "stretch-from" | "stretch-to" | "setup" | "teardown";

/** What the application says it is dragging in, while it drags it
    (schedule-refinement 07): the browser hands over the dragged data only on
    the drop, so the ghost before the drop can only come from the caller. */
export interface PlacingItem {
  /** The caller's key for the dragged item; it comes back in the intent. */
  readonly item: string;
  /** The task the work belongs to. */
  readonly task: string;
  /** How long its main time is. */
  readonly duration: number;
  /** The setup it brings. */
  readonly setup?: number;
  /** The teardown it brings. */
  readonly teardown?: number;
}

/** The id the ghost of a drag from outside carries while it is in flight. It
    is never data: the placed subtask gets the caller's id (`subtaskFromPlace`). */
const PLACING = "\u0000placing";

/* `refused` is the set of lanes the dragged work may not go to, asked once when
   the gesture took hold and carried by the gesture itself - so it cannot
   outlive it (`refusal.ts`). */
type Gesture =
  | { kind: "none" }
  | { kind: "place"; ghost: Subtask; item: PlacingItem; refused: ReadonlySet<string> }
  | { kind: "pending"; pointerId: number; x0: number; y0: number; mode: EditMode | "pan"; subtask: Subtask | null }
  | { kind: "pan"; pointerId: number; lastX: number; lastY: number }
  /* `t0` is the operating time the drag took hold at - not a pixel, because
     auto-pan moves the scale under a drag in flight. */
  | { kind: "edit"; pointerId: number; mode: EditMode; subtask: Subtask; t0: number; ghost: Subtask; refused: ReadonlySet<string> }
  | { kind: "pinch"; distance: number };

/** No lane refused - the answer for every gesture that cannot change a lane at
    all, and the value a gesture starts from. */
const NONE_REFUSED: ReadonlySet<string> = new Set<string>();

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

/** Movement below which a press is a click. A finger is less exact than a
    mouse: a tap wanders a few pixels, and with the mouse's slop it would pan
    instead of selecting. */
const CLICK_SLOP = 3;
const TOUCH_SLOP = 10;

/** How long a drag has to rest over a folded group before it opens for the
    gesture. Long enough that crossing one on the way somewhere else does not
    open it, short enough that a planner who meant it does not wonder. */
const SPRING_OPEN_AFTER = 600;

/** The ghost's label, as the DOM reads it. */
export interface GhostSummary {
  /** The pointer stands over a lane this subtask may not go to; the ghost
      stayed where it was allowed. */
  readonly refused: boolean;
  /** Every lane this work may not go to, for the whole run of the gesture -
      the ids, so that an application can mark its own parts beside the plot
      the way the schedule marks the lanes. */
  readonly refusedLanes: readonly string[];
  readonly x: number;
  readonly y: number;
  /** The height of the bar the label belongs to, so the label can go under it
      where there is no room above. */
  readonly height: number;
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
  /** Whether the pointer last stood over a lane the dragged work may not go
      to. It is a fact about the pointer and not about the ghost, which stayed
      where it was allowed. */
  private refused = false;
  /** Where the pointer stands on the plot while a drag is in flight - what the
      tether is drawn to, since the ghost is not following it. */
  private dragPoint = { x: 0, y: 0 };
  /** The folded group the pointer is resting over, and the timer that will
      open it for this gesture. */
  private resting: { group: string; timer: ReturnType<typeof setTimeout> } | null = null;
  hover: ScheduleHit = { kind: "nothing" };
  /** Where the pointer rests on the plot while nothing is being dragged - or,
      where the keyboard set the hover, the point its tooltip stands at. */
  hoverPoint = { x: 0, y: 0 };
  /** Whether the keyboard set the hover (ADR-0030): pointer and keys share one
      **Active subtask**, and the last input wins. The keys' hover stays when
      the pointer leaves, and the pointer takes it over by moving. */
  byKeyboard = false;
  cursor = "default";

  constructor(private readonly host: GestureHost) {}

  /* ---------------------------------------------------------------- */
  /* What the scene reads                                              */
  /* ---------------------------------------------------------------- */

  get editing(): boolean {
    return this.gesture.kind === "edit" || this.gesture.kind === "place";
  }

  /** No press, pan, pinch or drag in flight. */
  get idle(): boolean {
    return this.gesture.kind === "none";
  }

  ghostDrawing(): GhostDrawing | null {
    const gesture = this.gesture;
    if (gesture.kind !== "edit" && gesture.kind !== "place") return null;
    const found = this.ghostFindings(gesture.ghost, this.ghostHome(gesture));
    return {
      ghost: gesture.ghost,
      overlaps: found.overlaps,
      late: found.late,
      refusedLanes: gesture.refused,
      /* The tether is drawn only while the pointer really stands on a refused
         lane: the marked lanes say where the work may not go, the tether says
         that the ghost is held on purpose right now. */
      tether: this.refused ? this.dragPoint : null,
    };
  }

  ghostSummary(): GhostSummary | null {
    const gesture = this.gesture;
    if (gesture.kind !== "edit" && gesture.kind !== "place") return null;
    const box = ghostBox(this.host.view.viewport(), gesture.ghost);
    if (box === null) return null;
    const found = this.ghostFindings(gesture.ghost, this.ghostHome(gesture));
    const outer = gesture.kind === "edit" && (gesture.mode === "setup" || gesture.mode === "teardown");
    const shown = outer ? occupied(gesture.ghost) : gesture.ghost;
    return {
      refused: this.refused,
      refusedLanes: [...gesture.refused],
      x: outer ? box.outerFrom : box.mainFrom,
      y: box.y,
      height: box.height,
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
      /* A third finger joins nothing: the pinch goes on with the first two. */
      if (this.touches.size >= 2) {
        if (this.gesture.kind !== "pinch") {
          this.cancelEdit();
          this.gesture = { kind: "pinch", distance: this.touchDistance() };
        }
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

  /** A drag over a folded group: resting on one opens it for the GESTURE.

      Crossing one on the way somewhere else must not open it, so the timer
      starts when the pointer arrives and is thrown away when it leaves. What
      opens is a set the scene holds for the gesture; the caller's list is
      never written to and no change is reported, because the application did
      not fold anything (ADR-0025). */
  private restOver(y: number): void {
    const view = this.host.view;
    const group = view.foldedGroupAt(y);
    if (group === this.resting?.group) return;
    this.stopResting();
    if (group === null) return;
    this.resting = {
      group,
      timer: setTimeout(() => {
        this.resting = null;
        view.openForGesture = new Set([...view.openForGesture, group]);
        /* The rows change under the drag: the layout runs again, and the
           refused lanes of the gesture are drawn where the lanes now are. The
           held SET needs nothing - it is lane ids, and the lanes did not
           change. */
        this.host.viewChanged();
      }, SPRING_OPEN_AFTER),
    };
  }

  private stopResting(): void {
    if (this.resting !== null) clearTimeout(this.resting.timer);
    this.resting = null;
  }

  /** The end of a gesture: whatever it held open, it lets go of. */
  private closeGestureFolds(): void {
    this.stopResting();
    const view = this.host.view;
    if (view.openForGesture.size === 0) return;
    view.openForGesture = new Set();
    this.host.viewChanged();
  }

  /** The lane a drop at this y would land on, with the y held inside the rows -
      a drag carried past the last lane still aims at the last lane. */
  private onLane(y: number): string | null {
    const view = this.host.view;
    return view.dropLaneIdAt(Math.max(0, Math.min(view.lanesBottom(), y)));
  }

  /** May this subtask go to this lane? Without a rule from the caller, every
      lane is open. Asked at a drop, where the answer has to be current; while
      a drag runs, the held set answers instead. */
  private allowed(subtask: Subtask, lane: string): boolean {
    return this.host.handlers().canMoveTo?.(subtask, lane) ?? true;
  }

  /** The lanes this work may not go to, for the gesture that is beginning. A
      gesture that cannot change a lane at all asks nothing: the intents the
      caller handles decide whether the question exists. */
  private askRefused(subtask: Subtask, home: string | null): ReadonlySet<string> {
    if (!this.host.view.options.intents.includes(home === null ? "place" : "lane")) return NONE_REFUSED;
    const lanes = this.host.data.lanes.map((lane) => lane.id);
    return refusedLanes(lanes, subtask, home, this.host.handlers().canMoveTo);
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
          this.host.viewMoved(true);
        }
        this.gesture = { kind: "pinch", distance };
        return;
      }
    }
    const gesture = this.gesture;
    if (gesture.kind === "pending" && gesture.pointerId === event.pointerId) {
      if (Math.hypot(x - gesture.x0, y - gesture.y0) < (event.pointerType === "touch" ? TOUCH_SLOP : CLICK_SLOP)) return;
      if (gesture.mode === "pan" || gesture.subtask === null) {
        this.gesture = { kind: "pan", pointerId: gesture.pointerId, lastX: gesture.x0, lastY: gesture.y0 };
        this.setCursor("grabbing");
      } else {
        const t0 = this.host.view.viewport().scale.fromPx(gesture.x0);
        this.gesture = {
          kind: "edit",
          pointerId: gesture.pointerId,
          mode: gesture.mode,
          subtask: gesture.subtask,
          t0,
          ghost: gesture.subtask,
          /* Asked here, once, and drawn from the first frame of the drag: the
             lanes that are closed are marked before the pointer reaches one. */
          refused: gesture.mode === "move" ? this.askRefused(gesture.subtask, gesture.subtask.lane) : NONE_REFUSED,
        };
        this.setCursor(gesture.mode === "move" ? "grabbing" : "ew-resize");
      }
    }
    const current = this.gesture;
    if (current.kind === "pan" && current.pointerId === event.pointerId) {
      const panned = this.host.view.pan(current.lastX - x, current.lastY - y);
      if (panned.moved) this.host.viewMoved(panned.time);
      this.gesture = { ...current, lastX: x, lastY: y };
      return;
    }
    if (current.kind === "edit" && current.pointerId === event.pointerId) {
      this.lastClient = { x: event.clientX, y: event.clientY };
      this.dragPoint = { x, y };
      this.restOver(y);
      this.gesture = { ...current, ghost: this.ghostFor(current, x, y) };
      /* The hand learns what the eye may have missed: over a refused lane the
         cursor says no, and says it again as soon as the pointer leaves. */
      this.setCursor(this.refused ? "not-allowed" : current.mode === "move" ? "grabbing" : "ew-resize");
      this.host.interactionChanged();
      this.autoPan();
      return;
    }
    if (current.kind === "none") {
      this.byKeyboard = false;
      this.hoverAt(event.clientX, event.clientY, x, y);
    }
  }

  pointerUp(event: PointerEvent): void {
    if (event.pointerType === "touch") {
      this.touches.delete(event.pointerId);
      if (this.gesture.kind === "pinch") {
        /* The finger that stays pans on from where it is, as it would have
           had it been alone from the start. */
        const [rest] = this.touches;
        if (this.touches.size === 1 && rest !== undefined) {
          this.gesture = { kind: "pan", pointerId: rest[0], lastX: rest[1].x, lastY: rest[1].y };
        } else if (this.touches.size === 0) {
          this.gesture = { kind: "none" };
        }
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
      this.closeGestureFolds();
      this.gesture = { kind: "none" };
      /* The ghost never stands on a refused lane - it stayed where it was
         allowed - so what is reported is what the planner saw. The rule is
         asked once more all the same, because it may have changed while the
         drag ran; where it now turns the lane down, the LANE is dropped and
         the move in time survives. One refusal costs the planner one half of
         the gesture, not both. */
      const kept =
        gesture.ghost.lane === gesture.subtask.lane || this.allowed(gesture.subtask, gesture.ghost.lane);
      const intents = this.intentsOf(gesture.subtask, gesture.ghost, gesture.mode).filter(
        (intent) => kept || intent.kind !== "lane",
      );
      this.refused = false;
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
      if (gesture.kind !== "edit" && gesture.kind !== "place") return;
      const view = this.host.view;
      const { x, y } = this.local(this.lastClient.x, this.lastClient.y);
      const dx = autoPanSpeed(x, view.width);
      const dy = autoPanSpeed(y, view.height);
      if (dx === 0 && dy === 0) return;
      const panned = view.pan(dx, dy);
      if (!panned.moved) return;
      this.dragPoint = { x, y };
      if (gesture.kind === "edit") {
        this.gesture = { ...gesture, ghost: this.ghostFor(gesture, x, y) };
      } else {
        const wanted = this.placeGhost(gesture.item, x, y, gesture.refused);
        this.refused = wanted.refused;
        this.gesture = { ...gesture, ghost: wanted.ghost ?? gesture.ghost };
      }
      this.host.viewMoved(panned.time);
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
    this.closeGestureFolds();
    this.cancelEdit();
    this.gesture = { kind: "none" };
    this.setCursor("default");
  }

  /** Reads the hover anew where the pointer already is - after the data
      changed under it. A drop that moves a subtask changes what lies under the
      pointer without the pointer moving, and a tooltip still naming the old
      times would be a lie. Nothing is reported: no interaction happened. */
  refreshHover(): void {
    /* The keys' hover is read anew by its id, by the keys (`sceneKeys.ts`). */
    if (!this.idle || this.hoverKey === "nothing" || this.byKeyboard) return;
    const { x, y } = this.hoverPoint;
    const hit = this.host.view.hitAt(x, y);
    this.hover = hit;
    this.hoverKey = keyOf(hit);
  }

  pointerLeave(): void {
    if (this.gesture.kind !== "none" || this.byKeyboard) return;
    this.setHover({ kind: "nothing" }, "nothing");
  }

  /** Escape while a drag is in flight: the ghost goes, and nothing is reported.
      It ends a drag from outside as it ends one inside. */
  cancelEdit(): boolean {
    if (this.gesture.kind !== "edit" && this.gesture.kind !== "place") return false;
    this.stopAutoPan();
    this.closeGestureFolds();
    this.gesture = { kind: "none" };
    this.refused = false;
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
    /* Over the lane headers too, which lie left of the plot: a zoom there
       holds the plot's first instant still. */
    const x = Math.max(0, Math.min(view.width, this.local(event.clientX, event.clientY).x));
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.height : 1;
    const dx = event.deltaX * unit;
    const dy = event.deltaY * unit;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      /* A pinch sends small deltas, a mouse wheel large ones. */
      const rate = Math.abs(dy) < 50 ? 0.01 : 0.0015;
      if (view.zoomAt(x, Math.exp(dy * rate))) this.host.viewMoved(true);
      return;
    }
    if (Math.abs(dx) > Math.abs(dy) || event.shiftKey) {
      event.preventDefault();
      const panned = view.pan(event.shiftKey && dx === 0 ? dy : dx, 0);
      if (panned.moved) this.host.viewMoved(panned.time);
      return;
    }
    const room = dy > 0 ? view.maxScroll() - view.scrollY : view.scrollY;
    if (dy === 0 || room <= 0) return;
    event.preventDefault();
    const scrolled = view.pan(0, dy);
    if (scrolled.moved) this.host.viewMoved(scrolled.time);
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

  /** The keyboard sets the hover: drawn, and its tooltip shown, as the
      pointer's would be - and reported to nobody, since `onInteraction`
      speaks of pointer positions. `nothing` hands the hover back. */
  setKeyboardHover(hit: ScheduleHit, point: { x: number; y: number }): void {
    this.byKeyboard = hit.kind !== "nothing";
    this.hoverPoint = point;
    this.hover = hit;
    this.hoverKey = keyOf(hit);
    this.host.interactionChanged();
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
  /* Dragging work in from outside                                     */
  /* ---------------------------------------------------------------- */

  /** An HTML drag over the plot. While the caller has declared what it is
      dragging and handles the place intent, the drop is accepted and a ghost
      shows where the work would land. */
  dragOver(event: DragEvent, placing: PlacingItem | null): void {
    const view = this.host.view;
    if (placing === null || !view.options.intents.includes("place")) return;
    const { x, y } = this.local(event.clientX, event.clientY);
    /* Off the rows entirely - not merely over a folded group, which is where
       resting opens one. */
    if (view.laneIdAt(y) === null && view.foldedGroupAt(y) === null) {
      this.clearPlacing();
      return;
    }
    event.preventDefault();
    this.restOver(y);
    /* Asked at the first `dragOver` and held from there: before that moment
       there is no gesture to hold an answer for. */
    const refused =
      this.gesture.kind === "place"
        ? this.gesture.refused
        : /* Work dragged in sits on no lane until it is dropped. Where the
             pointer is not over one either, the rule is asked about an item
             whose own lane is empty - which is the truth of it: `canMoveTo`
             is asked ABOUT a lane, and the one this item is on is none. */
          this.askRefused(this.askedFor(placing, this.onLane(y) ?? "", x), null);
    const wanted = this.placeGhost(placing, x, y, refused);
    this.refused = wanted.refused;
    this.setCursor(wanted.refused ? "not-allowed" : "default");
    /* Refused, and the drag already stands somewhere allowed: the ghost stays
       there and says why, exactly as a drag inside the plot does. */
    const standing = this.gesture.kind === "place" ? this.gesture.ghost : null;
    const ghost = wanted.ghost ?? (wanted.refused ? standing : null);
    /* The drop effect follows the GHOST and not the pointer. A ghost is the
       promise of where a drop lands (schedule-refinement 07), and the browser
       would break that promise if it were told "none" here: it then delivers
       no drop at all, and a release over a refused lane would place nothing
       while the ghost still stood on a lane that allowed it. So "none" is said
       exactly when nothing WOULD be placed - when no ghost stands anywhere -
       and the refusal itself is said in the three channels that do not cost
       the gesture: the marked lanes, the cursor and the tether. */
    if (event.dataTransfer !== null) event.dataTransfer.dropEffect = ghost === null ? "none" : "copy";
    if (ghost === null) return;
    this.lastClient = { x: event.clientX, y: event.clientY };
    this.dragPoint = { x, y };
    this.gesture = { kind: "place", ghost, item: placing, refused };
    this.host.interactionChanged();
    /* Held at an edge, a drag from outside pans the plot along as one inside
       it does - and a native drag stops sending events when it holds still, so
       the frame loop is what carries it. */
    this.autoPan();
  }

  /** The ghost of a drag from outside at a point on the plot: none off the
      lanes, and none where the caller refuses that lane - which the answer
      says apart, because the two mean different things to the drag. */
  private placeGhost(
    placing: PlacingItem,
    x: number,
    y: number,
    refused: ReadonlySet<string>,
  ): { ghost: Subtask | null; refused: boolean } {
    const lane = this.onLane(y);
    if (lane === null) return { ghost: null, refused: false };
    /* Work dragged in may not land where placed work may not go either. */
    if (refused.has(lane)) return { ghost: null, refused: true };
    return { ghost: { ...this.askedFor(placing, lane, x), id: PLACING }, refused: false };
  }

  /** The dragged item as a subtask, under the caller's key for it - not the
      internal sentinel: the rule is asked about the thing the application says
      it is dragging, and the ghost only afterwards takes the sentinel. */
  private askedFor(placing: PlacingItem, lane: string, x: number): Subtask {
    const from = this.snapInside(this.host.view.timeAt(x), this.snapStep());
    return {
      id: placing.item,
      task: placing.task,
      lane,
      from,
      to: from + placing.duration,
      ...(placing.setup === undefined ? {} : { setup: placing.setup }),
      ...(placing.teardown === undefined ? {} : { teardown: placing.teardown }),
    };
  }

  /** The drop: the place intent, and the ghost goes. Off every lane, or with
      nothing declared, nothing is reported. */
  drop(event: DragEvent): void {
    const gesture = this.gesture;
    if (gesture.kind !== "place") return;
    event.preventDefault();
    const { ghost, item } = gesture;
    this.stopAutoPan();
    this.closeGestureFolds();
    this.gesture = { kind: "none" };
    this.refused = false;
    this.cursor = "default";
    this.host.interactionChanged();
    /* Asked again at the drop, as a drag within the plot asks: the held set
       may be a moment old, and a rule that changed while the drag ran holds
       either way. There is no other half to save here - a place is one intent -
       so a refusal at the drop reports nothing. */
    if (!this.allowed({ ...ghost, id: item.item }, ghost.lane)) return;
    const intent: PlaceIntent = {
      kind: "place",
      item: item.item,
      task: ghost.task,
      lane: ghost.lane,
      from: ghost.from,
      to: ghost.to,
      ...(ghost.setup === undefined ? {} : { setup: ghost.setup }),
      ...(ghost.teardown === undefined ? {} : { teardown: ghost.teardown }),
    };
    this.host.handlers().onIntent?.(intent);
  }

  /** The drag left the plot, or the application stopped dragging - which is
      also how Escape arrives: the browser ends its own drag and sends a leave
      and a `dragend`, since it delivers no key events while a native drag
      runs. */
  clearPlacing(): void {
    this.refused = false;
    this.cursor = "default";
    this.closeGestureFolds();
    if (this.gesture.kind !== "place") return;
    this.stopAutoPan();
    this.gesture = { kind: "none" };
    this.host.interactionChanged();
  }

  /* ---------------------------------------------------------------- */
  /* Ghost and intents                                                 */
  /* ---------------------------------------------------------------- */

  snapStep(): SnapRaster {
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
        if (intents.includes("move") && Math.abs(delta * scale.m) >= CLICK_SLOP) from = this.shifted(s.from, delta, step);
        let lane = gesture.ghost.lane;
        if (intents.includes("lane")) {
          const wanted = this.onLane(y) ?? lane;
          /* A lane the subtask may not go to is refused, and the ghost stays
             where it last stood: a planner always sees where a drop would
             land, and never somewhere it could not. The set was asked when the
             drag took hold and is only read here. */
          this.refused = gesture.refused.has(wanted);
          if (!this.refused) lane = wanted;
        } else {
          this.refused = false;
        }
        return { ...s, from, to: from + (s.to - s.from), lane };
      }
      case "stretch-from":
        return { ...s, from: Math.min(at, s.to - Math.max(step.step, MINUTE)) };
      case "stretch-to":
        return { ...s, to: Math.max(at, s.from + Math.max(step.step, MINUTE)) };
      case "setup":
        return { ...s, setup: Math.max(0, s.from - at) };
      case "teardown":
        return { ...s, teardown: Math.max(0, at - s.to) };
    }
  }

  /** A time moved by an amount of OPERATING time and snapped: a drag moves
      a start this way, and a key by one step of the raster - one arithmetic,
      so a key proposes exactly what a drag of that length would. */
  shifted(time: number, delta: number, step: SnapRaster): number {
    const calendar = calendarFrom(this.host.view.options.calendar);
    const moved = toOperatingTimeClamped(time, calendar) + delta;
    const wall = calendar.intervals.length === 0 ? moved : toWallClock(Math.max(0, Math.min(calendar.total, moved)), calendar);
    return this.snapInside(wall, step);
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

  /** The lane the ghost came from - the only other lane a drag can touch. */
  private ghostHome(gesture: Extract<Gesture, { kind: "edit" | "place" }>): string {
    return gesture.kind === "edit" ? gesture.subtask.lane : gesture.ghost.lane;
  }

  /** The findings the ghost would create, assessed as if it were data - the
      ghost of a drag from outside is added to the data, the ghost of a drag
      inside it replaces the subtask it came from.

      Only the two lanes a drag can touch are assessed, the one the ghost is
      over and the one it came from: an overlap is a finding of one lane, and
      every other lane's overlaps are the ones already assessed. That is what
      keeps a plan of hundreds of tasks fluid while a drag runs, since this is
      computed on every pointer movement. */
  private ghostFindings(ghost: Subtask, home: string): { overlaps: Overlap[]; late: LateTransport[] } {
    const data = this.host.data;
    const onLane = (s: Subtask) => s.lane === ghost.lane || s.lane === home;
    const others = data.subtasks.filter((s) => s.id !== ghost.id && onLane(s));
    const assessed = [...others, ghost];
    const own = (o: Overlap) => o.first === ghost.id || o.second === ghost.id;
    /* A transport is judged against both its ends, wherever they lie. */
    const touching = data.transports.filter((t) => t.from === ghost.id || t.to === ghost.id);
    const ends = ghost.id === PLACING ? data.subtasks : data.subtasks.map((s) => (s.id === ghost.id ? ghost : s));
    return { overlaps: overlaps(assessed).filter(own), late: lateTransports(ends, touching) };
  }
}
