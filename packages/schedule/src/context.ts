/* The schedule's context and the registration hooks.

   `Lane`, `Subtasks` and `Dependencies` register their configuration on mount and
   deregister on unmount; a change of props only updates the entry. The order in
   the JSX is the registration order - the order of the lanes from top to
   bottom, and the drawing order of the layers. Outside a `Schedule` they
   throw: a lane that silently draws nothing is a lane nobody finds. */

import { createContext, useContext, useEffect, useRef } from "react";
import type { GroupConfig, LaneConfig, LayerConfig, ScheduleScene } from "./scene";

export const ScheduleContext = createContext<ScheduleScene | null>(null);

/** The **Lane group** a child is declared inside, or null at the top level.

    A lane never names its group: the group gives its id downwards, so that a
    group reads in JSX as it reads in the plant and moving a lane between
    groups is moving a line of JSX (ADR-0025). */
export const LaneGroupContext = createContext<string | null>(null);

export function useLaneGroup(): string | null {
  return useContext(LaneGroupContext);
}

function useScene(componentName: string): ScheduleScene {
  const scene = useContext(ScheduleContext);
  if (scene === null) {
    throw new Error(`@umriss-ui/schedule: <${componentName}> must be used inside a <Schedule>.`);
  }
  return scene;
}

/** Register on mount, deregister on unmount, update the entry on every
    render - for a lane and for a layer alike. */
function useRegistration<C>(
  componentName: string,
  config: C,
  register: (scene: ScheduleScene, config: C) => number,
  update: (scene: ScheduleScene, id: number, config: C) => void,
  unregister: (scene: ScheduleScene, id: number) => void,
): void {
  const scene = useScene(componentName);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    idRef.current = register(scene, config);
    return () => {
      if (idRef.current !== null) unregister(scene, idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (idRef.current !== null) update(scene, idRef.current, config);
  });
}

export function useLane(config: LaneConfig): void {
  useRegistration("Lane", config, (s, c) => s.registerLane(c), (s, id, c) => s.updateLane(id, c), (s, id) => s.unregisterLane(id));
}

export function useLaneGroupRegistration(config: GroupConfig): void {
  useRegistration("LaneGroup", config, (s, c) => s.registerGroup(c), (s, id, c) => s.updateGroup(id, c), (s, id) => s.unregisterGroup(id));
}

export function useLayer(componentName: string, config: LayerConfig): void {
  useRegistration(componentName, config, (s, c) => s.registerLayer(c), (s, id, c) => s.updateLayer(id, c), (s, id) => s.unregisterLayer(id));
}
