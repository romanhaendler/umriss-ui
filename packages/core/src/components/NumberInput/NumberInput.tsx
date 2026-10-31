import { useShapeWarning } from "../../lib/useShapeWarning";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { mergeRefs } from "../../lib/mergeRefs";
import { useFieldValue, withoutFieldProps } from "../../lib/useFieldValue";
import { FormPost, posted, type FormPostProps } from "../../lib/FormPost";
import {
  clampNumber,
  decimalsAllowed,
  filterInput,
  isReadable,
  negativeAllowed,
  parseNumber,
  stepNumber,
} from "./number";
import type { NumberConstraints } from "./number";
import type { RefProp } from "../../lib/refProp";
import styles from "./NumberInput.module.css";
import { useControlSize } from "../../lib/controlSize";
import { extentStyle, textChars } from "../../lib/extent";
import { useFormats, useWording } from "../../lib/language";
import { separatorsOf } from "../../lib/language/formats";
import { announce } from "../../lib/announce";
import { MinusGlyph, PlusGlyph } from "../../lib/glyphs";

/** The props of `NumberInput`: a native input's attributes, with the value a
    number or `null`. */
export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "prefix" | "type" | "name">, RefProp<HTMLInputElement>, FormPostProps<number> {
  /** The number, or `null` (or `undefined`) for "not stated". An empty
      field is not zero: a quantity that was not measured is not a quantity
      of zero. With it the field is controlled; without it the field keeps
      the number itself, from `defaultValue`. */
  value?: number | null;
  /** Uncontrolled: the number to start at.
      @default null */
  defaultValue?: number | null;
  /** Runs on every valid input, with `null` for the emptied field – and
      always clamped: what goes out lies between `min` and `max`, by every
      route, while typing included. Only the text in the field may still
      stand outside while typing; on leaving it is set to the clamped
      value. */
  onValueChange?: (value: number | null) => void;
  /** The former name of `onValueChange`. @deprecated since 0.52 - use `onValueChange`; it goes in the next minor release. */
  onChange?: (value: number | null) => void;
  /** Lower bound. Every reported value is clamped; the text in the field
      follows on leaving. */
  min?: number;
  /** Upper bound. Every reported value is clamped; the text in the field
      follows on leaving. */
  max?: number;
  /** Step size for the arrow keys; Shift multiplies it by ten. */
  step?: number;
  /** Fixed decimal places; 0 = whole numbers, undefined = free. */
  decimals?: number;
  /** Group separators in the text: `false` writes none ("2024"), and the
      field still reads what it writes.
      @default true */
  grouping?: boolean;
  /** Adornment before the number, e.g. "±". */
  prefix?: ReactNode;
  /** Adornment after the number, e.g. "€" or "%". */
  suffix?: ReactNode;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** The width in characters - room for the number; the field adds its own
      padding and steppers, and the room for a `prefix` and `suffix` given as
      text. Given, the field is that wide wherever it stands, and never wider
      than its place. Without it the field fills its place, and is 10
      characters wide where the place asks - in a toolbar or a row. */
  chars?: number;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only needed without `FormField`. */
  invalid?: boolean;
}

/**
 * Number input in the notation of the formats (`useFormats`): its decimal and
 * group separators are read and written, the group separators set on leaving
 * and tolerated while typing. The arrow keys count (Shift ×10), min/max clamp
 * on leaving, alignment right in Geist Mono.
 *
 * Stepper: quiet −/+ buttons without dividing lines, damped at rest, fully
 * present on hover or focus. Holding one down repeats the step (a short
 * run-up, then briskly); min/max disable the respective button.
 */
