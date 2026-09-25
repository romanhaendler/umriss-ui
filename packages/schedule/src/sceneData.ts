/* What is registered with a schedule, and what follows from it.

   The children register lanes and layers; this module keeps them in
   registration order and derives, once per change, what drawing, hit and
   gestures read: the lanes top to bottom, every subtask and dependency, the
   tasks, and the findings of the data as it stands. It knows nothing of the
   view and nothing of the pointer. */

import type { ReactNode } from "react";
import { violatedDependencies, overlapDepth, overlaps, type ViolatedDependency, type Overlap } from "./findings";
import type { Subtask, Task, Dependency } from "./model";
import type { ScheduleHit } from "./sceneView";

export interface LaneConfig {
  readonly id: string;
  readonly label: ReactNode;
  /** The **Lane group** it sits in, where it was declared inside one. The
      group gives it through context; a lane never names its group itself
      (ADR-0025). */
  readonly parent?: string;
}

/** A **Lane group**: structure over the lanes and never a lane itself. It
    holds `Lane`s and other groups, to any depth. */
export interface GroupConfig {
  readonly id: string;
  readonly label: ReactNode;
  /** The group it sits in, where it was declared inside one. */
  readonly parent?: string;
}

export type LayerConfig =
  | { readonly kind: "subtasks"; readonly data: readonly Subtask[]; readonly tasks: readonly Task[] }
  | { readonly kind: "dependencies"; readonly data: readonly Dependency[] };

export class SceneData {
  private nextId = 1;
  private readonly laneEntries = new Map<number, LaneConfig>();
  private readonly groupEntries = new Map<number, GroupConfig>();
  private readonly layerEntries = new Map<number, LayerConfig>();
  private dirty = true;

  lanes: LaneConfig[] = [];
  /** The groups in registration order. */
  groups: GroupConfig[] = [];
  laneIndex = new Map<string, number>();
  /** The layers in registration order - the drawing order. */
  layers: LayerConfig[] = [];
  subtasks: Subtask[] = [];
  subtaskById = new Map<string, Subtask>();
  dependencies: Dependency[] = [];
  tasks = new Map<string, Task>();
  overlaps: Overlap[] = [];
  violatedById = new Map<string, ViolatedDependency>();
  depth = new Map<string, number>();

  /** `changed` is called after every registration change. */
  constructor(private readonly changed: () => void) {}

  registerLane(config: LaneConfig): number {
    const id = this.nextId++;
    this.laneEntries.set(id, config);
    this.touch();
    return id;
  }

  updateLane(id: number, config: LaneConfig): void {
    if (this.laneEntries.get(id) === config) return;
    this.laneEntries.set(id, config);
    this.touch();
  }

  unregisterLane(id: number): void {
    this.laneEntries.delete(id);
    this.touch();
  }

  registerGroup(config: GroupConfig): number {
    const id = this.nextId++;
    this.groupEntries.set(id, config);
    this.touch();
    return id;
  }

  updateGroup(id: number, config: GroupConfig): void {
    if (this.groupEntries.get(id) === config) return;
    this.groupEntries.set(id, config);
    this.touch();
  }

  unregisterGroup(id: number): void {
    this.groupEntries.delete(id);
    this.touch();
  }

  registerLayer(config: LayerConfig): number {
    const id = this.nextId++;
    this.layerEntries.set(id, config);
    this.touch();
    return id;
  }

  updateLayer(id: number, config: LayerConfig): void {
    if (this.layerEntries.get(id) === config) return;
    this.layerEntries.set(id, config);
    this.touch();
  }

  unregisterLayer(id: number): void {
    this.layerEntries.delete(id);
    this.touch();
  }

  private touch(): void {
    this.dirty = true;
    this.changed();
  }

  /** Derives anew if a registration changed since the last call; says whether
      it did. */
  rebuild(): boolean {
    if (!this.dirty) return false;
    this.dirty = false;
    const inOrder = <C>(entries: Map<number, C>) => [...entries.keys()].sort((a, b) => a - b).map((id) => entries.get(id)!);
    this.lanes = inOrder(this.laneEntries);
    this.groups = inOrder(this.groupEntries);
    this.laneIndex = new Map(this.lanes.map((lane, i) => [lane.id, i] as const));
    this.layers = inOrder(this.layerEntries);
    this.subtasks = [];
    this.dependencies = [];
    this.tasks = new Map();
    for (const layer of this.layers) {
      if (layer.kind === "subtasks") {
        this.subtasks.push(...layer.data);
        for (const task of layer.tasks) this.tasks.set(task.id, task);
      } else {
        this.dependencies.push(...layer.data);
      }
    }
    this.subtaskById = new Map(this.subtasks.map((s) => [s.id, s] as const));
    this.overlaps = overlaps(this.subtasks);
    this.violatedById = new Map(violatedDependencies(this.subtasks, this.dependencies).map((l) => [l.dependency, l] as const));
    this.depth = overlapDepth(this.subtasks);
    return true;
  }

  /** The task a dependency belongs to: its departing subtask's. */
  taskOfDependency(dependency: Dependency): string | null {
    return this.subtaskById.get(dependency.from)?.task ?? null;
  }

  /** What a tooltip is about: the hovered subtask or dependency with what this
      data knows about it - its task, and the findings it stands in. */
  tooltipTargetFor(hit: ScheduleHit): ScheduleTooltipTarget | null {
    if (hit.kind === "subtask") {
      const id = hit.subtask.id;
      const overlapping = this.overlaps
        .filter((o) => o.first === id || o.second === id)
        .map((o) => this.subtaskById.get(o.first === id ? o.second : o.first))
        .filter((s): s is Subtask => s !== undefined);
      const violatedDependencies = this.dependencies
        .filter((t) => t.from === id || t.to === id)
        .map((t) => this.violatedById.get(t.id))
        .filter((l): l is ViolatedDependency => l !== undefined);
      return { kind: "subtask", subtask: hit.subtask, task: this.tasks.get(hit.subtask.task), overlapping, violatedDependencies };
    }
    if (hit.kind !== "dependency") return null;
    const dependency = hit.dependency;
    const task = this.taskOfDependency(dependency);
    return {
      kind: "dependency",
      dependency,
      task: task !== null ? this.tasks.get(task) : undefined,
      from: this.subtaskById.get(dependency.from),
      to: this.subtaskById.get(dependency.to),
      violated: this.violatedById.get(dependency.id),
    };
  }
}

/** What a tooltip is about: the hovered subtask or dependency, with what the
    schedule knows about it. */
export type ScheduleTooltipTarget =
  | {
      /** A subtask is hovered. */
      readonly kind: "subtask";
      /** The hovered subtask. */
      readonly subtask: Subtask;
      /** Its task, where the tasks name it. */
      readonly task: Task | undefined;
      /** The subtasks it overlaps with on its lane. */
      readonly overlapping: readonly Subtask[];
      /** The violated dependencies leaving or reaching it. */
      readonly violatedDependencies: readonly ViolatedDependency[];
    }
  | {
      /** A dependency is hovered. */
      readonly kind: "dependency";
      /** The hovered dependency. */
      readonly dependency: Dependency;
      /** Its task, where the tasks name it. */
      readonly task: Task | undefined;
      /** The subtask it leaves. */
      readonly from: Subtask | undefined;
      /** The subtask it reaches. */
      readonly to: Subtask | undefined;
      /** Its finding, where it is violated. */
      readonly violated: ViolatedDependency | undefined;
    };
