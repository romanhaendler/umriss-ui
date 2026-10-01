import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Input.module.css";
import { useControlSize } from "../../lib/controlSize";
import { extentStyle } from "../../lib/extent";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** `sm` for a toolbar and dense forms, `md` otherwise. Default: the size of a
      `ControlSizeProvider` around it, else `md`. */
  size?: "sm" | "md";
  /** The width in characters - room for the value; the field adds its own
      padding and cross. Given, the field is that wide wherever it stands, and
      never wider than its place. Without it the field fills its place, and is
      16 characters wide where the place asks - in a toolbar or a row. */
  chars?: number;
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

/* The field always wears its wrapper (ADR-0041): the wrapper is what a place
   lays out and what carries the natural width - Firefox applies no size
   containment to the native input element itself. The class goes to the
   wrapper, ref and rest to the input, as with every wrapped field
   (principle 1). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size: ownSize, chars, invalid, numeric = false, clearable = false, onClear, className, id, disabled, ...rest },
  ref,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const hasContent = String(rest.value ?? "").length > 0;

  return (
    <span
      className={cx(
        styles.wrapper,
        size === "sm" && styles.wrapperSm,
        clearable && styles.wrapperClearable,
        isInvalid && styles.wrapperInvalid,
        disabled && styles.wrapperDisabled,
        className,
      )}
      style={extentStyle(chars)}
    >
      <input
        ref={ref}
        id={id ?? field?.id}
        disabled={disabled}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        className={cx(styles.inner, numeric && styles.numeric)}
        {...rest}
      />
      {clearable && hasContent && !disabled && (
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
