import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Input.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** `sm` for dense forms and table rows, `md` otherwise. */
  size?: "sm" | "md";
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** Right-aligned tabular figures in Geist Mono, e.g. for key figures. */
  numeric?: boolean;
  /**
   * Shows a gently appearing cross where there is content, which clears the
   * input. Requires a controlled field (value) and onClear.
   */
  clearable?: boolean;
  /** Called by the cross. Clearing belongs to the caller: only it knows
      whether "empty" here is the empty text or no value at all. */
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", invalid, numeric = false, clearable = false, onClear, className, id, disabled, ...rest },
  ref,
) {
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const inputElement = (cls: string) => (
    <input
      ref={ref}
      id={id ?? field?.id}
      disabled={disabled}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      aria-required={field?.required || undefined}
      aria-invalid={isInvalid || undefined}
      className={cls}
      {...rest}
    />
  );

  if (!clearable) {
    return inputElement(
      cx(
        styles.input,
        size === "sm" && styles.sm,
        numeric && styles.numeric,
        isInvalid && styles.invalid,
        className,
      ),
    );
  }

  const hasContent = String(rest.value ?? "").length > 0;

  return (
    <span
      className={cx(
        styles.wrapper,
        size === "sm" && styles.wrapperSm,
        isInvalid && styles.wrapperInvalid,
        disabled && styles.wrapperDisabled,
        className,
      )}
    >
      {inputElement(cx(styles.inner, numeric && styles.numeric))}
      {hasContent && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={wording.clearInput}
          className={styles.clear}
          onMouseDown={(event) => event.preventDefault() /* focus stays in the field */}
          onClick={() => onClear?.()}
        >
          <CrossGlyph />
        </button>
      )}
    </span>
  );
});
