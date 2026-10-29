import { useEffect, useId } from "react";
import { warnOnce } from "./dev";

/** Warns once per instance, in development, that a prop has the wrong shape:
    one sentence with the component, the prop and the shape it expects. The
    caller renders the prop as empty meanwhile. */
export function useShapeWarning(component: string, prop: string, wrong: boolean, expected: string): void {
  const id = useId();
  useEffect(() => {
    if (wrong) warnOnce("@umriss-ui/core", `shape:${id}:${prop}`, `${component} ${prop} must be ${expected}.`);
  }, [id, component, prop, wrong, expected]);
}

export const isDate = (v: unknown): v is Date => v instanceof Date;
/** Whether options are objects (`{ value, label }`) and not bare strings. */
export const areOptions = (v: unknown): boolean => Array.isArray(v) && v.every((o) => typeof o === "object" && o !== null);

/** The stand-in for a wrong list: one array, so that memos on it hold. */
export const NONE: readonly never[] = [];
