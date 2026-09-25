/* The keyboard (schedule-a11y, ADR-0030): the plot is one tab stop, and the
   keys move the **Active subtask** over the rows (`walk.ts`), follow a
   dependency, select and propose edits.

   The active subtask IS the hover: the keys set the hover the pointer would
   have set, so it is drawn, tooltipped and selected by the same code - one
   picture, whichever input came last. What is spoken is decided here too: a
   readout once the keys rest, never after the pointer. */

import { MINUTE } from "@umriss-ui/charts";
import type { Intent } from "./model";
import type { SceneData, ScheduleTooltipTarget } from "./sceneData";
import type { SceneGestures, SceneHandlers } from "./sceneGestures";
import type { ScheduleHit, SceneView } from "./sceneView";
import { alongDependency, stepSubtask, walkRows, type Active, type WalkMove } from "./walk";

/** The readout waits for the keys to rest this long - the charts' pause: a
    held key speaks where it stops, not at every step on the way. */
const READOUT_REST = 150;

const MOVES: Readonly<Record<string, WalkMove>> = {
  ArrowRight: "next",
  ArrowLeft: "previous",
  ArrowUp: "up",
  ArrowDown: "down",
  Home: "first",
  End: "last",
  PageDown: "pageNext",
  PageUp: "pagePrevious",
};

/** What the keys need from the scene they belong to. */
export interface KeyHost {
  readonly data: SceneData;
  readonly view: SceneView;
  readonly gestures: SceneGestures;
  handlers(): SceneHandlers;
  visibleDomain(): readonly [number, number];
  select(task: string | null, subtask: string | null): void;
  /** The keys panned the view to bring the active subtask into it. */
  viewMoved(time: boolean): void;
  /** What is spoken changed: publish. */
  spokenChanged(): void;
}

/** What the live region reads: the target and the lane it stands on. */
export interface Spoken {
  readonly target: ScheduleTooltipTarget;
  /** The lane's id, for its header's label; null for a dependency. */
  readonly lane: string | null;
  /** Counts the readouts: the same words twice - a key at the end of a lane -
      are written anew, so that the live region speaks them again. */
  readonly count: number;
}

