/* What is registered with a schedule, and what follows from it.

   The children register lanes and layers; this module keeps them in
   registration order and derives, once per change, what drawing, hit and
   gestures read: the lanes top to bottom, every subtask and transport, the
   tasks, and the findings of the data as it stands. It knows nothing of the
   view and nothing of the pointer. */

import type { ReactNode } from "react";
import { lateTransports, overlapDepth, overlaps, type LateTransport, type Overlap } from "./findings";
import type { Subtask, Task, Transport } from "./model";

export interface LaneConfig {
  readonly id: string;
  readonly label: ReactNode;
}

export type LayerConfig =
  | { readonly kind: "subtasks"; readonly data: readonly Subtask[]; readonly tasks: readonly Task[] }
  | { readonly kind: "transports"; readonly data: readonly Transport[] };

export class SceneData {
  private nextId = 1;
  private readonly laneEntries = new Map<number, LaneConfig>();
  private readonly layerEntries = new Map<number, LayerConfig>();
  private dirty = true;

  lanes: LaneConfig[] = [];
  laneIndex = new Map<string, number>();
  /** The layers in registration order - the drawing order. */
  layers: LayerConfig[] = [];
  subtasks: Subtask[] = [];
  subtaskById = new Map<string, Subtask>();
  transports: Transport[] = [];
  tasks = new Map<string, Task>();
  overlaps: Overlap[] = [];
  lateById = new Map<string, LateTransport>();
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
    this.laneIndex = new Map(this.lanes.map((lane, i) => [lane.id, i] as const));
    this.layers = inOrder(this.layerEntries);
    this.subtasks = [];
    this.transports = [];
    this.tasks = new Map();
    for (const layer of this.layers) {
      if (layer.kind === "subtasks") {
        this.subtasks.push(...layer.data);
        for (const task of layer.tasks) this.tasks.set(task.id, task);
      } else {
        this.transports.push(...layer.data);
      }
    }
    this.subtaskById = new Map(this.subtasks.map((s) => [s.id, s] as const));
    this.overlaps = overlaps(this.subtasks);
    this.lateById = new Map(lateTransports(this.subtasks, this.transports).map((l) => [l.transport, l] as const));
    this.depth = overlapDepth(this.subtasks);
    return true;
  }

  /** The task a transport belongs to: its departing subtask's. */
  taskOfTransport(transport: Transport): string | null {
    return this.subtaskById.get(transport.from)?.task ?? null;
  }
}
