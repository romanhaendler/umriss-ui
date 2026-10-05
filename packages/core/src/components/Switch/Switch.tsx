import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Switch.module.css";
import { useControlSize } from "../../lib/controlSize";

/** The props of `Switch`: a native checkbox's attributes and its label. */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> {
  /** Label to the right of the switch. */
  label?: ReactNode;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** Marks the switch as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
}

/* A switch is a checkbox that says "on" instead of "ticked": the same native
   input element, so Space, the label, a form and `register()` come from the
   platform, and `role="switch"` tells a screen reader which of the two it is.
   It takes effect at once - where a choice waits for a Save button, the
   checkbox is the honest control. The construction is the checkbox's, and so
   is the pass-through: the class on the label, ref and rest on the input. */
/** An on/off switch that takes effect at once - a native checkbox with
    `role="switch"`. Where the choice waits for a Save button, use `Checkbox`. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, size: ownSize, invalid, className, style, id, ...rest },
  ref,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const inputId = id ?? field?.id;
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <label className={cx(styles.wrapper, size === "sm" && styles.sm, field && styles.field, className)} style={style} htmlFor={inputId}>
      <input
        ref={ref}
        type="checkbox"
        id={inputId}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        className={cx(styles.input, isInvalid && styles.invalid)}
        {...rest}
        /* After `rest`: the role is what the control is (P3 of
           core-passthrough). */
        role="switch"
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
});
