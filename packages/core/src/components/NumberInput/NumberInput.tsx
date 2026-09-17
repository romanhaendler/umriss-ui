import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import {
  clampNumber,
  decimalsAllowed,
  filterInput,
  formatNumber,
  parseNumber,
  stepNumber,
} from "./number";
import type { NumberConstraints } from "./number";
import styles from "./NumberInput.module.css";
import { useFormats, useWording } from "../../lib/language";
import { MinusGlyph, PlusGlyph } from "../../lib/glyphs";

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "prefix" | "type"> {
  /** The number, or `null` for "not stated". An empty field is not zero:
      a quantity that was not measured is not a quantity of zero. */
  value: number | null;
  /** Runs on every valid input, with `null` for the emptied field – and
      always clamped: what goes out lies between `min` and `max`, by every
      route, while typing included. Only the text in the field may still
      stand outside while typing; on leaving it is set to the clamped
      value. */
  onChange: (value: number | null) => void;
  /** Lower bound. Every reported value is clamped; the text in the field
      follows on leaving. */
  min?: number;
  /** Upper bound. Every reported value is clamped; the text in the field
      follows on leaving. */
  max?: number;
  /** Step size for the arrow keys; Shift multiplies it by ten. Default: 1. */
  step?: number;
  /** Fixed decimal places; 0 = whole numbers, undefined = free. */
  decimals?: number;
  /** Adornment before the number, e.g. "±". */
  prefix?: ReactNode;
  /** Adornment after the number, e.g. "€" or "%". */
  suffix?: ReactNode;
  /** `sm` for dense forms and table rows, `md` otherwise. */
  size?: "sm" | "md";
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only needed without `FormField`. */
  invalid?: boolean;
}

/**
 * Number input in German notation: the comma as the decimal separator,
 * dots as thousands separators (set on leaving, tolerated while typing).
 * The arrow keys count (Shift ×10), min/max clamp on leaving, alignment
 * right in Geist Mono.
 *
 * Stepper: quiet −/+ buttons without dividing lines, damped at rest, fully
 * present on hover or focus. Holding one down repeats the step (a short
 * run-up, then briskly); min/max disable the respective button.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    onChange,
    min,
    max,
    step = 1,
    decimals,
    prefix,
    suffix,
    size = "md",
    invalid,
    disabled,
    className,
    id,
    ...rest
  },
  ref,
) {
  const field = useFormField();
  const wording = useWording();
  /* Through the seam and not through `formatNumber`: otherwise the number
     field would be the only field carrying the default, even where the
     application has overridden the notation. That is exactly what the
     comment in number.ts claimed without it being true. */
  const formats = useFormats();
  const write = (value: number) => formats.number(value, decimals);
  const isInvalid = invalid ?? field?.invalid ?? false;
  const constraints = useMemo<NumberConstraints>(() => ({ min, max, decimals }), [min, max, decimals]);

  const [text, setText] = useState(() => (value === null ? "" : formatNumber(value, decimals)));
  const [focused, setFocused] = useState(false);

  // Adopt values set from outside, as long as nobody is typing.
  useEffect(() => {
    if (focused) return;
    setText(value === null ? "" : write(value));
    // `write` is created anew on every render and reads only `decimals` and
    // `formats` - both are in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, decimals, formats]);

  const commit = (next: number | null) => {
    if (next === null) {
      setText("");
      onChange(null);
      return;
    }
    const clamped = clampNumber(next, constraints);
    setText(write(clamped));
    onChange(clamped);
  };

  // Mirror the current state in a ref so that the hold repetition (the
  // setTimeout loop) never computes on stale closures.
  const textRef = useRef(text);
  textRef.current = text;
  const valueRef = useRef(value);
  valueRef.current = value;

  const stepBy = (direction: 1 | -1, factor = 1) => {
    const base = parseNumber(textRef.current) ?? valueRef.current ?? 0;
    commit(stepNumber(base, direction, step, factor));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    stepBy(event.key === "ArrowUp" ? 1 : -1, event.shiftKey ? 10 : 1);
  };

  // Holding down: repeat briskly after a short run-up.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopHold = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };
  useEffect(() => stopHold, []);

  const startHold = (direction: 1 | -1, shift: boolean) => {
    stepBy(direction, shift ? 10 : 1);
    const repeat = (delay: number) => {
      holdTimer.current = setTimeout(() => {
        stepBy(direction, shift ? 10 : 1);
        repeat(Math.max(40, delay * 0.9));
      }, delay);
    };
    repeat(400);
  };

  const current = parseNumber(text) ?? value;
  const canIncrease = !disabled && (max === undefined || current === null || current < max);
  const canDecrease = !disabled && (min === undefined || current === null || current > min);

  const stepperButton = (direction: 1 | -1, allowed: boolean, label: string, glyph: ReactNode) => (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled || !allowed}
      aria-label={label}
      onPointerDown={(event) => {
        // Focus stays in the input field, no text selection while holding.
        event.preventDefault();
        if (event.button !== 0) return;
        startHold(direction, event.shiftKey);
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onContextMenu={(event) => event.preventDefault()}
    >
      {glyph}
    </button>
  );

  return (
    <span
      className={cx(
        styles.wrapper,
        size === "sm" && styles.sm,
        isInvalid && styles.invalid,
        disabled && styles.disabled,
        className,
      )}
    >
      {prefix && <span className={styles.adornment}>{prefix}</span>}
      <input
        ref={ref}
        type="text"
        inputMode={decimalsAllowed(decimals) ? "decimal" : "numeric"}
        id={id ?? field?.id}
        disabled={disabled}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        className={styles.input}
        value={text}
        onChange={(event) => {
          const raw = filterInput(event.target.value, constraints);
          setText(raw);
          /* One contract for every route: what goes out is clamped. The
             text stays local so that typing does not stutter over it. */
          const parsed = parseNumber(raw);
          onChange(parsed === null ? null : clampNumber(parsed, constraints));
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          setFocused(false);
          // Adopt the actual field content, not the state (which may be one
          // render stale) – the same safeguard as in the TimeField.
          commit(parseNumber(event.currentTarget.value));
        }}
        {...rest}
      />
      {suffix && <span className={styles.adornment}>{suffix}</span>}
      <span className={styles.stepper}>
        {stepperButton(-1, canDecrease, wording.decreaseValue, <MinusGlyph />)}
        {stepperButton(1, canIncrease, wording.increaseValue, <PlusGlyph />)}
      </span>
    </span>
  );
});
