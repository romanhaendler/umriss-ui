/* A subscriber to the layout snapshot that reads only the part it shows: a
   new snapshot whose part is unchanged hands back the old part, so the
   component does not render again. */

import { useRef, useSyncExternalStore } from "react";
import type { ChartScene } from "./scene";
import type { LayoutSnapshot } from "./sceneModel";

/** Equal in everything but functions: a layout makes its formatters anew, and
    the labels they wrote stand in the layout beside them. */
function same(a: unknown, b: unknown): boolean {
  if (a === b || (typeof a === "function" && typeof b === "function")) return true;
  // A typed array is compared by identity only: its elements are not a part to walk.
  if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) return false;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keys = Object.keys(a);
  if (Array.isArray(a) !== Array.isArray(b) || keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => same((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

export function useLayoutPart<T>(scene: ChartScene, select: (snapshot: LayoutSnapshot) => T): T {
  const last = useRef<{ snapshot: LayoutSnapshot; part: T } | null>(null);
  const read = (snapshot: LayoutSnapshot): T => {
    const prev = last.current;
    if (prev !== null && prev.snapshot === snapshot) return prev.part;
    const part = select(snapshot);
    // A part that is the snapshot itself (an open table) changes with it: nothing to save by comparing.
    const kept = prev !== null && (part as unknown) !== snapshot && same(prev.part, part) ? prev.part : part;
    last.current = { snapshot, part: kept };
    return kept;
  };
  return useSyncExternalStore(
    scene.subscribeLayout,
    () => read(scene.getLayoutSnapshot()),
    () => read(scene.getLayoutServerSnapshot()),
  );
}
