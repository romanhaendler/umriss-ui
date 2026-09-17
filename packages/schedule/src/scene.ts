/* The scene of one schedule: the four parts put together.

   Built in the image of the charts' scene (ADR-0022): the children register and
   render nothing, the canvas is drawn in a frame of its own, and the DOM parts -
   lane headers, both bands, the ghost's label and the grips - read one snapshot
   through `useSyncExternalStore`. Canvas access happens only once the scene is
   bound, never while rendering, so the component renders on a server and in a
   DOM without a canvas.

   The parts, each with one reason to change:
     sceneData.ts      what is registered, and what follows from it
     sceneView.ts      what is in view, the layout and the hit
     sceneDraw.ts      the two canvases
     sceneGestures.ts  pointer, wheel and pinch; the ghost and the intents
   What stays here is what joins them: the selection, the snapshot, the binding
   to the DOM and the frame the drawing runs in.

   The data is the caller's and stays as it came (ADR-0023). */

import { HOUR, calendarFrom, subscribeTheme, toWallClock } from "@umriss-ui/charts";
import { resolveAppearance } from "./appearance";
import { slotAt, xOf } from "./geometry";
import { SceneData, type LaneConfig, type LayerConfig, type ScheduleTooltipTarget } from "./sceneData";
import type { Subtask } from "./model";
import { barFace, drawData, drawOverlay, prepareCanvas, resolveSceneColours, type Colours } from "./sceneDraw";
import { barLabelBox, inView } from "./geometry";
import { SceneGestures, type GhostSummary, type PlacingItem, type SceneHandlers } from "./sceneGestures";
import { DEFAULT_LANE_HEIGHT, SceneView, type SceneOptions } from "./sceneView";

export type { LaneConfig, LayerConfig, ScheduleTooltipTarget } from "./sceneData";
export type { SceneOptions, ScheduleHit } from "./sceneView";
export type { SceneHandlers, ScheduleInteraction, PlacingItem } from "./sceneGestures";

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
  readonly ghost: GhostSummary | null;
  /** The setup and teardown grips of the selected subtask. */
  readonly grips: readonly { readonly kind: "setup" | "teardown"; readonly x: number; readonly y: number; readonly height: number }[];
  readonly cursor: string;
  /** The tooltip's target and the point it stands at, while the pointer rests
      on a subtask or transport and nothing is dragged. */
  readonly tooltip: { readonly target: ScheduleTooltipTarget; readonly x: number; readonly y: number } | null;
  /** The now line's x on the plot, or null. */
  readonly now: number | null;
  /** The visible main time of every subtask in view, for the labels a caller
      writes into the bars. */
  readonly bars: readonly {
    readonly subtask: Subtask;
    readonly x: number;
    readonly width: number;
    readonly y: number;
    readonly height: number;
    /** Whether the bar's colour is dark, so its label needs light text. */
    readonly dark: boolean;
  }[];
}

const EMPTY_SNAPSHOT: ScheduleSnapshot = {
  width: 0,
  height: 0,
  laneHeight: DEFAULT_LANE_HEIGHT,
  scrollY: 0,
  lanes: [],
  days: [],
  ticks: [],
  step: HOUR,
  ghost: null,
  grips: [],
  cursor: "default",
  tooltip: null,
  now: null,
  bars: [],
};

export class ScheduleScene {
  readonly data = new SceneData(() => this.viewChanged());
  readonly view = new SceneView(this.data);
  readonly gestures: SceneGestures;

  private handlersNow: SceneHandlers = {};
  private placing: PlacingItem | null = null;
  private controlledTask: string | null | undefined = undefined;
  private ownTask: string | null = null;
  private selected: string | null = null;

  private root: HTMLElement | null = null;
  private plot: HTMLElement | null = null;
  private dataCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private colours: Colours | null = null;
  private frame = 0;
  private domainFrame = 0;
  private unsubscribeTheme: (() => void) | null = null;
  private snapshot: ScheduleSnapshot = EMPTY_SNAPSHOT;
  private readonly listeners = new Set<() => void>();

  constructor() {
    this.gestures = new SceneGestures({
      data: this.data,
      view: this.view,
      plotElement: () => this.plot,
      handlers: () => this.handlersNow,
      selectedSubtask: () => this.selected,
      select: (task, subtask) => this.select(task, subtask),
      viewChanged: () => this.viewChanged(),
      viewMoved: (time) => {
        this.viewChanged();
        if (time) this.reportDomain();
      },
      interactionChanged: () => this.interactionChanged(),
    });
  }

  /* ---------------------------------------------------------------- */
  /* Registration and options                                          */
  /* ---------------------------------------------------------------- */

