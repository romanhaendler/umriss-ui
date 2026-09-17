/* The schedule's context and the registration hooks.

   `Lane`, `Subtasks` and `Transports` register their configuration on mount and
   deregister on unmount; a change of props only updates the entry. The order in
   the JSX is the registration order - the order of the lanes from top to
   bottom, and the drawing order of the layers. Outside a `Schedule` they
   throw: a lane that silently draws nothing is a lane nobody finds. */

import { createContext, useContext, useEffect, useRef } from "react";
import type { LaneConfig, LayerConfig, ScheduleScene } from "./scene";

export const ScheduleContext = createContext<ScheduleScene | null>(null);

function useScene(componentName: string): ScheduleScene {
  const scene = useContext(ScheduleContext);
  if (scene === null) {
    throw new Error(`@umriss-ui/schedule: <${componentName}> must be used inside a <Schedule>.`);
  }
  return scene;
}

export function useLane(config: LaneConfig): void {
  const scene = useScene("Lane");
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    idRef.current = scene.registerLane(config);
    return () => {
      if (idRef.current !== null) scene.unregisterLane(idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (idRef.current !== null) scene.updateLane(idRef.current, config);
  });
}

export function useLayer(componentName: string, config: LayerConfig): void {
  const scene = useScene(componentName);
  const idRef = useRef<number | null>(null);

  useEffect(() => {
    idRef.current = scene.registerLayer(config);
    return () => {
      if (idRef.current !== null) scene.unregisterLayer(idRef.current);
      idRef.current = null;
    };
    // Registration only on mount or a change of scene; config updates below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  useEffect(() => {
    if (idRef.current !== null) scene.updateLayer(idRef.current, config);
  });
}
