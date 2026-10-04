import { forwardRef, useId, useMemo, useRef, useState } from "react";
import type { ForwardedRef, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactElement } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { filterOptions, nextIndex, startIndex } from "../../lib/options";
import { Listbox, optionId } from "../../lib/listbox";
import styles from "./Combobox.module.css";
import { useControlSize } from "../../lib/controlSize";
import { extentStyle } from "../../lib/extent";
import { useWording } from "../../lib/language";
import { AngleGlyph, CrossGlyph } from "../../lib/glyphs";
import { announce, silence } from "../../lib/announce";

/** One possibility of a `Combobox`: the value it stands for and the label it
    is found by. */
export interface ComboboxOption<T extends string = string> {
  /** What comes back when this row is chosen. */
  value: T;
  /** What stands there - and what is filtered on. Text and not a node: what
      cannot be searched is something nobody finds in a combobox. */
  label: string;
  /** Shows the row but does not let it be chosen. */
  disabled?: boolean;
}

/** The props of `Combobox`. */
export interface ComboboxProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** The possibilities, in their natural order. Filtered while typing; never
      reordered. */
  options: readonly ComboboxOption<T>[];
  /** The chosen value; `null` means none. Always controlled - the field keeps
      no second state beside the caller's. */
  value: T | null;
  /** Runs on choosing and on clearing (`null`). Not while typing: what is
      typed is a search term and not yet a value. */
  onChange: (value: T | null) => void;
  /** What stands in the empty field. */
  placeholder?: string;
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** The width in characters - room for the typed text and the chosen
      option; the field adds its own padding, chevron and cross. Given, the
      field is that wide wherever it stands, and never wider than its place.
      Without it the field fills its place, and is 16 characters wide where the
      place asks - in a toolbar or a row. The panel is never narrower than the
      field. */
  chars?: number;
  /** Locks field and panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` - by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** Text shown for an empty search result. */
  emptyText?: string;
  /** Shows a cross on selection or input that clears field and selection. */
  clearable?: boolean;
}

/** A searchable select field (the combobox pattern with a listbox panel). */
export const Combobox = forwardRef(function Combobox<T extends string = string>(
  {
    options,
    value,
    onChange,
    placeholder,
    size: ownSize,
    chars,
    disabled = false,
    invalid,
    emptyText,
    clearable = false,
    className,
    style,
    onKeyDown,
    onKeyDownCapture,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...rest
  }: ComboboxProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const size = useControlSize(ownSize);
  const field = useFormField();
  const wording = useWording();
  const placeholderText = placeholder ?? wording.comboboxPlaceholder;
  const emptyLabel = emptyText ?? wording.noMatches;
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLSpanElement>(null);
  const listboxId = useId();

  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => filterOptions(options, query ?? ""), [options, query]);

  /* What VoiceOver does not read of an active descendant - how many options
     stand, and an option's state - the field says itself
     (listbox-announcements). The count on every opening, the pointer's too;
     the option moved onto only for the keys - the pointer sees it. */
  const sayCount = (count: number) =>
    announce(count === 0 ? emptyLabel : wording.optionCount(count), inputRef.current);

  const openPanel = () => {
    setActiveIndex(startIndex(filtered, value));
    setOpen(true);
    sayCount(filtered.length);
  };

  const closePanel = () => {
    // A count still waiting would be spoken after the choice or the Escape.
    silence();
    setOpen(false);
    setQuery(null);
  };

  const choose = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    closePanel();
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // An input method's own keys (Enter ends the composition) are not ours.
    if (event.nativeEvent.isComposing || event.defaultPrevented) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openPanel();
        return;
      }
      const index = nextIndex(activeIndex, filtered.length, event.key === "ArrowDown" ? 1 : -1);
      const next = filtered[index];
      if (next === undefined) return;
      setActiveIndex(index);
      announce(
        wording.optionActive(next.label, { selected: next.value === value, disabled: next.disabled }),
        inputRef.current,
      );
      return;
    }
    if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        event.preventDefault();
        choose(filtered[activeIndex]);
      }
      return;
    }
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closePanel();
    }
  };

  const display = query ?? selected?.label ?? "";

  return (
    <>
      {/* The caller's ref, class and rest go to the wrapper, the field's
          outermost element (P1 of core-passthrough); the field id from
          `FormField` stays on the input, and so do the caller's name and
          description, for a field without one. The caller's `onKeyDown` listens in
          the capture phase: the keys land on the input inside, and a handler
          on the wrapper would otherwise run after the field's own and could
          not prevent it (P3). */}
      <div
        ref={ref}
        className={cx(
          styles.wrapper,
          size === "sm" && styles.wrapperSm,
          clearable && styles.wrapperClearable,
          className,
        )}
        {...rest}
        /* The width in characters, and the caller's own style over it. */
        style={{ ...extentStyle(chars), ...style }}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event);
          onKeyDown?.(event);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          id={field?.id}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? optionId(listboxId, activeIndex) : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy ?? field?.describedBy}
          aria-required={field?.required || undefined}
          aria-invalid={isInvalid || undefined}
          placeholder={placeholderText}
          value={display}
          className={cx(styles.input, size === "sm" && styles.sm, clearable && styles.inputClearable, isInvalid && styles.invalid)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            if (!open) openPanel();
            // After the opening's count, which is the old query's: the later wins.
            sayCount(filterOptions(options, event.target.value).length);
          }}
          onClick={() => {
            if (!open) openPanel();
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => closePanel()}
        />
        {clearable && !disabled && (value !== null || (query ?? "") !== "") && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={wording.clearSelection}
            className={styles.clear}
            onMouseDown={(event) => event.preventDefault() /* focus stays in the field */}
            onClick={() => {
              onChange(null);
              setQuery(null);
              inputRef.current?.focus();
            }}
          >
            <CrossGlyph />
          </button>
        )}
        {/* The chevron is the pointer's handle on the panel; the keys have
            the arrows. Not a button: it is never a tab stop of its own. */}
        <span
          ref={toggleRef}
          className={styles.toggle}
          aria-hidden="true"
          onMouseDown={(event) => event.preventDefault() /* focus stays in the field */}
          onClick={() => {
            if (disabled) return;
            if (open) {
              closePanel();
            } else {
              inputRef.current?.focus();
              openPanel();
            }
          }}
        >
          <AngleGlyph className={styles.chevron} />
        </span>
      </div>
      <Listbox
        open={open}
        onClose={closePanel}
        anchorRef={inputRef}
        insideRefs={[toggleRef]}
        id={listboxId}
        ariaLabel={placeholderText}
        items={filtered.map((option) => ({ ...option, selected: option.value === value }))}
        activeIndex={activeIndex}
        onActivate={setActiveIndex}
        onChoose={(index) => choose(filtered[index]!)}
        emptyText={emptyLabel}
      />
    </>
  );
}) as <T extends string = string>(
  props: ComboboxProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
