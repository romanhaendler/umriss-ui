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
     sceneKeys.ts      the keyboard's walk, selection and edits; the readout
   What stays here is what joins them: the selection, the snapshot, the binding
   to the DOM and the frame the drawing runs in.

   The data is the caller's and stays as it came (ADR-0023). */

import type { ReactNode } from "react";
import { DAY, HOUR, calendarFrom, subscribeTheme, toWallClock, toWorkingTimeClamped } from "@umriss-ui/charts";
import { resolveAppearance } from "./appearance";
import { slotAt, xOf } from "./geometry";
import { SceneData, type GroupConfig, type LaneConfig, type LayerConfig, type ScheduleTooltipTarget } from "./sceneData";
import type { Subtask } from "./model";
import { barFace, drawData, drawOverlay, prepareCanvas, resolveSceneColours, workColour, type Colours } from "./sceneDraw";
import { barLabelBox, inView } from "./geometry";
import { SceneGestures, type GhostSummary, type PlacingItem, type SceneHandlers } from "./sceneGestures";
import { SceneKeys, type Spoken } from "./sceneKeys";
import { DEFAULT_LANE_HEIGHT, SceneView, type SceneOptions } from "./sceneView";
import { defaultSpan, onlyKnown, viewKey, type ScheduleView } from "./view";

export type { GroupConfig, LaneConfig, LayerConfig, ScheduleTooltipTarget } from "./sceneData";
export type { SceneOptions, ScheduleHit } from "./sceneView";
export type { SceneHandlers, ScheduleInteraction, PlacingItem } from "./sceneGestures";
export type { Spoken } from "./sceneKeys";

/** One row's header, as the DOM renders it. */
export interface ScheduleHeader {
  /** The row's own key - a lane id or a group id; they cannot collide, because
      a group is never a lane (ADR-0025). */
  readonly key: string;
  readonly kind: "lane" | "groupHead" | "miniature";
  /** The lane this row is, where it is one. */
  readonly lane: string | undefined;
  /** The group this row is, where it is one. */
  readonly group: string | undefined;
  readonly label: ReactNode;
  /** How deep it lies, for the indent of its header. */
  readonly depth: number;
  /** The groups this row lies inside, outermost first. */
  readonly within: readonly string[];
  /** How many real lanes it holds - a lane holds itself. */
  readonly lanes: number;
  /** Whether this group is folded; undefined for a lane. */
  readonly collapsed: boolean | undefined;
  readonly top: number;
  readonly height: number;
}

export interface ScheduleSnapshot {
  readonly width: number;
  readonly height: number;
  readonly laneHeight: number;
  readonly scrollY: number;
  /** One entry per ROW of the plot, in the order they stand: a lane's header,
      an open group's head, or a folded group's one row. What a header shows
      and where it sits follows from this and from nothing else. */
  readonly headers: readonly ScheduleHeader[];
  /** The days of the coarse band: where they lie and what they are. */
  readonly days: readonly { readonly start: number; readonly x: number; readonly width: number }[];
  /** The ticks of the fine band, and the step they stand on. */
  readonly ticks: readonly { readonly wallClock: number; readonly x: number }[];
  readonly step: number;
  /** The ghost's label while a drag is in flight. */
  readonly ghost: GhostSummary | null;
  /** The lead-in and lead-out grips of the selected subtask. */
  readonly grips: readonly { readonly kind: "leadIn" | "leadOut"; readonly x: number; readonly y: number; readonly height: number }[];
  readonly cursor: string;
  /** The tooltip's target and the point it stands at, while the pointer rests
      on a subtask or dependency and nothing is dragged. */
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
  /** What the live region reads, set once the keys rest (schedule-a11y S4). */
  readonly spoken: Spoken | null;
  /** What the plot is described by (S6): the plan's lanes and findings, the
      subtasks in view and the visible span in wall-clock time. */
  readonly summary: {
    readonly lanes: number;
    readonly subtasks: number;
    readonly from: number;
    readonly to: number;
    readonly overlaps: number;
    readonly violated: number;
    /** Subtasks in blocked time, counted once per blocked interval covered. */
    readonly blocked: number;
  };
}

