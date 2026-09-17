/* The contents of a schedule, declared by composition. None of them renders
   anything: each registers what it declares, and the schedule draws it. */

import { useMemo } from "react";
import type { ReactNode } from "react";
import { useLane, useLayer } from "./context";
import type { LayerConfig } from "./scene";
import type { Subtask, Task, Transport } from "./model";

export interface LaneProps {
  /** The identity subtasks name in their `lane`. */
  id: string;
  /** What the lane header says - the machine or station. Real text, read by a
      screen reader; without one the header shows the id. */
  label?: ReactNode;
}

/** One lane: a machine or station. The lanes run top to bottom in the order
    they are declared. */
export function Lane({ id, label }: LaneProps): null {
  const config = useMemo(() => ({ id, label: label ?? id }), [id, label]);
  useLane(config);
  return null;
}

export interface SubtasksProps {
  /** The subtasks, as the caller holds them. The schedule never changes one. */
  data: readonly Subtask[];
  /** The tasks the subtasks belong to - their identity and their colour. A
      subtask whose task is not among them is drawn in a muted colour. */
  tasks: readonly Task[];
}

/** A layer of subtasks. Several layers draw in the order they are declared. */
export function Subtasks({ data, tasks }: SubtasksProps): null {
  const config = useMemo<LayerConfig>(() => ({ kind: "subtasks", data, tasks }), [data, tasks]);
  useLayer("Subtasks", config);
  return null;
}

export interface TransportsProps {
  /** The transports, as the caller holds them. */
  data: readonly Transport[];
}

/** A layer of transports. Declared before `Subtasks`, the lines run beneath the
    bars; after them, above. */
export function Transports({ data }: TransportsProps): null {
  const config = useMemo<LayerConfig>(() => ({ kind: "transports", data }), [data]);
  useLayer("Transports", config);
  return null;
}