  registerLane = (config: LaneConfig): number => this.data.registerLane(config);
  updateLane = (id: number, config: LaneConfig): void => this.data.updateLane(id, config);
  unregisterLane = (id: number): void => this.data.unregisterLane(id);
  registerLayer = (config: LayerConfig): number => this.data.registerLayer(config);
  updateLayer = (id: number, config: LayerConfig): void => this.data.updateLayer(id, config);
  unregisterLayer = (id: number): void => this.data.unregisterLayer(id);

  setOptions(options: SceneOptions, initialDomain: readonly [number, number] | null): void {
    this.view.setOptions(options, initialDomain);
    this.viewChanged();
  }

  setHandlers(handlers: SceneHandlers): void {
    this.handlersNow = handlers;
  }

  /** What the application says it is dragging in, while it drags it. */
  setPlacing(placing: PlacingItem | null): void {
    this.placing = placing;
    if (placing === null) this.gestures.clearPlacing();
  }

  /** `undefined`: the scene keeps the selection itself. */
  setControlledTask(task: string | null | undefined): void {
    if (task === this.controlledTask) return;
    this.controlledTask = task;
    this.interactionChanged();
  }

  private get selectedTask(): string | null {
    return this.controlledTask !== undefined ? this.controlledTask : this.ownTask;
  }

  private select(task: string | null, subtask: string | null): void {
    const changed = task !== this.selectedTask || subtask !== this.selected;
    this.selected = subtask;
    if (task !== this.selectedTask && this.controlledTask === undefined) this.ownTask = task;
    /* Reported when either changes: a click on another stop of the same order
       is news to a caller showing the stop, and the task alone would not say
       so. */
    if (changed) this.handlersNow.onSelectedTaskChange?.(task, subtask);
    this.interactionChanged();
  }

