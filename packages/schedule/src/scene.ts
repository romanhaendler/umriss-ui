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

import { HOUR, subscribeTheme } from "@umriss-ui/charts";
import { SceneData, type LaneConfig, type LayerConfig } from "./sceneData";
import { drawData, drawOverlay, prepareCanvas, resolveSceneColours, type Colours } from "./sceneDraw";
import { SceneGestures, type GhostSummary, type SceneHandlers } from "./sceneGestures";
import { SceneView, type SceneOptions } from "./sceneView";

export type { LaneConfig, LayerConfig } from "./sceneData";
export type { SceneOptions, ScheduleHit } from "./sceneView";
export type { SceneHandlers, ScheduleInteraction } from "./sceneGestures";

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

export class ScheduleScene {
  readonly data = new SceneData(() => this.viewChanged());
  readonly view = new SceneView(this.data);
  readonly gestures: SceneGestures;

  private handlersNow: SceneHandlers = {};
  private controlledTask: string | null | undefined = undefined;
  private ownTask: string | null = null;
  private selected: string | null = null;

  private root: HTMLElement | null = null;
  private plot: HTMLElement | null = null;
  private dataCanvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private colours: Colours | null = null;
  private frame = 0;
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
    this.selected = subtask;
    if (task !== this.selectedTask) {
      if (this.controlledTask === undefined) this.ownTask = task;
      this.handlersNow.onSelectedTaskChange?.(task);
    }
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
    this.frame = 0;
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
    };
    for (const listener of this.listeners) listener();
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
    this.colours ??= resolveSceneColours(this.root, this.data);
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
  cancelEdit = (): boolean => this.gestures.cancelEdit();
}
