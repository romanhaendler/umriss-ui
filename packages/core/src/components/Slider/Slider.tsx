import { forwardRef, useState } from "react";
import type { CSSProperties, InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useFormats } from "../../lib/language";
import { useFormField } from "../FormField";
import styles from "./Slider.module.css";

/** A mark on the track: a value, or a value with the word beneath it. */
export type SliderMark = number | { value: number; label?: ReactNode };

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
  /** Controlled: the value. */
  value?: number;
  /** Uncontrolled: the value to start at. Default: `min`. */
  defaultValue?: number;
  /** Reports every change, by pointer or key, as a number on the step. */
  onChange?: (value: number) => void;
  /** Default: 0 */
  min?: number;
  /** Default: 100 */
  max?: number;
  /** Default: 1 */
  step?: number;
  /** Values marked on the track; an object with a `label` writes the word
      beneath its mark. A mark shows a value, it does not catch the thumb. */
  marks?: readonly SliderMark[];
  /** The value as text: for the readout and for the screen reader
      (`aria-valuetext`). Default: the number in the formats' notation, with
      as many decimals as the step has. */
  format?: (value: number) => string;
  /** The value in mono beside the track. Default: true */
  showValue?: boolean;
}

/** Decimals of a step, so that 0.1 + 0.2 stays 0.3 on the track. */
const decimalsOf = (step: number) => (String(step).split(".")[1] ?? "").length;

/** The last value on the step grid - `max` itself only where it lies on the
    grid; the browser would otherwise show the thumb a step below the value. */
const topOf = (min: number, max: number, step: number) =>
  Number((min + Math.floor((max - min) / step + 1e-9) * step).toFixed(decimalsOf(step)));

/** A value moved onto the step grid from `min`, and inside the bounds. */
function snap(value: number, min: number, max: number, step: number): number {
  const onGrid = Number((min + Math.round((value - min) / step) * step).toFixed(decimalsOf(step)));
  return Math.min(topOf(min, max, step), Math.max(min, onGrid));
}

/** Where a key takes the value, per the APG slider pattern; `undefined` for
    a key that is not the slider's. PageUp moves by a tenth of the range on
    the step, and never by less than one step. */
function keyed(key: string, value: number, min: number, max: number, step: number): number | undefined {
  const page = Math.max(step, Math.round((max - min) / 10 / step) * step);
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return snap(value + step, min, max, step);
    case "ArrowLeft":
    case "ArrowDown":
      return snap(value - step, min, max, step);
    case "PageUp":
      return snap(value + page, min, max, step);
    case "PageDown":
      return snap(value - page, min, max, step);
    case "Home":
      return min;
    case "End":
      return topOf(min, max, step);
    default:
      return undefined;
  }
}

/* One value on the native range input: the pointer, the focus, a form's
   `name` and the role come from the platform, and the drawing comes from the
   tokens. The keys are the component's own - PageUp and PageDown step
   differently from engine to engine, and a data-dense screen should not.

   The construction of the other native fields: the class on the wrapper,
   ref and rest on the input. */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    marks,
    format,
    showValue = true,
    className,
    style,
    id,
    disabled,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const formats = useFormats();
  const field = useFormField();
  const [own, setOwn] = useState(() => snap(defaultValue ?? min, min, max, step));
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : own;
  const text = format ? format(value) : formats.number(value, decimalsOf(step));
  const share = (x: number) => (max > min ? ((x - min) / (max - min)) * 100 : 0);

  const commit = (next: number) => {
    if (next === value) return;
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const next = keyed(event.key, value, min, max, step);
    if (next === undefined) return;
    event.preventDefault();
    commit(next);
  };

  return (
    <div className={cx(styles.slider, className)}>
      <div className={styles.control}>
        <input
          ref={ref}
          type="range"
          id={id ?? field?.id}
          aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          aria-required={field?.required || undefined}
          aria-valuetext={text}
          disabled={disabled}
          className={styles.range}
          {...rest}
          /* The share of the track that is filled, read by the track's
             pseudo-elements - they inherit it from the input. */
          style={{ ...style, "--_fill": `${share(value)}%` } as CSSProperties}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => commit(snap(Number(event.target.value), min, max, step))}
          onKeyDown={handleKeyDown}
        />
        {marks && marks.length > 0 && (
          <div className={styles.marks} aria-hidden="true">
            {marks.map((mark, index) => {
              const at = typeof mark === "number" ? mark : mark.value;
              const label = typeof mark === "number" ? undefined : mark.label;
              return (
                <span key={index} data-mark="" className={styles.mark} style={{ left: `${share(at)}%` }}>
                  {label !== undefined && <span className={styles.markLabel}>{label}</span>}
                </span>
              );
            })}
          </div>
        )}
      </div>
      {showValue && (
        <span className={styles.readout} aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
});
