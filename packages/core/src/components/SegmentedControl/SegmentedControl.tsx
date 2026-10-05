/* One choice out of a few short possibilities, drawn as one field.

   It stands in a row of fields as one of them: as tall, as edged and as
   rounded as a select, a segment for each possibility, the chosen one filled
   with ink. Where a possibility needs a line of explanation, the radio
   group's dots are the form instead.

   It is a radio group and not a row of toggle buttons. Buttons that stay
   pressed announce "toggle button, pressed" each, are a tab stop each, and
   say nowhere that only one of them can hold; real radio inputs say "radio,
   1 of 2, selected", are one tab stop, and the arrow keys move and choose.
   The mechanics are the radio group's own, shared through `useRadioGroup`
   (field-row-alignment 04). */

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { useControlSize } from "../../lib/controlSize";
import { useFormField } from "../FormField";
import { useRadioGroup } from "../RadioGroup/useRadioGroup";
import styles from "./SegmentedControl.module.css";

/** One possibility of a `SegmentedControl`: its value and its short label. */
export interface SegmentedOption<T extends string> {
  /** What comes back when this possibility is chosen. */
  value: T;
  /** The segment's word - a short one; a long label ends in an ellipsis. */
  label: ReactNode;
  /** An icon before the word: an SVG, a glyph of the set or an icon font's
      element. The control sets its size - `--u-icon-size`, `--u-icon-size-sm`
      at `sm` - and hides it from assistive technology: the word names the
      possibility. */
  icon?: ReactNode;
  /** Takes the possibility out of the choice but leaves it visible. */
  disabled?: boolean;
}

/** The props of `SegmentedControl`. */
export interface SegmentedControlProps<T extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** The possibilities, two to four, in the order in which they stand. */
  options: readonly SegmentedOption<T>[];
  /** The chosen possibility; `null` means: none yet. Together with
      `onChange` the control is controlled. */
  value?: T | null;
  /** Initial value of an uncontrolled control. Not together with `value`. */
  defaultValue?: T | null;
  /** Runs on every choice – on the one made with the arrow keys as well. */
  onChange?: (value: T) => void;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** Takes the whole width its place gives it, as a field in a column does,
      and shares it equally between the segments. Without it the control is
      as wide as its words. */
  fill?: boolean;
  /** Disables the whole control. `SegmentedOption` disables single
      possibilities. */
  disabled?: boolean;
  /** Name of the radio group within the form.
      @default a generated one */
  name?: string;
}

/** One choice out of a few short possibilities, drawn as one field with a
    segment for each - a radio group in what it says and how the keys move.
    Controlled through `value` and `onChange`, or uncontrolled from
    `defaultValue`. */
export const SegmentedControl = forwardRef(function SegmentedControl<T extends string>(
  {
    options,
    value,
    defaultValue,
    onChange,
    size: ownSize,
    fill = false,
    disabled = false,
    name,
    className,
    onKeyDown,
    ...rest
  }: SegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const radio = useRadioGroup({
    options,
    value,
    defaultValue,
    onChange,
    disabled,
    name,
    onKeyDown,
    describedBy: rest["aria-describedby"],
    label: rest["aria-label"],
  });

  return (
    <div
      ref={mergeRefs(radio.groupRef, ref)}
      {...radio.groupProps}
      className={cx(
        styles.control,
        size === "sm" && styles.sm,
        fill && styles.fill,
        disabled && styles.disabled,
        field?.invalid && styles.invalid,
        className,
      )}
      {...rest}
      onKeyDown={radio.onKeyDown}
    >
      {options.map((option) => (
        <label
          key={option.value}
          /* Dimmed once: a disabled control dims as a whole. */
          className={cx(styles.segment, !disabled && option.disabled && styles.disabled)}
          htmlFor={radio.optionId(option)}
        >
          <input {...radio.inputProps(option)} className={styles.input} />
          {option.icon !== undefined && (
            <span className={styles.icon} aria-hidden="true">
              {option.icon}
            </span>
          )}
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}) as <T extends string>(
  props: SegmentedControlProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;
