import { useImperativeHandle, useRef, useState } from "react";
import type { FocusEvent, InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useControlSize } from "../../lib/controlSize";
import { fieldBlur } from "../../lib/fieldBlur";
import { FormPost, posted } from "../../lib/FormPost";
import type { FormPostProps } from "../../lib/FormPost";
import { useWording } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import { useFieldValue, withoutFieldProps } from "../../lib/useFieldValue";
import { useShapeWarning } from "../../lib/useShapeWarning";
import { TimeField } from "../DatePicker/TimeField";
import { pad2 } from "../DatePicker/time";
import { useFormField } from "../FormField";
import styles from "./TimeInput.module.css";

/** The props of `TimeInput`. */
export interface TimeInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "size" | "name" | "min" | "max" | "step">,
    RefProp<HTMLInputElement>,
    FormPostProps<string> {
  /** Controlled: the time as `HH:mm`, or `HH:mm:ss` with `withSeconds`; `null` or `undefined` reads as empty. */
  value?: string | null;
  /** Uncontrolled: the time to start at.
      @default null */
  defaultValue?: string | null;
  /** Reports every change as `HH:mm` (`HH:mm:ss` with `withSeconds`); `null` when a form's reset empties the field. */
  onValueChange?: (value: string | null) => void;
  /** Adds a field for the seconds. */
  withSeconds?: boolean;
  /** Marks the field as invalid. Inside a `FormField` with an `error`, it is set already. */
  invalid?: boolean;
  /** The size of the fields.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
}

type Parts = [hour: string, minute: string, second: string];

/** The three fields of `HH:mm[:ss]`; empty for no time or for text that is none. */
function partsOf(value: unknown): Parts {
  const match = typeof value === "string" ? /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(value) : null;
  return match ? [pad2(Math.min(23, +match[1]!)), pad2(Math.min(59, +match[2]!)), pad2(Math.min(59, +(match[3] ?? 0)))] : ["", "", ""];
}

/** A time of day as hour and minute (and second) fields that type themselves onwards, the arrows count and a pasted
    "14:30" is split - the DateTimePicker's time fields, alone. The value is the text `HH:mm`, as a native time input has it. */
export function TimeInput(props: TimeInputProps) {
  const {
    ref,
    withSeconds = false,
    invalid,
    size: ownSize,
    disabled = false,
    className,
    style,
    id,
    name,
    formValue,
    onBlur,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...fieldRest
  } = props;
  // The field's own props are read from `props` by `useFieldValue`; none of them reaches the element.
  const rest = withoutFieldProps(fieldRest);
  const [given, report, , formRef] = useFieldValue<string | null>("TimeInput", props, null, false);
  const shown = partsOf(given);
  useShapeWarning("TimeInput", "value", given != null && shown[0] === "", "a text such as 14:30 or 14:30:00, or null");
  const value = shown[0] === "" ? null : shown.slice(0, withSeconds ? 3 : 2).join(":");
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const secondRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => hourRef.current!);
  const wrap = useRef<HTMLSpanElement>(null);

  /* What the fields show while one is being typed in: a half-typed "1" is not yet a time, and a value
     that was reported and came back as "01" would swallow the next digit. It ends with the focus. */
  const [draft, setDraft] = useState<Parts | null>(null);
  const compose = (of: Parts) =>
    of.map((text) => Math.min(59, +text || 0)).map((n, i) => (i === 0 ? Math.min(23, n) : n)).map(pad2).slice(0, withSeconds ? 3 : 2).join(":");
  // A draft the owner did not take over (a controlled value that stayed) gives way to the value.
  const parts = draft && compose(draft) === value ? draft : shown;

  const change = (at: 0 | 1 | 2) => (text: string) => {
    // The first field set on an empty time brings the others to zero.
    const next: Parts = value === null && draft === null ? ["00", "00", "00"] : [...parts];
    next[at] = text;
    setDraft(next);
    const composed = compose(next);
    if (composed !== value) report(composed);
  };

  const blank = parts[0] === "" ? "--" : undefined;
  const common = { disabled, placeholder: blank } as const;

  return (
    <span
      ref={mergeRefs(wrap, formRef)}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelId)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      data-invalid={isInvalid || undefined}
      id={id ?? field?.id}
      className={cx(styles.group, size === "sm" && styles.sm, isInvalid && styles.invalid, className)}
      style={style}
      onBlur={(event: FocusEvent<HTMLSpanElement>) =>
        fieldBlur(event, (e) => {
          setDraft(null);
          onBlur?.(e as never);
        })
      }
    >
      <FormPost entries={[[name, posted(value, (text) => text, formValue)]]} disabled={disabled} />
      <TimeField {...common} own={hourRef} inputProps={rest} value={parts[0]} onValue={change(0)} max={23} label={wording.hour} next={minuteRef} pasteTakes="first" />
      <span className={styles.separator} aria-hidden="true">:</span>
      <TimeField {...common} own={minuteRef} value={parts[1]} onValue={change(1)} max={59} label={wording.minute} next={withSeconds ? secondRef : undefined} />
      {withSeconds && (
        <>
          <span className={styles.separator} aria-hidden="true">:</span>
          <TimeField {...common} own={secondRef} value={parts[2]} onValue={change(2)} max={59} label={wording.second} />
        </>
      )}
    </span>
  );
}