export class SceneKeys {
  spoken: Spoken | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly host: KeyHost) {}

  /** Where the keys stand: the hover, whoever set it. */
  private active(): Active | null {
    const hover = this.host.gestures.hover;
    if (hover.kind === "subtask") return { kind: "subtask", id: hover.subtask.id };
    if (hover.kind === "dependency") return { kind: "dependency", id: hover.dependency.id };
    return null;
  }

  /** The focus came in by keyboard: the walk starts where the pointer
      stands, or at the first subtask in view. A click focuses the plot too,
      and must not start it. */
  focus(byKeyboard: boolean): void {
    if (!byKeyboard || this.active() !== null) return;
    this.walk("first");
  }

  /** The focus left: the keys' subtask goes with it. */
  blur(): void {
    if (this.host.gestures.byKeyboard) this.host.gestures.setKeyboardHover({ kind: "nothing" }, { x: 0, y: 0 });
  }

  /** A key on the plot; true where the schedule took it. */
  key(event: KeyboardEvent): boolean {
    const gestures = this.host.gestures;
    if (event.metaKey || !gestures.idle) return false;
    /* The brackets are matched by the character, whatever the modifiers: on a
       German keyboard they are AltGr+8 and AltGr+9, which arrive with Ctrl and
       Alt. `t` and Shift+T are their equals without AltGr (schedule-a11y 06),
       and only bare: Ctrl+T and Alt+T belong to the browser and the system. */
    const letter = event.key.toLowerCase() === "t" && !event.ctrlKey && !event.altKey;
    if (event.key === "]" || event.key === "[" || letter) {
      const at = this.active();
      if (at === null) return false;
      const data = this.host.data;
      const out = letter ? !event.shiftKey : event.key === "]";
      this.show(alongDependency(data.dependencies, data.subtaskById, at, out ? "out" : "back"));
      return true;
    }
    if (event.ctrlKey) return false;
    if (event.altKey) return this.edit(event);
    if (event.key === "Escape") {
      if (!gestures.byKeyboard) return false;
      this.blur();
      return true;
    }
    if (event.key === "Enter" || event.key === " ") return this.select();
    const move = event.shiftKey ? undefined : MOVES[event.key];
    if (move === undefined) return false;
    this.walk(move);
    return true;
  }

  private walk(move: WalkMove): void {
    const { data, view } = this.host;
    const at = this.active();
    /* From a dependency the walk goes on from the stop it left. */
    const from = at === null ? null : at.kind === "subtask" ? at.id : (data.dependencies.find((t) => t.id === at.id)?.from ?? null);
    let rows = walkRows(view.rows, data.subtasks);
    /* Coming in, the lanes scrolled into view are where to start: entering
       on a row scrolled away would scroll the plan back under the reader. */
    if (from === null) {
      const shown = rows.filter((row) => {
        const box = view.boxById.get(row[0]!.id);
        return box !== undefined && box.y + box.height > 0 && box.y < view.height;
      });
      if (shown.length > 0) rows = shown;
    }
    const to = stepSubtask(rows, from, move, this.host.visibleDomain());
    if (to !== null) this.show({ kind: "subtask", id: to.id });
  }

  /** Space and Enter select as a click does: the whole task, and the subtask. */
  private select(): boolean {
    const hover = this.host.gestures.hover;
    if (hover.kind === "subtask") this.host.select(hover.subtask.task, hover.subtask.id);
    else if (hover.kind === "dependency") this.host.select(this.host.data.taskOfDependency(hover.dependency), null);
    else return false;
    return true;
  }

  /** Alt+←/→ proposes a move by one step of the raster, Alt+Shift+←/→ a new
      end - the intents a drag of that length reports (ADR-0023), and only
      where the caller handles them. Nothing is applied here. */
  private edit(event: KeyboardEvent): boolean {
    const hover = this.host.gestures.hover;
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (direction === 0) return false;
    /* From here on the key is the plot's even where it proposes nothing:
       Alt+Left/Right is the browser's Back and Forward, and a planner at the
       end of a lane must not be taken off the page. */
    if (hover.kind !== "subtask") return true;
    const s = hover.subtask;
    const gestures = this.host.gestures;
    const intents = this.host.view.options.intents;
    /* Without a raster a key still needs a step: the fine band's. */
    const raster = gestures.snapStep();
    const step = raster.step > 0 ? raster : { step: this.host.view.step(), offset: 0 };
    let intent: Intent | null = null;
    if (!event.shiftKey && intents.includes("move")) {
      const from = gestures.shifted(s.from, direction * step.step, step);
      if (from !== s.from) intent = { kind: "move", subtask: s.id, from, to: from + (s.to - s.from) };
    } else if (event.shiftKey && intents.includes("stretch")) {
      /* The drag's floor: a main time never shorter than a step or a minute. */
      const to = Math.max(gestures.shifted(s.to, direction * step.step, step), s.from + Math.max(step.step, MINUTE));
      if (to !== s.to) intent = { kind: "stretch", subtask: s.id, from: s.from, to };
    }
    /* An edit is the keys' act, on a subtask the pointer showed them too. */
    gestures.byKeyboard = true;
    if (intent !== null) this.host.handlers().onIntent?.(intent);
    /* The caller applies it, or not; either way the readout says what stands. */
    this.scheduleReadout();
    return true;
  }

  /** The keys stand on this target: brought into view, drawn as the hover. */
  private show(at: Active, reveal = true): void {
    const hit = this.hitOf(at);
    if (hit === null) return;
    if (reveal) this.reveal(at);
    const bounds = this.bounds(at);
    if (bounds === null) return;
    const { view } = this.host;
    const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
    this.host.gestures.setKeyboardHover(hit, {
      x: (clamp(bounds.x0, view.width) + clamp(bounds.x1, view.width)) / 2,
      y: (clamp(bounds.y0, view.height) + clamp(bounds.y1, view.height)) / 2,
    });
    if (reveal) this.scheduleReadout();
  }

  private hitOf(at: Active): ScheduleHit | null {
    const data = this.host.data;
    if (at.kind === "subtask") {
      const subtask = data.subtaskById.get(at.id);
      return subtask === undefined ? null : { kind: "subtask", subtask, part: "main" };
    }
    const dependency = data.dependencies.find((t) => t.id === at.id);
    return dependency === undefined ? null : { kind: "dependency", dependency };
  }

  /** Where a target lies on the plot: a subtask's bar, or the span between
      the two bars a dependency joins. */
  private bounds(at: Active): { x0: number; x1: number; y0: number; y1: number } | null {
    const view = this.host.view;
    const box = (id: string) => view.boxById.get(id);
    if (at.kind === "subtask") {
      const b = box(at.id);
      return b === undefined ? null : { x0: b.outerFrom, x1: b.outerTo, y0: b.y, y1: b.y + b.height };
    }
    const dependency = this.host.data.dependencies.find((t) => t.id === at.id);
    const from = dependency === undefined ? undefined : box(dependency.from);
    const to = dependency === undefined ? undefined : box(dependency.to);
    if (from === undefined || to === undefined) return null;
    return {
      x0: Math.min(from.mainTo, to.mainFrom),
      x1: Math.max(from.mainTo, to.mainFrom),
      y0: Math.min(from.y, to.y),
      y1: Math.max(from.y + from.height, to.y + to.height),
    };
  }

  /** Pans and scrolls just enough to bring a target into view, with a margin
      at the side it came in from; a target wider than the view shows its
      start. As a drag at the edge pans along, the keys do. */
  private reveal(at: Active): void {
    const b = this.bounds(at);
    const view = this.host.view;
    if (b === null || view.width <= 0) return;
    const margin = Math.min(24, view.width / 10);
    const dx = b.x0 < 0 ? b.x0 - margin : b.x1 > view.width ? Math.max(0, Math.min(b.x1 - view.width + margin, b.x0 - margin)) : 0;
    const dy = b.y0 < 0 ? b.y0 : b.y1 > view.height ? Math.min(b.y1 - view.height, b.y0) : 0;
    if (dx === 0 && dy === 0) return;
    const panned = view.pan(dx, dy);
    if (panned.moved) this.host.viewMoved(panned.time);
  }

  /** After the data or the view changed: the keys' target is read anew by its
      id - its new times, its new place -, and dropped where it is gone. */
  refresh(): void {
    const at = this.active();
    if (!this.host.gestures.byKeyboard || at === null) return;
    if (this.hitOf(at) === null || this.bounds(at) === null) this.blur();
    else this.show(at, false);
  }

  /** The readout, written once the keys rest - and only while they still hold
      the hover: a pointer that took it over in the pause is not spoken for. */
  private scheduleReadout(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      const hover = this.host.gestures.hover;
      if (!this.host.gestures.byKeyboard) return;
      const target = this.host.data.tooltipTargetFor(hover);
      if (target === null) return;
      this.spoken = { target, lane: hover.kind === "subtask" ? hover.subtask.lane : null, count: (this.spoken?.count ?? 0) + 1 };
      this.host.spokenChanged();
    }, READOUT_REST);
  }

  /** Unmount: no readout after it. */
  stop(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}
