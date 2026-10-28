import { useShapeWarning, areOptions, NONE } from "../../lib/useShapeWarning";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { filterOptions, nextIndex, startIndex } from "../../lib/options";
import { Listbox, optionId, WINDOW_ABOVE } from "../../lib/listbox";
import { mergeRefs } from "../../lib/mergeRefs";
import type { RefProp } from "../../lib/refProp";
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
  extends Omit<HTMLAttributes<HTMLInputElement>, "onChange" | "defaultValue">, RefProp<HTMLInputElement> {
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
      Without it the field fills its place, and is 20 characters wide where the
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
  /** Runs on every change of the typed text - the clearing cross's too, with
      `""` - and not on opening or closing. For an application that fetches the
      matches itself: debounce and cancelling stale requests are yours. */
  onSearch?: (text: string) => void;
  /** With `false` the field filters nothing: `options` are shown as given, in
      their order - the server's ranking. The active option returns to the first
      when they change while the panel is open.
      @default true */
  filter?: boolean;
  /** Results are on their way: the list shows the wording's "Loading" line
      where it would show the empty text, below any `options` given, and is
      `aria-busy`. */
  loading?: boolean;
}

/** A searchable select field (the combobox pattern with a listbox panel).
    The label of the chosen `value` is kept from the last `options` that held
    it, so a search that replaces the options does not empty the field - an
    initial `value` must stand among the first `options`. */
export function Combobox<T extends string = string>(
  {
    ref,
    options: optionsGiven,
    value,
    onChange,
    placeholder,
    size: ownSize,
    chars,
    disabled = false,
    invalid,
    emptyText,
    clearable = false,
    onSearch,
    filter = true,
    loading = false,
    className,
    style,
    id,
    onKeyDown,
    onClick,
    onBlur,
    ...rest
  }: ComboboxProps<T>,
) {
  const optionsOk = areOptions(optionsGiven);
  const options = optionsOk ? optionsGiven : NONE;
  useShapeWarning("Combobox", "options", !optionsOk, "an array of { value, label } objects, not strings");
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

  const filtered = useMemo(() => (filter ? filterOptions(options, query ?? "") : options), [options, query, filter]);

  // The label of the chosen value survives options that no longer hold it.
  const [kept, setKept] = useState<{ value: T; label: string } | null>(null);
  if (selected && (kept?.value !== selected.value || kept.label !== selected.label)) {
    setKept({ value: selected.value, label: selected.label });
  }
  const chosenLabel = selected?.label ?? (value !== null && kept?.value === value ? kept.label : "");

  /* What VoiceOver does not read of an active descendant - how many options
     stand, and an option's state - the field says itself. The count on every
     opening, the pointer's too; the option moved onto only for the keys. */
  const sayCount = (count: number) =>
    announce(count === 0 ? emptyLabel : wording.optionCount(count), inputRef.current);

  const openPanel = (quiet = false) => {
    setActiveIndex(startIndex(filtered, value));
    setOpen(true);
    if (!quiet) sayCount(filtered.length);
  };

  /* Options the application hands over: the count is theirs to announce (not
     the keystroke's), and the cursor starts again at the first. The count
     waits while results are on their way. */
  const seen = useRef({ options, loading });
  useEffect(() => {
    const before = seen.current;
    seen.current = { options, loading };
    const arrived = before.loading && !loading;
    if (filter || !open || (before.options === options && !arrived)) return;
    setActiveIndex(0);
    if (!loading) sayCount(options.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the options and loading are triggers
  }, [options, loading]);

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
    onKeyDown?.(event);
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
    /* Home and End are the caret's in a short list; in a windowed one the
       list is too long to walk, so they move its cursor to the ends. */
    if ((event.key === "Home" || event.key === "End") && open && filtered.length > WINDOW_ABOVE) {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : filtered.length - 1;
      setActiveIndex(index);
      const next = filtered[index]!;
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

  const display = query ?? chosenLabel;

  return (
    <>
      {/* The class and the style dress the wrapper; the ref and the rest
          belong to the input, the control that takes the focus (principle 1). */}
      <div
        className={cx(
          styles.wrapper,
          size === "sm" && styles.wrapperSm,
          clearable && styles.wrapperClearable,
          className,
        )}
        /* The width in characters, and the caller's own style over it. */
        style={{ ...extentStyle(chars), ...style }}
      >
        <input
          autoComplete="off"
          enterKeyHint="done"
          {...rest}
          ref={mergeRefs(ref, inputRef)}
          type="text"
          role="combobox"
          id={id ?? field?.id}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? optionId(listboxId, activeIndex) : undefined}
          aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
          aria-required={field?.required || undefined}
          aria-invalid={isInvalid || undefined}
          placeholder={placeholderText}
          value={display}
          className={cx(styles.input, size === "sm" && styles.sm, clearable && styles.inputClearable, isInvalid && styles.invalid)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            onSearch?.(event.target.value);
            if (!open) openPanel(!filter);
            // After the opening's count, which is the old query's: the later wins.
            if (filter) sayCount(filterOptions(options, event.target.value).length);
          }}
          onClick={(event) => {
            onClick?.(event);
            if (!open) openPanel();
          }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            onBlur?.(event);
            closePanel();
          }}
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
              onSearch?.("");
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
        busyText={loading ? wording.loading : undefined}
      />
    </>
  );
}
