import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, SelectHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import styles from "./Select.module.css";
import { useControlSize } from "../../lib/controlSize";
import { extentStyle } from "../../lib/extent";
import { useWording } from "../../lib/language";
import { AngleGlyph, CrossGlyph } from "../../lib/glyphs";
import { mergeRefs } from "../../lib/mergeRefs";
import { announce, silence } from "../../lib/announce";
import { Listbox, optionId } from "../../lib/listbox";
import type { ListboxItem } from "../../lib/listbox";

/* `size` is the controls' two heights here, as on every other field. The
   native `<select size>` - the number of rows a list box shows - is left out:
   this select is a dropdown, and it used to be called `selectSize` to spare
   that meaning, which made it the one field with another name (ADR-0041). */
/** The props of `Select`: a native select's attributes, with `size` meaning
    the control's height. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** `sm` for a toolbar and dense forms, `md` otherwise. Default: the size of a
      `ControlSizeProvider` around it, else `md`. */
  size?: "sm" | "md";
  /** The width in characters - room for the chosen option; the field adds
      its own padding, chevron and cross. Given, the field is that wide
      wherever it stands, and never wider than its place. Without it the field
      fills its place, and is 16 characters wide where the place asks - never
      as wide as its longest option. */
  chars?: number;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only necessary without `FormField`. */
  invalid?: boolean;
  /**
   * Shows a × once a selection has been made, which fades in on hover/focus
   * and empties the selection. Requires a controlled field (value) and
   * onClear; sensible for optional selects with a placeholder option.
   */
  clearable?: boolean;
  /** Called by the ×; resets the selection to the placeholder option. */
  onClear?: () => void;
}

