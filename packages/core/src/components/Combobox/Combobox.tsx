import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../lib/cx";
import { useFormField } from "../FormField";
import { filterOptions, nextIndex, startIndex } from "../../lib/options";
import { Popover } from "../Popover";
import styles from "./Combobox.module.css";
import { useWording } from "../../lib/language";
import { CrossGlyph } from "../../lib/glyphs";

export interface ComboboxOption<T extends string = string> {
  /** What comes back when this row is chosen. */
  value: T;
  /** What stands there - and what is filtered on. Text and not a node: what
      cannot be searched is something nobody finds in a combobox. */
  label: string;
  /** Shows the row but does not let it be chosen. */
  disabled?: boolean;
}

export interface ComboboxProps<T extends string = string> {
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
export function Combobox<T extends string = string>({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  invalid,
  emptyText,
  clearable = false,
}: ComboboxProps<T>) {
  const field = useFormField();
  const wording = useWording();
  const placeholderText = placeholder ?? wording.comboboxPlaceholder;
  const emptyLabel = emptyText ?? wording.noMatches;
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = useMemo(() => options.find((option) => option.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => filterOptions(options, query ?? ""), [options, query]);

  const openPanel = () => {
    setActiveIndex(startIndex(filtered, value));
    setOpen(true);
  };

  const closePanel = () => {
    setOpen(false);
    setQuery(null);
  };

  const choose = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    closePanel();
    inputRef.current?.focus();
  };

  // Keep the active option in view
  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // An input method's own keys (Enter ends the composition) are not ours.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openPanel();
        return;
      }
      if (filtered.length === 0) return;
      setActiveIndex((index) => nextIndex(index, filtered.length, event.key === "ArrowDown" ? 1 : -1));
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
      <div className={styles.wrapper}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          id={field?.id}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${listboxId}-${activeIndex}` : undefined}
          aria-describedby={field?.describedBy}
          aria-required={field?.required || undefined}
          aria-invalid={isInvalid || undefined}
          placeholder={placeholderText}
          value={display}
          className={cx(styles.input, clearable && styles.inputClearable, isInvalid && styles.invalid)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            if (!open) openPanel();
          }}
          onClick={() => {
            if (!open) openPanel();
          }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            if (panelRef.current?.contains(event.relatedTarget as Node)) return;
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
              inputRef.current?.focus();
            }}
          >
            <CrossGlyph />
          </button>
        )}
        <span className={styles.chevron} aria-hidden="true" />
      </div>
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) closePanel();
        }}
        anchorRef={inputRef}
        width="anchor"
        className={styles.panel}
      >
          <div ref={panelRef} role="listbox" id={listboxId} className={styles.list} aria-label={placeholderText}>
              {filtered.length === 0 ? (
                <div className={styles.empty}>{emptyLabel}</div>
              ) : (
                filtered.map((option, index) => (
                  <div
                    key={option.value}
                    id={`${listboxId}-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled || undefined}
                    className={cx(
                      styles.option,
                      index === activeIndex && styles.active,
                      option.value === value && styles.selected,
                      option.disabled && styles.optionDisabled,
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.value === value && (
                      <svg viewBox="0 0 10 8" width="10" height="8" aria-hidden="true">
                        <path d="M1 4l2.5 2.5L9 1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))
              )}
          </div>
      </Popover>
    </>
  );
}
