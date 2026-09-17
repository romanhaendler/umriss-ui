import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Select.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** `sm` for dense forms and table rows, `md` otherwise. Not called `size`,
      because `<select size>` on the native element is the number of visible
      rows – two meanings, one name, that would go wrong. */
  selectSize?: "sm" | "md";
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
  { selectSize = "md", invalid, clearable = false, onClear, className, id, children, disabled, ...rest },
  ref,
) {
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
          selectSize === "sm" && styles.sm,
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
      <span className={styles.chevron} aria-hidden="true" />
    </span>
  );
});
