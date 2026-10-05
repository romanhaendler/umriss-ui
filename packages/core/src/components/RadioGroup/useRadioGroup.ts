/* The mechanics of a radio group, apart from how it is drawn.

   Two components choose one out of a few with them: the radio group, as dots
   with a line of explanation, and the segmented control, as one field with a
   segment for each. What a screen reader hears, where the tab stop sits and
   how the arrow keys move must be the same in both - so it stands once, here,
   and each draws around it (field-row-alignment 03).

   Operation: exactly one tab stop for the whole group. The arrow keys move
   *and* choose - that is what the pattern for radio groups demands -, skip
   over whatever is disabled and wrap around at the ends.

   The arrow key navigation is built here and not fetched from a shared
   helper: there is none (yet), and introducing one in the same change would
   mean touching the calendar, the menu, the tabs, the combobox and the
   MultiSelect. Not exported from the package. */

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
}: UseRadioGroupOptions<T>) {
  const field = useFormField();
  const generatedName = useId();
  const groupName = name ?? field?.id ?? generatedName;
  const groupRef = useRef<HTMLDivElement>(null);

  /* Uncontrolled, it is led by the DOM state of the inputs: the browser
     holds the choice of a radio group anyway, and a second state beside it
     would be a source of contradictions. */
  const controlled = value !== undefined;

  const selectable = options.filter((option) => !option.disabled && !disabled);

  const select = (next: RadioChoice<T>) => {
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
  const tabStop = (option: RadioChoice<T>): number | undefined => {
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

  /* On its own useId and not on the name: that can come from the caller,
     and neither it nor the value may go raw into an id that
     `aria-describedby` reads (library-audit 04). */
  const optionId = (option: RadioChoice<T>) => `${generatedName}-${idPart(option.value)}`;

  return {
    /** The group's root; merge it with a forwarded ref in the JSX, where a
        ref may be passed during render. */
    groupRef,
    /** Spread onto the group's root, before the caller's own attributes. */
    groupProps: {
      /* The surrounding field's id is carried by the group itself, so that
         `label htmlFor` does not point into the void. Putting it on one of
         the options would be worse: a click on the field's label would then
         choose the first option. */
      id: field?.id,
      role: "radiogroup",
      /* Named by the field's label: its `htmlFor` alone names nothing here,
         since a group is not an element HTML can label. */
      "aria-labelledby": field?.labelId,
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
