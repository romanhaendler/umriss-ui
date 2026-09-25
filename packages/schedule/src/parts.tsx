/* The contents of a schedule, declared by composition. None of them renders
   anything: each registers what it declares, and the schedule draws it. */

import { useMemo } from "react";
import type { ReactNode } from "react";
import { LaneGroupContext, useLane, useLaneGroup, useLaneGroupRegistration, useLayer } from "./context";
import type { LayerConfig } from "./scene";
import type { BlockedTime, Subtask, Task, Dependency } from "./model";

export interface LaneProps {
  /** The identity subtasks name in their `lane`. */
  id: string;
  /** What the lane header says - the person, vehicle or room. Real text, read by a
      screen reader; without one the header shows the id. */
  label?: ReactNode;
}

/** One lane: a person, a vehicle, a room. The lanes run top to bottom in the order
    they are declared - whichever group they are declared in. */
export function Lane({ id, label }: LaneProps): null {
  const parent = useLaneGroup();
  const config = useMemo(() => ({ id, label: label ?? id, ...(parent === null ? {} : { parent }) }), [id, label, parent]);
  useLane(config);
  return null;
}

export interface LaneGroupProps {
  /** The group's identity - what `collapsedGroups` names. It is never a lane:
      no subtask sits on it, no finding is reported for it, and no intent names
      it (ADR-0025). */
  id: string;
  /** What the group's header says - the team, the depot, the region.
      Real text, read by a screen reader; without one the header shows the id. */
  label?: ReactNode;
  /** `Lane`s and further `LaneGroup`s, to any depth. */
  children?: ReactNode;
}

/** A group of lanes: structure over them, and never a lane itself.

    It gives its id to its children through context, so a lane never names its
    group and a group reads in JSX as it reads in the organisation. Folded, it becomes
    one row showing a **Miniature** of everything in it; open, it shows a slim
    head above its lanes. Which groups are folded is `collapsedGroups` on
    `Schedule` - a view state, never an **Intent**. */
export function LaneGroup({ id, label, children }: LaneGroupProps): ReactNode {
  const parent = useLaneGroup();
  const config = useMemo(() => ({ id, label: label ?? id, ...(parent === null ? {} : { parent }) }), [id, label, parent]);
  useLaneGroupRegistration(config);
  return <LaneGroupContext.Provider value={id}>{children}</LaneGroupContext.Provider>;
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

export interface DependenciesProps {
  /** The dependencies, as the caller holds them. */
  data: readonly Dependency[];
}

/** A layer of dependencies. Declared before `Subtasks`, the lines run beneath the
    bars; after them, above. */
export function Dependencies({ data }: DependenciesProps): null {
  const config = useMemo<LayerConfig>(() => ({ kind: "dependencies", data }), [data]);
  useLayer("Dependencies", config);
  return null;
}

export interface BlockedTimesProps {
  /** The blocked time of the lanes - leave, maintenance, unavailability -, as
      the caller holds it: one list, each interval naming its lane. */
  data: readonly BlockedTime[];
}

/** A layer of blocked time. Wherever it is declared, it is drawn behind every
    subtask and dependency: it is a property of the lane, not something on it. */
export function BlockedTimes({ data }: BlockedTimesProps): null {
  const config = useMemo<LayerConfig>(() => ({ kind: "blocked", data }), [data]);
  useLayer("BlockedTimes", config);
  return null;
}