const EMPTY_SNAPSHOT: ScheduleSnapshot = {
  width: 0,
  height: 0,
  laneHeight: DEFAULT_LANE_HEIGHT,
  scrollY: 0,
  headers: [],
  days: [],
  ticks: [],
  step: HOUR,
  ghost: null,
  grips: [],
  cursor: "default",
  tooltip: null,
  now: null,
  bars: [],
  spoken: null,
  summary: { lanes: 0, subtasks: 0, from: 0, to: 0, overlaps: 0, violated: 0, blocked: 0 },
};

export class ScheduleScene {
  readonly data = new SceneData(() => this.viewChanged());
  readonly view = new SceneView(this.data);
  readonly gestures: SceneGestures;
  readonly keys: SceneKeys;

  private handlersNow: SceneHandlers = {};
  private placing: PlacingItem | null = null;
  private controlledTask: string | null | undefined = undefined;
  private ownTask: string | null = null;
  private selected: string | null = null;
  /** Which **Lane group**s are folded. Folding changes the view and not the
      plan, so it is no **Intent** (ADR-0025). */
  private folded: readonly string[];
  /** The span the view names, in wall-clock time - null while it names none
      and the schedule shows the subtasks' extent. */
  private domainInView: readonly [number, number] | null;
  /** Whether the extent has been put in view since the view stopped naming a
      span. Once, and not after every change of the data: a bar the planner
      dragged past the end must not make the whole plan jump. */
  private fitted = false;
  /** The view as `useSchedule` reads it - a new object only when its content
      changed. */
  private viewNow: ScheduleView;
  private readonly viewListeners = new Set<() => void>();
  /** Whether the planner, a setter or a view handed in has changed the view
      yet. Until then a change is the start losing the groups no LaneGroup
      declares - where the schedule starts, not a change to report. */
  private actedOn = false;
  get acted(): boolean {
    return this.actedOn;
  }

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

  constructor(initial: ScheduleView = {}) {
    this.folded = initial.folded ?? [];
    this.domainInView = initial.domain ?? null;
    /* No calendar is known yet: working time is the wall clock, and the first
       options carry the span over into theirs. */
    if (this.domainInView !== null) this.view.showWall(this.domainInView);
    this.viewNow = this.currentView();
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
    this.keys = new SceneKeys({
      data: this.data,
      view: this.view,
      gestures: this.gestures,
      handlers: () => this.handlersNow,
      visibleDomain: () => this.visibleDomain(),
      select: (task, subtask) => this.select(task, subtask),
      viewMoved: (time) => {
        this.viewChanged();
        if (time) this.reportDomain();
      },
      spokenChanged: () => this.publish(),
    });
  }

  /* ---------------------------------------------------------------- */
  /* Registration and options                                          */
  /* ---------------------------------------------------------------- */

  registerLane = (config: LaneConfig): number => this.data.registerLane(config);
  updateLane = (id: number, config: LaneConfig): void => this.data.updateLane(id, config);
  unregisterLane = (id: number): void => this.data.unregisterLane(id);
  registerGroup = (config: GroupConfig): number => this.data.registerGroup(config);
  updateGroup = (id: number, config: GroupConfig): void => this.data.updateGroup(id, config);
  unregisterGroup = (id: number): void => this.data.unregisterGroup(id);
  registerLayer = (config: LayerConfig): number => this.data.registerLayer(config);
  updateLayer = (id: number, config: LayerConfig): void => this.data.updateLayer(id, config);
  unregisterLayer = (id: number): void => this.data.unregisterLayer(id);