/**
 * The select field. The `<select>` holds the value, the form and the keys;
 * under a mouse, a pen and the keyboard it opens the library's own list - the
 * Combobox's - and under a finger the system's picker (ADR-0043). The arrow is
 * drawn in CSS and therefore follows the theme tokens.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size: ownSize,
    chars,
    invalid,
    clearable = false,
    onClear,
    className,
    style,
    id,
    children,
    disabled,
    onPointerDown,
    onMouseDown,
    onKeyDown,
    onBlur,
    ...rest
  },
  ref,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const hasSelection = clearable && !rest.multiple && String(rest.value ?? "") !== "";

  /* `multiple` is a list box without a popup, and a disabled select opens
     nothing: both stay the system's. */
  const ownList = !rest.multiple && !disabled;
  const selectRef = useRef<HTMLSelectElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ListboxItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listName, setListName] = useState("");
  /* A select disabled with its list open forgets it, or the list came back
     on its own once the field was enabled again (found in review). */
  if (open && !ownList) setOpen(false);
  const pointerType = useRef("mouse");
  const typed = useRef({ text: "", at: 0 });

  const openList = () => {
    const element = selectRef.current;
    if (!element) return;
    const next = readItems(element);
    setItems(next);
    // The list is named as its field: a label, or the select's own aria-label.
    setListName(rest["aria-label"] ?? element.labels?.[0]?.textContent ?? wording.options);
    setActiveIndex(Math.max(0, element.selectedIndex));
    setOpen(true);
    announce(next.length === 0 ? wording.noMatches : wording.optionCount(next.length), element);
  };

  const closeList = () => {
    // A count still waiting would be spoken after the choice or the Escape.
    silence();
    setOpen(false);
  };

  /* The options as they stand: a caller's children may change while the
     list is open. */
  useEffect(() => {
    if (open && selectRef.current) setItems(readItems(selectRef.current));
  }, [open, children]);

  /* Choosing writes the select's value and fires its own events: React's
     onChange, a form's listeners and a reset all see what the system's list
     would have done. A controlled select is put back to its prop by React. */
  const choose = (index: number) => {
    const element = selectRef.current;
    if (!element || items[index] === undefined || items[index].disabled) return;
    closeList();
    element.focus();
    if (element.selectedIndex === index) return;
    element.selectedIndex = index;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const moveTo = (index: number) => {
    const item = items[index];
    if (item === undefined) return;
    setActiveIndex(index);
    announce(
      wording.optionActive(item.label, { selected: item.selected, disabled: item.disabled }),
      selectRef.current,
    );
  };

  /* Typing jumps to the next option that begins with what was typed in the
     last half second; the same letter again walks through those with it. */
  const typeTo = (key: string, timeStamp: number) => {
    const letter = key.toLowerCase();
    const text = timeStamp - typed.current.at < 500 ? typed.current.text + letter : letter;
    typed.current = { text, at: timeStamp };
    const repeat = [...text].every((each) => each === letter);
    const term = repeat ? letter : text;
    const from = repeat ? activeIndex + 1 : activeIndex;
    for (let offset = 0; offset < items.length; offset += 1) {
      const index = (from + offset) % items.length;
      if (items[index]!.label.toLowerCase().startsWith(term)) {
        moveTo(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSelectElement>) => {
    onKeyDown?.(event);
    if (!ownList || event.defaultPrevented || event.nativeEvent.isComposing) return;
    const { key } = event;
    if (!open) {
      if (OPENING_KEYS.has(key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (key === "Tab") {
      closeList();
      return;
    }
    // Escape is the popover's: it closes the list and keeps the focus here.
    if (key === "Escape") return;
    const last = items.length - 1;
    const step = STEPS[key];
    if (step !== undefined) {
      event.preventDefault();
      moveTo(Math.max(0, Math.min(last, activeIndex + step)));
    } else if (key === "Home" || key === "End") {
      event.preventDefault();
      moveTo(key === "Home" ? 0 : last);
    } else if (key === "Enter" || (key === " " && event.timeStamp - typed.current.at >= 500)) {
      event.preventDefault();
      choose(activeIndex);
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      typeTo(key, event.timeStamp);
    }
  };

  return (
    <span
      className={cx(
        styles.wrapper,
        size === "sm" && styles.wrapperSm,
        clearable && styles.wrapperClearable,
        className,
      )}
      style={{ ...extentStyle(chars), ...style }}
    >
      <select
        ref={mergeRefs(selectRef, ref)}
        id={id ?? field?.id}
        disabled={disabled}
        aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
        aria-required={field?.required || undefined}
        aria-invalid={isInvalid || undefined}
        aria-expanded={ownList ? open : undefined}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && items[activeIndex] ? optionId(listboxId, activeIndex) : undefined}
        className={cx(
          styles.select,
          size === "sm" && styles.sm,
          clearable && styles.selectClearable,
          isInvalid && styles.invalid,
        )}
        {...rest}
        /* The caller's handlers run first and can prevent the field's own
           (P3 of core-passthrough). */
        onPointerDown={(event) => {
          onPointerDown?.(event);
          pointerType.current = event.pointerType;
        }}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          /* A finger keeps the system's picker; a mouse and a pen take ours,
             and the press that would open the system's list opens it. */
          if (!ownList || event.defaultPrevented || event.button !== 0 || pointerType.current === "touch") return;
          event.preventDefault();
          selectRef.current?.focus();
          if (open) closeList();
          else openList();
        }}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          onBlur?.(event);
          if (open) closeList();
        }}
      >
        {children}
      </select>
      {hasSelection && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={wording.clearSelection}
          className={styles.clear}
          onMouseDown={(event) => event.preventDefault() /* focus stays on the select */}
          onClick={() => onClear?.()}
        >
          <CrossGlyph />
        </button>
      )}
      <AngleGlyph className={styles.chevron} />
      {ownList && (
        <Listbox
          open={open}
          onClose={closeList}
          anchorRef={selectRef}
          id={listboxId}
          ariaLabel={listName}
          items={items}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
          onChoose={choose}
          emptyText={wording.noMatches}
        />
      )}
    </span>
  );
});

/** The keys that open the system's list open ours (ADR-0043). Not Enter: a
    closed select passes it on, to a form or a table's grid that commits an
    edit with it, and the Combobox's Enter opens nothing either. */
const OPENING_KEYS = new Set(["ArrowDown", "ArrowUp", " ", "F4"]);

/** How far the keys move in the open list; Page Up and Down jump ten. */
const STEPS: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10 };

/** The list's options, read from the select - an <optgroup> as their group. */
function readItems(element: HTMLSelectElement): ListboxItem[] {
  return Array.from(element.options, (option) => {
    const group = option.parentElement instanceof HTMLOptGroupElement ? option.parentElement : null;
    return {
      label: option.label,
      disabled: option.disabled || (group?.disabled ?? false),
      // The empty value is the placeholder (the select's muted colour): it
      // stands in the list, never as the choice.
      selected: option.selected && option.value !== "",
      group: group?.label,
    };
  });
}
