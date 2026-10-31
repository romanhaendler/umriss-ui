import { useRef } from "react";
import type { CSSProperties, FocusEvent, InputHTMLAttributes, KeyboardEvent, PointerEvent } from "react";
import { cx } from "../../lib/cx";
import { fieldBlur } from "../../lib/fieldBlur";
import { useFormats, useWording } from "../../lib/language";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
import { useFieldValue, withoutFieldProps } from "../../lib/useFieldValue";
import { useShapeWarning } from "../../lib/useShapeWarning";
import { useFormField } from "../FormField";
import { decimalsOf, keyed, snap } from "../Slider/Slider";
import styles from "./RangeSlider.module.css";

/** The two ends of a range on the track, `[from, to]`. */
export type RangeSliderValue = readonly [from: number, to: number];

/** The props of `RangeSlider`. */
export interface RangeSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "name">, RefProp<HTMLInputElement> {
  /** Controlled: `[from, to]`; `undefined` reads as the whole range. */
  value?: RangeSliderValue;
  /** Uncontrolled: the pair to start at.
      @default [min, max] */
  defaultValue?: RangeSliderValue;
  /** Reports every change, by pointer or key, as a pair on the step and inside the bounds, with `from <= to`. */
  onValueChange?: (value: [from: number, to: number]) => void;
  /** The smallest value. */
  min?: number;
  /** The largest value. */
  max?: number;
  /** The step both ends move by, counted from `min`. */
  step?: number;
  /** The value as text: for the readout and for the screen reader (`aria-valuetext`).
      @default the number in the formats' notation, with as many decimals as the step has */
  format?: (value: number) => string;
  /** The pair in mono beside the track. */
  showValue?: boolean;
  /** Posts the two ends in a `<form>` as `<name>Start` and `<name>End`, both overridable. */
  name?: string;
  /** The name the lower end is posted under.
      @default `${name}Start` */
  startName?: string;
  /** The name the upper end is posted under.
      @default `${name}End` */
  endName?: string;
}

const isPair = (v: unknown): v is RangeSliderValue => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && Number.isFinite(n));

/* Two native range inputs on one track, drawn one over the other: the inputs
   take no pointer except on their thumbs, so each thumb is grabbed and
   dragged by the platform, and a press on the bare track moves the nearer
   thumb. Both inputs keep the full bounds, so a thumb stands where the same
   value stands on a Slider; the clamp against the other end is ours. The
   group, not the thumb, carries `aria-label`; class and style go on the
   wrapper, ref and the rest on the lower thumb. */
/** Two values, a lower and an upper end, on one track between `min` and `max`; the ends never cross. */
export function RangeSlider(props: RangeSliderProps) {
  const {
    ref,
    min = 0,
    max = 100,
    step = 1,
    format,
    showValue = true,
    name,
    startName,
    endName,
    className,
    style,
    id,
    disabled,
    onKeyDown,
    onBlur,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...fieldRest
  } = props;
  // The field's own props are read from `props` by `useFieldValue`; none of them reaches the element.
  const rest = withoutFieldProps(fieldRest);
  const wrap = useRef<HTMLDivElement>(null);
  const lowThumb = useRef<HTMLInputElement>(null);
  const highThumb = useRef<HTMLInputElement>(null);
  const formats = useFormats();
  const wording = useWording();
  const field = useFormField();
  const [given, report, controlled, formRef] = useFieldValue<RangeSliderValue, readonly [number, number]>("RangeSlider", props, [min, max], false);
  useShapeWarning("RangeSlider", "value", props.value != null && !isPair(props.value), "a pair [from, to] of numbers");
  const pair = isPair(given) ? given : ([min, max] as const);
  // Uncontrolled, the start is put on the step grid; a controlled value is the caller's, only ordered and inside the bounds.
  const place = (x: number) => (controlled ? Math.min(max, Math.max(min, x)) : snap(x, min, max, step));
  const from = place(Math.min(pair[0], pair[1]));
  const to = place(Math.max(pair[0], pair[1]));
  const show = (x: number) => (format ? format(x) : formats.number(x, decimalsOf(step, min)));
  const text = `${show(from)} – ${show(to)}`;
  // The readout's room is that of the longest pair it can show, so the track keeps its length.
  const room = 2 * Math.max(show(min).length, show(max).length) + 3;
  const share = (x: number) => (max > min ? (x - min) / (max - min) : 0);

  const commit = (end: 0 | 1, next: number) => {
    const pairNext: [number, number] = end === 0 ? [Math.min(next, to), to] : [from, Math.max(next, from)];
    if (pairNext[end] !== (end === 0 ? from : to)) report(pairNext);
  };

  const handleKeyDown = (end: 0 | 1) => (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const next = keyed(event.key, end === 0 ? from : to, min, max, step);
    if (next === undefined) return;
    event.preventDefault();
    commit(end, next);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => fieldBlur(event, onBlur, wrap);

  // A press on the bare track moves the nearer thumb there and focuses it.
  const handleTrackPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0 || event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    const thumb = 14;
    const along = Math.min(1, Math.max(0, (event.clientX - box.left - thumb / 2) / Math.max(1, box.width - thumb)));
    const at = snap(min + along * (max - min), min, max, step);
    const end = at <= from ? 0 : at >= to ? 1 : at - from < to - at ? 0 : 1;
    event.preventDefault();
    commit(end, at);
    (end === 0 ? lowThumb : highThumb).current?.focus();
  };

  const thumb = (end: 0 | 1) => {
    const value = end === 0 ? from : to;
    return {
      type: "range" as const,
      id: end === 0 ? (id ?? field?.id) : undefined,
      name: end === 0 ? (startName ?? (name && `${name}Start`)) : (endName ?? (name && `${name}End`)),
      "aria-label": end === 0 ? wording.rangeSliderFrom : wording.rangeSliderTo,
      "aria-valuetext": show(value),
      "aria-invalid": field?.invalid || undefined,
      "aria-required": field?.required || undefined,
      disabled,
      // The upper thumb lies on top, except where both stand in the upper half: then the lower one is the one that can still move.
      className: cx(styles.thumb, end === 0 && from === to && share(from) > 0.5 && styles.raised),
      min,
      max,
      step,
      value,
      onChange: (event: { target: { value: string } }) => commit(end, snap(Number(event.target.value), min, max, step)),
      onKeyDown: handleKeyDown(end),
    };
  };

  return (
    <div
      ref={mergeRefs(wrap, formRef)}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelId)}
      aria-describedby={ariaDescribedBy ?? field?.describedBy}
      className={cx(styles.rangeSlider, className)}
      style={style}
    >
      <div className={styles.control} onPointerDown={handleTrackPointer}>
        {/* The groove, and the stretch of it between the two ends. */}
        <div className={styles.rail} aria-hidden="true" style={{ "--_from": share(from), "--_to": share(to) } as CSSProperties}>
          <div className={styles.fill} />
        </div>
        <input {...rest} {...thumb(0)} onBlur={handleBlur} ref={mergeRefs(ref, lowThumb)} />
        <input {...thumb(1)} onBlur={handleBlur} ref={highThumb} />
      </div>
      {showValue && (
        <span className={styles.readout} style={{ "--_room": room } as CSSProperties} aria-hidden="true">
          {text}
        </span>
      )}
    </div>
  );
}