  setOptions(options: SceneOptions): void {
    this.view.setOptions(options);
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

  /* ---------------------------------------------------------------- */
  /* The view (ADR-0047)                                               */
  /* ---------------------------------------------------------------- */

  subscribeView = (listener: () => void): (() => void) => {
    this.viewListeners.add(listener);
    return () => {
      this.viewListeners.delete(listener);
    };
  };

  getView = (): ScheduleView => this.viewNow;

  /** Goes to a view handed in; what it leaves out goes back to its default. */
  applyView(view: ScheduleView): void {
    if (viewKey(view) === viewKey(this.viewNow)) return;
    this.actedOn = true;
    this.folded = view.folded ?? [];
    this.setDomain(view.domain ?? null);
  }

  /** Puts a span of two wall-clock instants in view; null shows the
      subtasks' extent. */
  setDomain = (span: readonly [number, number] | null): void => {
    /* A frame still to report a pan would overwrite the span just set. */
    if (this.domainFrame !== 0) cancelAnimationFrame(this.domainFrame);
    this.domainFrame = 0;
    this.actedOn = true;
    this.domainInView = span === null ? null : [span[0], span[1]];
    if (span === null) this.fitted = false;
    else this.view.showWall(span);
    this.viewChanged();
  };

  /** Folds or unfolds one group. */
  toggleGroup = (group: string): void => {
    const now = this.viewNow.folded ?? [];
    this.actedOn = true;
    this.folded = now.includes(group) ? now.filter((g) => g !== group) : [...now, group];
    this.viewChanged();
  };

  foldAll = (): void => {
    this.actedOn = true;
    this.folded = this.data.groups.map((group) => group.id);
    this.viewChanged();
  };

  unfoldAll = (): void => {
    this.actedOn = true;
    this.folded = [];
    this.viewChanged();
  };

  private currentView(): ScheduleView {
    return onlyKnown(
      { ...(this.domainInView === null ? {} : { domain: this.domainInView }), ...(this.folded.length > 0 ? { folded: this.folded } : {}) },
      new Set(this.data.groups.map((group) => group.id)),
    );
  }

  private publishView(): void {
    const next = this.currentView();
    if (viewKey(next) === viewKey(this.viewNow)) return;
    this.viewNow = next;
    for (const listener of this.viewListeners) listener();
  }

  /** The subtasks' extent within the zoom limits, while the view names no
      span - and the local day of today while there is no work to show. */
  private fit(): void {
    const calendar = this.view.options.calendar;
    const span = defaultSpan(this.data.subtasks, this.view.options.zoomLimits, (v) => toWorkingTimeClamped(v, calendar));
    if (span !== null) {
      this.view.domain = span;
      this.fitted = true;
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.view.showWall([today.getTime(), today.getTime() + DAY]);
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

  /** The **Selected subtask**, where it belongs to the selected task: a
      controlled selection can move to another task while the last click
      stays behind on the old one. */
  private get selectedSubtask(): string | null {
    const subtask = this.selected === null ? undefined : this.data.subtaskById.get(this.selected);
    return subtask !== undefined && subtask.task === this.selectedTask ? subtask.id : null;
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
    /* A drag cut short by an unmount: its auto-pan frames and the timer of a
       fold it rests over would otherwise run on without a plot. */
    this.gestures.cancelEdit();
    this.keys.stop();
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
    this.view.collapsed = new Set(this.folded);
    if (this.data.rebuild()) {
      this.colours = null;
      if (this.selected !== null && !this.data.subtaskById.has(this.selected)) this.selected = null;
    }
    if (this.domainInView === null && !this.fitted) this.fit();
    this.publishView();
    this.view.layout();
    this.gestures.refreshHover();
    this.keys.refresh();
    this.interactionChanged();
  }

  private interactionChanged(): void {
    this.publish();
    this.requestDraw();
  }

  private publish(): void {
    const view = this.view;
    const selected = this.selected !== null ? view.boxById.get(this.selected) : undefined;
    const grips: { kind: "leadIn" | "leadOut"; x: number; y: number; height: number }[] = [];
    /* No grips on a strip: a bar three pixels high is not something to stretch
       by three pixels, and the grips belong to a subtask a planner can see
       (ADR-0025). */
    if (selected !== undefined && !selected.miniature && !this.gestures.editing && selected.subtask.task === this.selectedTask) {
      if (view.options.intents.includes("leadIn")) grips.push({ kind: "leadIn", x: selected.outerFrom, y: selected.y, height: selected.height });
      if (view.options.intents.includes("leadOut")) grips.push({ kind: "leadOut", x: selected.outerTo, y: selected.y, height: selected.height });
    }
    this.snapshot = {
      width: view.width,
      height: view.height,
      laneHeight: view.options.laneHeight,
      scrollY: view.scrollY,
      headers: this.headers(),
      ...view.bands(),
      ghost: this.gestures.ghostSummary(),
      grips,
      cursor: this.gestures.cursor,
      tooltip: this.tooltip(),
      now: view.nowX(),
      bars: this.bars(),
      spoken: this.keys.spoken,
      summary: this.summary(),
    };
    for (const listener of this.listeners) listener();
  }

  /** One header per row, with what it says and where it sits. The scroll is
      not taken off here: the header column is moved as a whole, as it always
      was, so that a header and its row cannot drift apart by a rounding. */
  private headers(): readonly ScheduleHeader[] {
    const labelOfLane = new Map(this.data.lanes.map((lane) => [lane.id, lane.label] as const));
    const labelOfGroup = new Map(this.data.groups.map((group) => [group.id, group.label] as const));
    const collapsed = new Set(this.folded);
    return this.view.rows.rows.map((row) => ({
      key: row.lane ?? row.group ?? "",
      kind: row.kind,
      lane: row.lane,
      group: row.group,
      label: (row.lane !== undefined ? labelOfLane.get(row.lane) : labelOfGroup.get(row.group ?? "")) ?? row.lane ?? row.group ?? "",
      depth: row.depth,
      within: row.within,
      lanes: row.lanes,
      collapsed: row.group === undefined ? undefined : collapsed.has(row.group),
      top: row.top,
      height: row.height,
    }));
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
      const dark =
        colours === null
          ? true
          : barFace(
              resolveAppearance(box.subtask.appearance),
              workColour(colours, { selectedTask: this.selectedTask, selectedSubtask: this.selectedSubtask }, box.subtask.task, box.subtask.id),
              colours,
            ).onDark;
      return [{ subtask: box.subtask, ...place, dark }];
    });
  }

  /** The findings count the whole plan - an overlap out of view is still one
      to know of -, the subtasks only what is in view. */
  private summary(): ScheduleSnapshot["summary"] {
    const view = this.view;
    const [from, to] = this.visibleDomain();
    return {
      lanes: this.data.lanes.length,
      subtasks: view.boxes.filter((box) => inView(box, view.width, view.height)).length,
      from,
      to,
      overlaps: this.data.overlaps.length,
      violated: this.data.violatedById.size,
      blocked: this.data.inBlocked.length,
    };
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

  /** A pan or zoom of the planner's goes into the view once per frame,
      however many wheel steps they turn. */
  private reportDomain(): void {
    const take = () => {
      this.domainFrame = 0;
      this.actedOn = true;
      this.domainInView = this.visibleDomain();
      this.publishView();
    };
    if (typeof requestAnimationFrame !== "function") return take();
    if (this.domainFrame === 0) this.domainFrame = requestAnimationFrame(take);
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
      selectedSubtask: this.selectedSubtask,
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
  key = (event: KeyboardEvent): boolean => this.keys.key(event);
  focus = (byKeyboard: boolean): void => this.keys.focus(byKeyboard);
  blur = (): void => this.keys.blur();
}
