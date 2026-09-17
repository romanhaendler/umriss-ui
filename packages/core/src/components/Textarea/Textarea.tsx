/* Multi-line input.

   The most conspicuous gap in the form part: there were Input, Select,
   Checkbox and NumberInput, but no field for free text.

   Operation: like a text field. With `autoGrow` it grows with its content
   until `maxRows` is reached, and scrolls from then on. With `showCount`
   the number of characters that still fit stands at the bottom right; once
   the limit is undercut it turns red.

   No clearing cross: that is a gesture for single-line fields and would sit
   against a surface that changes its height. */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { TextareaHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { clampedHeight, remainingChars } from "./measure";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** `sm` for dense forms and table rows, `md` otherwise. */
  size?: "sm" | "md";
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only needed without `FormField`. */
  invalid?: boolean;
  /** Grows with its content instead of scrolling. */
  autoGrow?: boolean;
  /** Upper bound for `autoGrow` in rows; beyond it the field scrolls. */
  maxRows?: number;
  /** Shows at the bottom right how many characters still fit.
      Needs `maxLength`. */
  showCount?: boolean;
  /** Whether the browser's handle for dragging is offered. Default: only
      vertically, and not at all while the field grows by itself. */
  resize?: "none" | "vertical";
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    size = "md",
    invalid,
    autoGrow = false,
    maxRows,
    showCount = false,
    resize,
    className,
    id,
    disabled,
    rows = 3,
    onInput,
    ...rest
  },
  ref,
) {
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;

  const innerRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

  /* Measuring means: reset the height, read off the content height, clamp.
     Without the reset, scrollHeight knows only the height so far and the
     field never shrinks again. */
  const measure = useCallback(() => {
    const el = innerRef.current;
    if (!el || !autoGrow) return;
    el.style.height = "auto";
    const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 0;
    el.style.height = `${clampedHeight(el.scrollHeight, lineHeight, maxRows)}px`;
    el.style.overflowY = maxRows && el.scrollHeight > el.clientHeight ? "auto" : "hidden";
  }, [autoGrow, maxRows]);

  /* Before painting, so that no intermediate state flashes up. Hangs on the
     value so that a text set from outside also carries the height along -
     not only typing. */
  useLayoutEffect(measure, [measure, rest.value, rest.defaultValue]);

  /* The font arrives later than the first layout; until then the line
     height measures itself wrongly. One re-measurement once it is there. */
  useEffect(() => {
    if (!autoGrow) return;
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [autoGrow, measure]);

  /* Uncontrolled, the browser holds the value and not React - then there is
     no re-render while typing, and a count derived from the props would
     stay standing at the initial text. Hence a mirror of its own, which is
     needed only in this case. */
  const [ownValue, setOwnValue] = useState(() => String(rest.defaultValue ?? ""));
  const controlled = rest.value !== undefined;
  const value = controlled ? String(rest.value ?? "") : ownValue;
  const remaining = remainingChars(value, rest.maxLength);
  const countVisible = showCount && remaining !== undefined;

  const element = (
    <textarea
      ref={innerRef}
      id={id ?? field?.id}
      rows={rows}
      disabled={disabled}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      aria-required={field?.required || undefined}
      aria-invalid={isInvalid || undefined}
      className={cx(
        styles.textarea,
        size === "sm" && styles.sm,
        isInvalid && styles.invalid,
        !countVisible && className,
      )}
      style={{ resize: resize ?? (autoGrow ? "none" : "vertical") }}
      /* Composed, not overridden: the caller's onInput used to come along
         behind with `...rest` and took the count and the growing away from
         the field (library-audit 04). First the caller, then the
         measuring. */
      onInput={(event) => {
        onInput?.(event);
        if (!controlled) setOwnValue(event.currentTarget.value);
        measure();
      }}
      {...rest}
    />
  );

  if (!countVisible) return element;

  return (
    <span className={cx(styles.wrapper, className)}>
      {element}
      {/* Announced politely: the count changes on every keystroke, and a
          reading after every letter would be unusable. */}
      <span
        aria-live="polite"
        className={cx(styles.count, remaining < 0 && styles.countOver)}
      >
        {remaining}
      </span>
    </span>
  );
});
