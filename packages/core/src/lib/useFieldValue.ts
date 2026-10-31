import { useState } from "react";
import { warnDeprecated, warnOnce } from "./dev";

/** What a field's contract reads of its props (ADR-0081): the state prop and its callback. */
export interface FieldValueProps<V> {
  value?: V | null;
  defaultValue?: V | null;
  onValueChange?: (value: never) => void;
  /** The callback the field had before `onValueChange`; read only where `legacy` is set. */
  onChange?: unknown;
}

/**
 * The value of a field that is controlled or uncontrolled, the one way to report a change, and whether it is controlled.
 *
 * A field is controlled by the presence of `value` among its props - a `value` that is `undefined`
 * or `null` reads as empty, so a field whose application has no value yet stays controlled. It is
 * fixed by the first render; a later switch is warned of in development and then followed.
 * `legacy` marks a field whose `onChange` handed a value: it still works, and speaks once.
 */
export function useFieldValue<V, E = V>(component: string, props: FieldValueProps<V | E>, empty: E, legacy = true): [V | E, (next: V) => void, boolean] {
  const present = "value" in props;
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
  const callback = (props.onValueChange ?? (legacy ? props.onChange : undefined)) as ((value: V) => void) | undefined;
  if (legacy && props.onChange && !props.onValueChange) warnDeprecated(`${component} onChange(value)`, "onValueChange");
  const value = controlled ? (props.value ?? empty) : own;
  return [
    value,
    (next) => {
      if (!controlled) setOwn(next);
      callback?.(next);
    },
    controlled,
  ];
}

const FIELD_KEYS = new Set(["value", "defaultValue", "onValueChange", "onChange"]);

/** The props without the four `useFieldValue` reads, for the rest that goes on to an element. */
export function withoutFieldProps<P extends object>(props: P): Omit<P, "value" | "defaultValue" | "onValueChange" | "onChange"> {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !FIELD_KEYS.has(key))) as never;
}
