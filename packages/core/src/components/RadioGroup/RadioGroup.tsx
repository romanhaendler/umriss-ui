/* A choice among a few mutually exclusive possibilities.

   The gap between Checkbox (several of them, independent of one another) and
   Select (many of them, in a list): three or four possibilities, each of
   which needs a line of explanation. A segmented control is the wrong form
   for that as soon as the explanation belongs to it.

   Operation: exactly one tab stop for the whole group. The arrow keys move
   *and* choose - that is what the pattern for radio groups demands -, skip
   over whatever is disabled and wrap around at the ends.

   The arrow key navigation is built here and not fetched from a shared
   helper: there is none (yet), and introducing one in the same change would
   mean touching the calendar, the menu, the tabs, the combobox and the
   MultiSelect. */

import { forwardRef, useId, useRef } from "react";
import { idPart } from "../../lib/idPart";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { useFormField } from "../FormField";
import styles from "./RadioGroup.module.css";

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
  /** Arrangement; Default one below the other. */
  orientation?: "vertical" | "horizontal";
  /** `sm` for dense forms, `md` otherwise. */
  size?: "sm" | "md";
  /** Disables the whole group. `RadioOption` disables single
      possibilities. */
  disabled?: boolean;
  /** Name of the radio group within the form; otherwise automatic. */
  name?: string;
}

export const RadioGroup = forwardRef(function RadioGroup<T extends string>(
  {
    options,
    value,
    defaultValue,
    onChange,
    orientation = "vertical",
    size = "md",
    disabled = false,
    name,
    className,
    onKeyDown,
    ...rest
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const field = useFormField();
  const generatedName = useId();
  const groupName = name ?? field?.id ?? generatedName;
  const groupRef = useRef<HTMLDivElement>(null);

  /* Uncontrolled, it is led by the DOM state of the inputs: the browser
     holds the choice of a radio group anyway, and a second state beside it
     would be a source of contradictions. */
  const controlled = value !== undefined;

  const selectable = options.filter((option) => !option.disabled && !disabled);

  const select = (next: RadioOption<T>) => {
    onChange?.(next.value);
  };

  /* The arrow keys move and choose at once – that is how the radio pattern
     is meant to work, and the reason why the group has only one tab stop. */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    /* Composed with the caller's: `rest` used to replace it, and the arrow
       keys then chose nothing. */
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const backward = event.key === "ArrowUp" || event.key === "ArrowLeft";
    if (!forward && !backward) return;
    if (selectable.length === 0) return;
    event.preventDefault();

    const currentValue =
      (controlled ? value : groupRef.current?.querySelector<HTMLInputElement>("input:checked")?.value) ??
      null;
    const index = selectable.findIndex((option) => option.value === currentValue);
    const nextIndex =
      index === -1
        ? 0
        : (index + (forward ? 1 : -1) + selectable.length) % selectable.length;
    const next = selectable[nextIndex];
    if (!next) return;

    /* The input is searched for rather than addressed through a selector:
       a value can contain quotation marks or backslashes, and then the
       selector would need `CSS.escape` - which does not exist everywhere.
       Searching is also simply the simpler thing here. */
    const inputs = Array.from(
      groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
    );
    inputs.find((input) => input.value === next.value)?.focus();
    select(next);
  };

  /* The tab stop sits on the chosen option; where none is chosen, on the
     first selectable one. Otherwise the group would have either no entry at
     all or as many as it has options. */
  const tabStop = (option: RadioOption<T>): number | undefined => {
    /* Uncontrolled, no render follows a choice, so a tab stop written here
       stayed on the initial option and Tab came back to it rather than to the
       chosen one. The browser's own rule for a radio group is exactly the
       one above, and it follows the choice. */
    if (!controlled) return undefined;
    if (option.disabled || disabled) return -1;
    if (value === option.value) return 0;
    /* On the first selectable one in that case too, where the controlled
       value points at a disabled option - otherwise the group would have no
       entry at all and be unreachable with the keyboard. */
    const chosenReachable = selectable.some((o) => o.value === value);
    if (!chosenReachable && selectable[0]?.value === option.value) return 0;
    return -1;
  };

  return (
    <div
      ref={mergeRefs(groupRef, ref)}
      /* The surrounding field's id is carried by the group itself, so that
         `label htmlFor` does not point into the void. Putting it on one of
         the options would be worse: a click on the field's label would then
         choose the first option. */
      id={field?.id}
      role="radiogroup"
      aria-orientation={orientation}
      aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
      aria-required={field?.required || undefined}
      aria-invalid={field?.invalid || undefined}
      className={cx(
        styles.group,
        orientation === "horizontal" && styles.horizontal,
        size === "sm" && styles.sm,
        className,
      )}
      {...rest}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        /* On its own useId and not on the name: that can come from the
           caller, and neither it nor the value may go raw into an id that
           `aria-describedby` reads (library-audit 04). */
        const optionId = `${generatedName}-${idPart(option.value)}`;
        const descriptionId = option.description ? `${optionId}-description` : undefined;
        const optionDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={cx(styles.option, optionDisabled && styles.disabled)}
            htmlFor={optionId}
          >
            <input
              type="radio"
              id={optionId}
              name={groupName}
              value={option.value}
              disabled={optionDisabled}
              tabIndex={tabStop(option)}
              className={styles.input}
              aria-describedby={descriptionId}
              {...(controlled
                ? { checked: value === option.value, onChange: () => select(option) }
                : { defaultChecked: defaultValue === option.value, onChange: () => select(option) })}
            />
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
