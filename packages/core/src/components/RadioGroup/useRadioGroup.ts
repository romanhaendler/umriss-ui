/* The mechanics of a radio group, apart from how it is drawn.

   Two components choose one out of a few with them: the radio group, as dots
   with a line of explanation, and the segmented control, as one field with a
   segment for each. What a screen reader hears, where the tab stop sits and
   how the arrow keys move must be the same in both - so it stands once, here,
   and each draws around it.

   Operation: exactly one tab stop for the whole group. The arrow keys move
   *and* choose - that is what the pattern for radio groups demands -, skip
   over whatever is disabled and wrap around at the ends.

   Not exported from the package. */

import { useId, useRef } from "react";
import type { InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from "react";
import { idPart } from "../../lib/idPart";
import { useFormField } from "../FormField";

/** What the mechanics need of a possibility. */
export interface RadioChoice<T extends string> {
  value: T;
  disabled?: boolean;
}

export interface UseRadioGroupOptions<T extends string> {
  options: readonly RadioChoice<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T) => void;
  disabled: boolean;
  name?: string;
  /** The caller's own key handler; it runs first and can prevent ours. */
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  /** The caller's own `aria-describedby`, which wins over the field's. */
  describedBy?: string;
  /** The caller's own `aria-label`: it names the group, and the field's
      label then does not - `aria-labelledby` would outrank it. */
  label?: string;
}

export function useRadioGroup<T extends string>({
  options,
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  onKeyDown,
  describedBy,
  label,
}: UseRadioGroupOptions<T>) {
  const field = useFormField();
  const generatedName = useId();
  const groupName = name ?? field?.id ?? generatedName;
  const groupRef = useRef<HTMLDivElement>(null);

  // Uncontrolled, the DOM state of the inputs leads: the browser holds the choice anyway.
  const controlled = value !== undefined;

  const selectable = options.filter((option) => !option.disabled && !disabled);

  const select = (next: RadioChoice<T>) => {
    onChange?.(next.value);
  };

  // The arrow keys move and choose at once, as the radio pattern has it.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Composed with the caller's: `rest` would replace it.
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

    /* The input is searched for rather than addressed through a selector: a
       value can contain quotation marks or backslashes. */
    const inputs = Array.from(
      groupRef.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [],
    );
    inputs.find((input) => input.value === next.value)?.focus();
    select(next);
  };

  /* The tab stop sits on the chosen option; where none is chosen, on the
     first selectable one. */
  const tabStop = (option: RadioChoice<T>): number | undefined => {
    /* Uncontrolled, no render follows a choice and a tab stop written here
       would stay on the initial option; the browser's own rule for a radio
       group follows the choice. */
    if (!controlled) return undefined;
    if (option.disabled || disabled) return -1;
    if (value === option.value) return 0;
    /* The first selectable one also where the controlled value points at a
       disabled option, or the group would be unreachable by keyboard. */
    const chosenReachable = selectable.some((o) => o.value === value);
    if (!chosenReachable && selectable[0]?.value === option.value) return 0;
    return -1;
  };

  /* On its own useId and not on the name: that can come from the caller, and
     neither it nor the value may go raw into an id `aria-describedby` reads. */
  const optionId = (option: RadioChoice<T>) => `${generatedName}-${idPart(option.value)}`;

  return {
    /** The group's root; merge it with a forwarded ref in the JSX, where a
        ref may be passed during render. */
    groupRef,
    /** Spread onto the group's root, before the caller's own attributes. */
    groupProps: {
      /* The surrounding field's id is carried by the group itself, so that
         `label htmlFor` finds it; on an option, a click on the field's label
         would choose that option. */
      id: field?.id,
      role: "radiogroup",
      /* Named by the field's label: its `htmlFor` alone names nothing here,
         since a group is not an element HTML can label. */
      "aria-labelledby": label === undefined ? field?.labelId : undefined,
      "aria-describedby": describedBy ?? field?.describedBy,
      "aria-required": field?.required || undefined,
      "aria-invalid": field?.invalid || undefined,
    } as const,
    /** The group's key handler; set it after the caller's attributes. */
    onKeyDown: handleKeyDown,
    optionId,
    /** The radio input of one possibility. */
    inputProps: (option: RadioChoice<T>, describedByOption?: string): InputHTMLAttributes<HTMLInputElement> => ({
      type: "radio",
      id: optionId(option),
      name: groupName,
      value: option.value,
      disabled: disabled || option.disabled,
      tabIndex: tabStop(option),
      "aria-describedby": describedByOption,
      ...(controlled
        ? { checked: value === option.value, onChange: () => select(option) }
        : { defaultChecked: defaultValue === option.value, onChange: () => select(option) }),
    }),
  };
}