export function NumberInput(props: NumberInputProps) {
  const {
    ref,
    min,
    max,
    step = 1,
    decimals,
    grouping = true,
    prefix,
    suffix,
    size: ownSize,
    chars,
    invalid,
    disabled,
    className,
    style,
    id,
    onFocus,
    onBlur,
    onKeyDown,
    name,
    formValue,
    ...fieldRest
  } = props;
  // The field's own props are read from `props` by `useFieldValue`; none of them reaches the element.
  const rest = withoutFieldProps(fieldRest);
  const [valueGiven, onChange, , formRef] = useFieldValue<number | null>("NumberInput", props, null);
  // NaN and ±Infinity are no number a field can show: it stays empty.
  const value = typeof valueGiven === "number" && Number.isFinite(valueGiven) ? valueGiven : null;
  useShapeWarning("NumberInput", "value", valueGiven != null && value === null, "a number or null, and a finite one");
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  /* Through the seam and not through `formatNumber`, so that an override of
     the notation by the application is followed. */
  const formats = useFormats();
  /* The field reads the notation it writes: an application that replaced the
     number format changed both halves at once (ADR-0024). */
  const separators = useMemo(() => separatorsOf(formats), [formats]);
  const write = (value: number) => {
    const text = formats.number(value, decimals);
    return grouping || separators.group === "" ? text : text.replaceAll(separators.group, "");
  };
  const read = (raw: string) => parseNumber(raw, separators);
  // A refused character shows the invalid look for a moment.
  const [refused, setRefused] = useState(false);
  const refusedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (refusedTimer.current !== null) clearTimeout(refusedTimer.current);
    },
    [],
  );
  // A paste that cannot be read stays in the field, marked, until the next valid input.
  const [unreadable, setUnreadable] = useState(false);
  const pasted = useRef(false);
  const isInvalid = (invalid ?? field?.invalid ?? false) || refused || unreadable;
  const unitId = useId();
  const constraints = useMemo<NumberConstraints>(() => ({ min, max, decimals }), [min, max, decimals]);

  // In the notation of the formats from the first render on, not after the effect.
  const [text, setText] = useState(() => (value === null ? "" : write(value)));
  const [focused, setFocused] = useState(false);
  // The last number this field reported: a different `value` came from outside.
  const emitted = useRef<number | null>(value);

  // Adopt values set from outside; while typing only one that is not what the
  // field itself just reported.
  useEffect(() => {
    if ((focused || unreadable) && value === emitted.current) return;
    emitted.current = value;
    setUnreadable(false);
    setText(value === null ? "" : write(value));
    // `write` is created anew on every render and reads only `decimals`,
    // `grouping` and `formats` - all are in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, unreadable, decimals, grouping, formats]);

  const commit = (next: number | null) => {
    if (next === null) {
      setText("");
      emitted.current = null;
      onChange(null);
      return;
    }
    const clamped = clampNumber(next, constraints);
    setText(write(clamped));
    emitted.current = clamped;
    onChange(clamped);
  };

  // Mirror the current state in a ref so that the hold repetition (the
  // setTimeout loop) never computes on stale closures.
  const textRef = useRef(text);
  // eslint-disable-next-line react-hooks/refs
  textRef.current = text;
  const valueRef = useRef(value);
  // eslint-disable-next-line react-hooks/refs
  valueRef.current = value;

  const stepBy = (direction: 1 | -1, factor = 1) => {
    const base = read(textRef.current) ?? valueRef.current ?? 0;
    commit(stepNumber(base, direction, step, factor, min));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
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

  // A unit given as text is read with the field, as its description.
  const describedBy =
    [rest["aria-describedby"] ?? field?.describedBy, textChars(prefix) ? `${unitId}-prefix` : "", textChars(suffix) ? `${unitId}-suffix` : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  const current = read(text) ?? value;
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
      style={{ ...extentStyle(chars, { extra: textChars(prefix) + textChars(suffix) }), ...style }}
    >
      {prefix && <span className={styles.adornment} id={`${unitId}-prefix`}>{prefix}</span>}
      {/* The plain number is posted, not the text the field shows in the reader's notation. */}
      <FormPost entries={[[name, posted(value, String, formValue)]]} disabled={disabled} />
      <input
        ref={mergeRefs(ref, formRef)}
        type="text"
        /* A minus key only the text keyboard has, where a negative value is
           allowed; `min={0}` brings back the number pad. */
        inputMode={negativeAllowed(min) ? "text" : decimalsAllowed(decimals) ? "decimal" : "numeric"}
        id={id ?? field?.id}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        className={styles.input}
        value={text}
        onPaste={() => {
          pasted.current = true;
        }}
        onChange={(event) => {
          const wasPasted = pasted.current;
          pasted.current = false;
          const raw = filterInput(event.target.value, constraints, separators);
          const readable = raw.length === event.target.value.length && isReadable(raw, separators);
          if (!readable) {
            announce(wording.numberRefused, event.target);
            if (wasPasted) {
              /* A paste is kept as it came, marked: dropping or emptying it
                 would lose what the user brought. */
              setText(event.target.value);
              setUnreadable(true);
              return;
            }
            /* A character the field cannot read refuses the whole edit: the
               field keeps its text instead of reading the rest as another
               value. */
            setRefused(true);
            if (refusedTimer.current !== null) clearTimeout(refusedTimer.current);
            refusedTimer.current = setTimeout(() => setRefused(false), 1200);
            return;
          }
          setUnreadable(false);
          setRefused(false);
          setText(raw);
          /* One contract for every route: what goes out is clamped. The
             text stays local so that typing does not stutter over it. */
          const parsed = read(raw);
          const out = parsed === null ? null : clampNumber(parsed, constraints);
          emitted.current = out;
          onChange(out);
        }}
        {...rest}
        /* After `rest` and composed with the caller's: replacing the commit on
           leaving would leave the field counting as focused for good. */
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          setFocused(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setFocused(false);
          // Adopt the actual field content, not the state (which may be one render stale).
          const shown = event.currentTarget.value;
          // An unreadable paste or a dangling exponent stays to be corrected, not emptied.
          if (shown.trim() !== "" && shown.trim() !== "-" && read(shown) === null) {
            setUnreadable(true);
            return;
          }
          commit(read(shown));
        }}
      />
      {suffix && <span className={styles.adornment} id={`${unitId}-suffix`}>{suffix}</span>}
      <span className={styles.stepper}>
        {stepperButton(-1, canDecrease, wording.decreaseValue, <MinusGlyph />)}
        {stepperButton(1, canIncrease, wording.increaseValue, <PlusGlyph />)}
      </span>
    </span>
  );
}
