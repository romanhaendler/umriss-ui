import { useEffect, useId, useImperativeHandle, useRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { useControlSize } from "../../lib/controlSize";
import type { RefProp } from "../../lib/refProp";
import styles from "./Checkbox.module.css";

/** The props of `Checkbox`: a native checkbox's attributes and its label. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">, RefProp<HTMLInputElement> {
  /** Label to the right of the checkbox. */
  label?: ReactNode;
  /** Partially checked (e.g. "select all" with a mixed selection). */
  indeterminate?: boolean;
  /** Marks the checkbox as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** Runs with the new state on every click. `onChange` stays for the
      event - what `register` and Formik read. */
  onCheckedChange?: (checked: boolean) => void;
}

/** A native checkbox with its label beside it; `indeterminate` shows the mixed
    state. Inside a `FormField` it takes the field's id and description. */
export function Checkbox({ ref, label, indeterminate = false, invalid, className, style, id, onChange, onCheckedChange, ...rest }: CheckboxProps) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const field = useFormField();
  const inputId = id ?? field?.id;
  const isInvalid = invalid ?? field?.invalid ?? false;
  /* Inside a FormField the input has two labels, its own and the field's, and
     a screen reader would read both joined. The checkbox's own words name it. */
  const labelId = useId();
  const ownName = field && label && !rest["aria-label"] && !rest["aria-labelledby"] ? labelId : undefined;
  /* The checkbox has one look; the size of its place says only how tall a
     field it stands in is. */
  const size = useControlSize(undefined);

  return (
    <label className={cx(styles.wrapper, field && styles.field, field && size === "sm" && styles.sm, className)} style={style} htmlFor={inputId}>
      <input
        ref={innerRef}
        type="checkbox"
        id={inputId}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        aria-labelledby={ownName}
        className={cx(styles.input, isInvalid && styles.invalid)}
        {...rest}
        /* Without a handler there is none to give React: its own warning for a controlled field with none stands. */
        onChange={
          onChange || onCheckedChange
            ? (event) => {
                onChange?.(event);
                onCheckedChange?.(event.target.checked);
              }
            : undefined
        }
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 10 8" className={styles.check}>
          <path pathLength={1} d="M1 4l2.5 2.5L9 1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={styles.dash} />
      </span>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
    </label>
  );
}