  /* ---------------------------------------------------------------- */
  /* DOM binding                                                       */
  /* ---------------------------------------------------------------- */

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
    if (this.domainFrame !== 0) cancelAnimationFrame(this.domainFrame);
    this.frame = this.domainFrame = 0;
    this.root = this.plot = this.dataCanvas = this.overlayCanvas = null;
  }

  resize(width: number, height: number): void {
    const w = Math.max(0, Math.round(width));
    const h = Math.max(0, Math.round(height));
    if (w === this.view.width && h === this.view.height) return;
    this.view.width = w;
    this.view.height = h;
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

  /* ---------------------------------------------------------------- */
  /* Changes                                                           */
  /* ---------------------------------------------------------------- */

  private viewChanged(): void {
    if (this.data.rebuild()) {
      this.colours = null;
      if (this.selected !== null && !this.data.subtaskById.has(this.selected)) this.selected = null;
    }
    this.view.layout();
    this.gestures.refreshHover();
    this.interactionChanged();
  }

  private interactionChanged(): void {
    this.publish();
    this.requestDraw();
  }

  private publish(): void {
    const view = this.view;
    const selected = this.selected !== null ? view.boxById.get(this.selected) : undefined;
    const grips: { kind: "setup" | "teardown"; x: number; y: number; height: number }[] = [];
    if (selected !== undefined && !this.gestures.editing && selected.subtask.task === this.selectedTask) {
      if (view.options.intents.includes("setup")) grips.push({ kind: "setup", x: selected.outerFrom, y: selected.y, height: selected.height });
      if (view.options.intents.includes("teardown")) grips.push({ kind: "teardown", x: selected.outerTo, y: selected.y, height: selected.height });
    }
    this.snapshot = {
      width: view.width,
      height: view.height,
      laneHeight: view.options.laneHeight,
      scrollY: view.scrollY,
      lanes: this.data.lanes,
      ...view.bands(),
      ghost: this.gestures.ghostSummary(),
      grips,
      cursor: this.gestures.cursor,
      tooltip: this.tooltip(),
      now: view.nowX(),
      bars: this.bars(),
    };
    for (const listener of this.listeners) listener();
  }

  /** The bars a label could stand in: the visible part of every main time,
      with the contrast its colour calls for. Computed on every publish, which
      is what lets a label follow a bar while the plot pans. */
  private bars(): ScheduleSnapshot["bars"] {
    const view = this.view;
    if (view.width <= 0) return [];
    const colours = this.colours;
    return view.boxes.flatMap((box) => {
      if (!inView(box, view.width, view.height)) return [];
      const place = barLabelBox(box, view.width);
      if (place === null) return [];
      /* What the label lies on, asked of the drawing itself: a hollow bar is
         the surface and takes the text colour, a muted one is the mix and not
         the task colour. One answer, so the label and the caps beside it can
         never disagree (`barFace`). */
      const colour = colours === null ? undefined : colours.tasks.get(box.subtask.task);
      const dark =
        colour === undefined || colours === null
          ? true
          : barFace(resolveAppearance(box.subtask.appearance), colour, colours).onDark;
      return [{ subtask: box.subtask, ...place, dark }];
    });
  }

  private tooltip(): ScheduleSnapshot["tooltip"] {
    const hover = this.gestures.hover;
    if (!this.gestures.idle) return null;
    const target = this.data.tooltipTargetFor(hover);
    if (target === null) return null;
    const { x, y } = this.gestures.hoverPoint;
    return { target, x, y };
  }

  /** The visible span, as two wall-clock instants. */
  visibleDomain(): [number, number] {
    const calendar = calendarFrom(this.view.options.calendar);
    const wall = (v: number) =>
      calendar.intervals.length === 0 ? v : toWallClock(Math.max(0, Math.min(calendar.total, v)), calendar);
    return [wall(this.view.domain[0]), wall(this.view.domain[1])];
  }

  /** Reported once per frame, however many wheel steps a planner turns - and
      only for their gestures: a span handed in from outside is not news to the
      caller who handed it in, and reporting it would let two schedules
      synchronised with each other feed one another for ever. */
  private reportDomain(): void {
    if (typeof requestAnimationFrame !== "function") {
      this.handlersNow.onDomainChange?.(this.visibleDomain());
      return;
    }
    if (this.domainFrame !== 0) return;
    this.domainFrame = requestAnimationFrame(() => {
      this.domainFrame = 0;
      this.handlersNow.onDomainChange?.(this.visibleDomain());
    });
  }

  /** The time and the lane at a client point, or null outside the plot. */
  positionAt(clientX: number, clientY: number): { time: number; lane: string | null } | null {
    const rect = this.plot?.getBoundingClientRect();
    if (rect === undefined) return null;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    return { time: this.view.timeAt(x), lane: this.view.laneIdAt(y) };
  }

  /** The client point of a time, on a lane's middle where one is named, or
      null while the schedule is not on screen. */
  clientPointOf(time: number, lane?: string): { x: number; y: number } | null {
    const rect = this.plot?.getBoundingClientRect();
    if (rect === undefined) return null;
    const viewport = this.view.viewport();
    /* The SLOT: a lane inside a folded group answers with the middle of its
       strip, so a caller's pin keeps pointing at the work (ADR-0025). */
    const slot = lane === undefined ? null : slotAt(viewport, lane);
    const y = slot === null ? 0 : slot.top + slot.height / 2;
    return { x: rect.left + xOf(viewport, time), y: rect.top + y };
  }

  private requestDraw(): void {
    if (this.frame !== 0 || this.dataCanvas === null || typeof requestAnimationFrame !== "function") return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.draw();
    });
  }

  private draw(): void {
    if (this.root === null) return;
    if (this.colours === null) {
      this.colours = resolveSceneColours(this.root, this.data);
      /* Publish again, now that the colours are known. A bar label's contrast
         follows what its bar is actually painted in (`bars`), and the theme
         can only be read once the scene is bound - which is after the first
         snapshot went out. Without this, every label kept the contrast of the
         first publish, when nothing had a colour yet. */
      this.publish();
    }
    const { width, height } = this.view;
    const data = prepareCanvas(this.dataCanvas, width, height);
    const overlay = prepareCanvas(this.overlayCanvas, width, height);
    if (data === null || overlay === null || width === 0) return;
    const input = {
      data: this.data,
      view: this.view,
      colours: this.colours,
      bands: this.snapshot,
      selectedTask: this.selectedTask,
      selectedSubtask: this.selected,
      hover: this.gestures.hover,
      ghost: this.gestures.ghostDrawing(),
    };
    drawData(data, input);
    drawOverlay(overlay, input);
  }

  /* ---------------------------------------------------------------- */
  /* Gestures, as the component hands them in                          */
  /* ---------------------------------------------------------------- */

  pointerDown = (event: PointerEvent): void => this.gestures.pointerDown(event);
  pointerMove = (event: PointerEvent): void => this.gestures.pointerMove(event);
  pointerUp = (event: PointerEvent): void => this.gestures.pointerUp(event);
  pointerCancel = (event: PointerEvent): void => this.gestures.pointerCancel(event);
  pointerLeave = (): void => this.gestures.pointerLeave();
  contextMenu = (event: MouseEvent): void => this.gestures.contextMenu(event);
  wheel = (event: WheelEvent): void => this.gestures.wheel(event);
  dragOver = (event: DragEvent): void => this.gestures.dragOver(event, this.placing);
  drop = (event: DragEvent): void => this.gestures.drop(event);
  dragLeave = (): void => this.gestures.clearPlacing();
  cancelEdit = (): boolean => this.gestures.cancelEdit();
}
