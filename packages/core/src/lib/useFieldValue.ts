import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { warnOnce } from "./dev";

/** What a field's contract reads of its props (ADR-0081): the state prop and its callback. */
export interface FieldValueProps<V> {
  value?: V | null;
  defaultValue?: V | null;
  onValueChange?: (value: never) => void;
}

/** Whether a field's props give it a `value`; `value={undefined}` beside a `defaultValue` gives none, so the default shows. */
export function isControlled(props: { value?: unknown; defaultValue?: unknown }): boolean {
  return "value" in props && !(props.value === undefined && props.defaultValue != null);
}

/**
 * The value of a field that is controlled or uncontrolled, the one way to report a change, and whether it is controlled.
 *
 * A field is controlled by the presence of `value` among its props - a `value` that is `undefined`
 * or `null` reads as empty, so a field whose application has no value yet stays controlled (unless
 * it has a `defaultValue`, which then shows). It is
 * fixed by the first render; a later switch is warned of in development and then followed.
 *
 * The fourth item is a ref callback for any element of the field: when the form around it resets,
 * the field goes back to its `defaultValue` (or empty) and reports that - a controlled field only
 * reports, its owner decides.
 */
export function useFieldValue<V, E = V>(
  component: string,
  props: FieldValueProps<V | E>,
  empty: E,
): [V | E, (next: V) => void, boolean, (element: HTMLElement | null) => void] {
  const present = isControlled(props);
  const [first] = useState(present);
  if (present !== first) {
    warnOnce(
      "@umriss-ui/core",
      `switched:${component}`,
      `${component} switched between controlled and uncontrolled; give \`value\` from the first render on (undefined is empty) or use \`defaultValue\`.`,
    );
  }
  const controlled = first || present;
  const [own, setOwn] = useState<V | E>(() => props.defaultValue ?? empty);
  const callback = props.onValueChange as ((value: V) => void) | undefined;
  const value = controlled ? (props.value ?? empty) : own;
  const report = (next: V) => {
    if (!controlled) setOwn(next);
    callback?.(next);
  };
  const toDefault = useRef(() => {});
  useEffect(() => {
    toDefault.current = () => report((props.defaultValue ?? empty) as V);
  });
  const stopListening = useRef<(() => void) | null>(null);
  const bind = useCallback((element: HTMLElement | null) => {
    stopListening.current?.();
    stopListening.current = null;
    const form = (element as HTMLInputElement | null)?.form ?? element?.closest("form");
    if (!form) return;
    const onReset = () => toDefault.current();
    form.addEventListener("reset", onReset);
    stopListening.current = () => form.removeEventListener("reset", onReset);
  }, []);
  return [value, report, controlled, bind];
}

/**
 * Runs `restore` when the form around the field's input is reset. A native input follows a reset by
 * itself; a field that keeps its value in React (Slider, the file list) does not, and a form that
 * resets through the DOM would leave it out of step.
 */
export function useFormReset(input: RefObject<{ form: HTMLFormElement | null } | null>, restore: () => void): void {
  const latest = useRef(restore);
  useEffect(() => {
    latest.current = restore;
  });
  useEffect(() => {
    const form = input.current?.form;
    if (!form) return;
    const onReset = () => latest.current();
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [input]);
}

const FIELD_KEYS = ["value", "defaultValue", "onValueChange", "onChange"] as const;
const FIELD_KEY_SET: ReadonlySet<string> = new Set(FIELD_KEYS);

/** The props without the `useFieldValue` reads and `onChange` (no field that uses this takes it), for the rest that goes on to an element. */
export function withoutFieldProps<P extends object>(props: P): Omit<P, (typeof FIELD_KEYS)[number]> {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !FIELD_KEY_SET.has(key))) as never;
}
