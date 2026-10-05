/* A choice among a few mutually exclusive possibilities.

   The gap between Checkbox (several of them, independent of one another) and
   Select (many of them, in a list): three or four possibilities, each of
   which needs a line of explanation. A segmented control is the wrong form
   for that as soon as the explanation belongs to it.

   Operation - one tab stop, arrow keys that move and choose - stands in
   `useRadioGroup`, which the segmented control shares. */

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import styles from "./RadioGroup.module.css";
import { useControlSize } from "../../lib/controlSize";
import { useRadioGroup } from "./useRadioGroup";

/** One possibility of a `RadioGroup`: its value, its label and an optional
    line of explanation. */
export interface RadioOption<T extends string> {
  /** What comes back when this possibility is chosen. */
  value: T;
  /** What stands beside it. */
  label: ReactNode;
  /** Line of explanation under the label; it is read out as well. */
  description?: ReactNode;
  /** Takes the possibility out of the choice but leaves it visible: a
      choice that does not exist is a different statement from one that may
      not be made. */
  disabled?: boolean;
}

/** The props of `RadioGroup`. */
export interface RadioGroupProps<T extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** The possibilities, in the order in which they are meant to stand. */
  options: readonly RadioOption<T>[];
  /** The chosen possibility; `null` means: none yet. Together with
      `onChange` the group is controlled. */
  value?: T | null;
  /** Initial value of an uncontrolled group. Not together with `value`. */
  defaultValue?: T | null;
  /** Runs on every choice – on the one made with the arrow keys as well. */
  onChange?: (value: T) => void;
  /** Arrangement: one below the other, or side by side. */
  orientation?: "vertical" | "horizontal";
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** Disables the whole group. `RadioOption` disables single
      possibilities. */
  disabled?: boolean;
  /** Name of the radio group within the form.
      @default a generated one */
  name?: string;
}

/** One choice out of a few possibilities, all of them visible. Controlled
    through `value` and `onChange`, or uncontrolled from `defaultValue`; the
    arrow keys move between the possibilities. */
export const RadioGroup = forwardRef(function RadioGroup<T extends string>(
  {
    options,
    value,
    defaultValue,
    onChange,
    orientation = "vertical",
    size: ownSize,
    disabled = false,
    name,
    className,
    onKeyDown,
    ...rest
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const size = useControlSize(ownSize);
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
      aria-orientation={orientation}
      className={cx(
        styles.group,
        orientation === "horizontal" && styles.horizontal,
        size === "sm" && styles.sm,
        className,
      )}
      {...rest}
      onKeyDown={radio.onKeyDown}
    >
      {options.map((option) => {
        const optionId = radio.optionId(option);
        const descriptionId = option.description ? `${optionId}-description` : undefined;
        const optionDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={cx(styles.option, optionDisabled && styles.disabled)}
            htmlFor={optionId}
          >
            <input {...radio.inputProps(option, descriptionId)} className={styles.input} />
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.texts}>
              <span className={styles.label}>{option.label}</span>
              {option.description && (
                <span id={descriptionId} className={styles.description}>
                  {option.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}) as <T extends string>(
  props: RadioGroupProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;
