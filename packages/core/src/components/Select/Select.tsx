import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Select.module.css";
import { useControlSize } from "../../lib/controlSize";
import { useWording } from "../../lib/language";
import { AngleGlyph, CrossGlyph } from "../../lib/glyphs";

/* `size` is the controls' two heights here, as on every other field. The
   native `<select size>` - the number of rows a list box shows - is left out:
   this select is a dropdown, and it used to be called `selectSize` to spare
   that meaning, which made it the one field with another name (ADR-0041). */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** `sm` for a toolbar and dense forms, `md` otherwise. Default: the size of a
      `ControlSizeProvider` around it, else `md`. */
  size?: "sm" | "md";
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only necessary without `FormField`. */
  invalid?: boolean;
  /**
   * Shows a × once a selection has been made, which fades in on hover/focus
   * and empties the selection. Requires a controlled field (value) and
   * onClear; sensible for optional selects with a placeholder option.
   */
  clearable?: boolean;
  /** Called by the ×; resets the selection to the placeholder option. */
  onClear?: () => void;
}

/**
 * Native select with the library's looks – maximum accessibility without
 * building one ourselves. The arrow is drawn in CSS and therefore follows the
 * theme tokens.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size: ownSize, invalid, clearable = false, onClear, className, id, children, disabled, ...rest },
  ref,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const hasSelection = clearable && !rest.multiple && String(rest.value ?? "") !== "";

  return (
    <span className={cx(styles.wrapper, className)}>
      <select
        ref={ref}
        id={id ?? field?.id}
        disabled={disabled}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        className={cx(
          styles.select,
          size === "sm" && styles.sm,
          clearable && styles.selectClearable,
          isInvalid && styles.invalid,
        )}
        {...rest}
      >
        {children}
      </select>
      {hasSelection && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={wording.clearSelection}
          className={styles.clear}
          onMouseDown={(event) => event.preventDefault() /* focus stays on the select */}
          onClick={() => onClear?.()}
        >
          <CrossGlyph />
        </button>
      )}
      <AngleGlyph className={styles.chevron} />
    </span>
  );
});
