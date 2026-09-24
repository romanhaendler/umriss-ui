import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ForwardedRef, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactElement } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";
import { useFormField } from "../FormField";
import * as Options from "../../lib/options";
import { Popover } from "../Popover";
import styles from "./MultiSelect.module.css";
import { useWording } from "../../lib/language";
import { AngleGlyph, CrossGlyph } from "../../lib/glyphs";

export interface MultiSelectOption<T extends string = string> {
  /** What stands in `value` when this row is ticked. */
  value: T;
  /** What is shown – in the panel and as a chip in the field. */
  label: string;
  /** Shows the row but does not let it be ticked. A value already chosen
      stays chosen: disabled means "do not change", not "gone". */
  disabled?: boolean;
}

export interface MultiSelectProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** The possibilities, in their natural order. The list never re-sorts –
      not even in the "selected" scope. */
  options: readonly MultiSelectOption<T>[];
  /** The chosen values. Always controlled. */
  value: readonly T[];
  /** Runs on every change of the selection, with the complete new list –
      not with the one value that moved. */
  onChange: (value: T[]) => void;
  /** What stands in the empty field. */
  placeholder?: string;
  /** What stands in the panel's search field. */
  searchPlaceholder?: string;
  /** Text when the search finds nothing. */
  emptyText?: string;
  /** Locks field and panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only necessary without `FormField`. */
  invalid?: boolean;
}

type Scope = "all" | "selected";

/**
 * Multiple selection. The trigger always stays on one line and measures the
 * room: as many chips as fit, the rest as a "+N" counter. Chips are removed by
 * click (hover shows the ×), Backspace deletes the most recently chosen,
 * arrow keys travel across the chips (roving tabindex). The counter opens the
 * panel directly in the "selected" scope.
 *
 * In the panel: search field, scope switch "All | Selected (N)"
 * (the list always keeps its natural order – no re-sorting),
 * quality-of-life actions on the filtered set of the active scope. In the
 * "selected" scope, rows that have been unticked stay visible until the scope
 * changes, so that nothing jumps away from under the mouse pointer.
 */
export const MultiSelect = forwardRef(function MultiSelect<T extends string = string>(
  {
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyText,
    disabled = false,
    invalid,
    className,
    onClick,
    onKeyDown,
    ...rest
  }: MultiSelectProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const field = useFormField();
  const wording = useWording();
  const placeholderText = placeholder ?? wording.multiSelectPlaceholder;
  const searchPlaceholderText = searchPlaceholder ?? wording.multiSelectSearchPlaceholder;
  const emptyMessage = emptyText ?? wording.noMatches;
  const isInvalid = invalid ?? field?.invalid ?? false;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [selectedSnapshot, setSelectedSnapshot] = useState<ReadonlySet<T>>(new Set());

  const fieldRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const openPanel = (targetScope: Scope = "all") => {
    setScope(targetScope);
    setSelectedSnapshot(new Set(value));
    setSearch("");
    setOpen(true);
  };

  const switchScope = (target: Scope) => {
    setScope(target);
    if (target === "selected") {
      setSelectedSnapshot(new Set(value));
    }
    searchRef.current?.focus();
  };

  /* Into the search as soon as the panel stands. An effect on `open` ran
     before the popover had found its portal target, so the first opening
     left the focus on the trigger. */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    if (node) searchRef.current?.focus();
  }, []);

  /* ---- Base of the list: natural order, never re-sorted ---- */
  const base = useMemo(
    () =>
      scope === "selected"
        ? options.filter((option) => selectedSnapshot.has(option.value))
        : options,
    [options, scope, selectedSnapshot],
  );

  const filtered = useMemo(() => Options.filterOptions(base, search), [base, search]);

  const toggle = (optionValue: T) => {
    onChange(
      value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue],
    );
  };

  const remove = (optionValue: T) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const filteredValues = useMemo(() => Options.selectableValues(filtered), [filtered]);

  const selectAllOf = () => onChange(Options.selectAllOf(value, filteredValues));
  const selectNoneOf = () => onChange(Options.selectNoneOf(value, filteredValues));
  const invertSelection = () => onChange(Options.invertSelection(value, filteredValues));

  /* ---- Keyboard in the panel ---- */
  const optionInputs = () =>
    Array.from(listRef.current?.querySelectorAll<HTMLInputElement>("input:not(:disabled)") ?? []);

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    // An input method's own keys (Enter ends the composition) are not ours.
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      optionInputs()[0]?.focus();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const first = filtered.find((option) => !option.disabled);
      if (first) toggle(first.value);
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const inputs = optionInputs();
    const index = inputs.findIndex((input) => input === document.activeElement);
    if (index === -1) return;
    event.preventDefault();
    if (event.key === "ArrowDown") inputs[Math.min(index + 1, inputs.length - 1)]?.focus();
    if (event.key === "ArrowUp") {
      if (index === 0) {
        searchRef.current?.focus();
      } else {
        inputs[index - 1]?.focus();
      }
    }
    if (event.key === "Home") inputs[0]?.focus();
    if (event.key === "End") inputs[inputs.length - 1]?.focus();
  };

  /* ---- Roving tabindex in the field: only the main button lies in the tab
     flow; arrow left/right travels across chips and counter, Delete/Backspace
     deletes the focused chip. ---- */
  const navElements = () =>
    Array.from(fieldRef.current?.querySelectorAll<HTMLElement>("[data-nav]") ?? []);

  const handleFieldKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    const target = event.target as HTMLElement;
    const navs = navElements();

    if (target === mainRef.current) {
      if (event.key === "ArrowLeft" && navs.length > 0) {
        event.preventDefault();
        navs[navs.length - 1]?.focus();
      } else if (event.key === "Backspace" && value.length > 0) {
        event.preventDefault();
        onChange(value.slice(0, -1));
      }
      return;
    }

    const index = navs.indexOf(target);
    if (index === -1) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      (navs[index + 1] ?? mainRef.current)?.focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      navs[index - 1]?.focus();
    } else if ((event.key === "Delete" || event.key === "Backspace") && target.dataset.value) {
      event.preventDefault();
      remove(target.dataset.value as T);
      requestAnimationFrame(() => {
        const next = navElements();
        (next[Math.min(index, next.length - 1)] ?? mainRef.current)?.focus();
      });
    }
  };

  /* ---- Intelligent chip display: as many chips as really fit ---- */
  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );
  const [visibleChips, setVisibleChips] = useState(1);
  const summaryRef = useRef<HTMLSpanElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const measure = useCallback(() => {
    const container = summaryRef.current;
    const measureRow = measureRef.current;
    if (!container || !measureRow) return;
    const children = Array.from(measureRow.children) as HTMLElement[];
    if (children.length < 2) {
      setVisibleChips(1);
      return;
    }
    const counterWidth = children[children.length - 1]?.offsetWidth ?? 0;
    const chipWidths = children.slice(0, -1).map((child) => child.offsetWidth);
    const available = container.clientWidth;
    /* The gap from the stylesheet, the way the dock reads its own. Here stood
       8, with the token as a comment beside it (library-audit 07). */
    const GAP = Number.parseFloat(getComputedStyle(measureRow).columnGap) || 0;
    let fitting = 1;
    for (let k = chipWidths.length; k >= 1; k -= 1) {
      let width = (k - 1) * GAP;
      for (let i = 0; i < k; i += 1) width += chipWidths[i] ?? 0;
      if (k < chipWidths.length) width += GAP + counterWidth;
      if (width <= available) {
        fitting = k;
        break;
      }
    }
    setVisibleChips(fitting);
  }, []);

  // Measure after EVERY commit – covers deleting, adding and label changes
  // without a gap. Cheap (a few offsetWidth reads); sets the count only when
  // it changes, hence no render loop.
  useLayoutEffect(() => {
    measure();
  });

  useEffect(() => {
    const fieldEl = fieldRef.current;
    if (!fieldEl) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(fieldEl);
    return () => observer.disconnect();
  }, [measure]);

  const overflowCount = value.length - visibleChips;

  const chipRemoveX = <CrossGlyph size={8} />;

  return (
    <>
      {/* The caller's ref, class and rest go to the field, the element that
          carries the ring (P1 of core-passthrough); its handlers run before
          the field's own and can prevent them (P3). */}
      <div
        ref={mergeRefs(fieldRef, ref)}
        className={cx(styles.field, isInvalid && styles.invalid, disabled && styles.fieldDisabled, className)}
        {...rest}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          if (open) {
            setOpen(false);
          } else {
            openPanel("all");
          }
        }}
        onKeyDown={handleFieldKeyDown}
      >
        {value.length > 0 && (
          <>
            <span ref={summaryRef} className={styles.summary}>
              {selectedOptions.slice(0, visibleChips).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-nav
                  data-value={option.value}
                  tabIndex={-1}
                  disabled={disabled}
                  className={styles.chip}
                  aria-label={wording.removeSelectedValue(option.label)}
                  onClick={(event) => {
                    event.stopPropagation();
                    remove(option.value);
                  }}
                >
                  <span className={styles.chipLabel}>{option.label}</span>
                  <span className={styles.chipX}>{chipRemoveX}</span>
                </button>
              ))}
              {overflowCount > 0 && (
                <button
                  type="button"
                  data-nav
                  tabIndex={-1}
                  disabled={disabled}
                  className={styles.counter}
                  aria-label={wording.manageMoreSelected(value.length)}
                  onClick={(event) => {
                    event.stopPropagation();
                    openPanel("selected");
                  }}
                >
                  +{overflowCount}
                </button>
              )}
            </span>
            <span ref={measureRef} className={cx(styles.summary, styles.measure)} aria-hidden="true">
              {selectedOptions.map((option) => (
                <span key={option.value} className={styles.chip}>
                  <span className={styles.chipLabel}>{option.label}</span>
                  <span className={styles.chipX}>{chipRemoveX}</span>
                </span>
              ))}
              <span className={styles.counter}>+{value.length}</span>
            </span>
          </>
        )}
        <button
          ref={mainRef}
          type="button"
          id={field?.id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-describedby={field?.describedBy}
          aria-invalid={isInvalid || undefined}
          className={cx(styles.main, value.length === 0 && styles.mainEmpty)}
          onClick={(event) => {
            event.stopPropagation();
            if (open) {
              setOpen(false);
            } else {
              openPanel("all");
            }
          }}
        >
          {value.length === 0 && <span className={styles.placeholder}>{placeholderText}</span>}
          <AngleGlyph className={styles.chevron} />
        </button>
      </div>
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(false);
        }}
        anchorRef={fieldRef}
        focusRef={mainRef}
        width="anchor"
        minWidth={260}
        role="dialog"
        ariaLabel={placeholderText}
        id={panelId}
        className={styles.panel}
      >
          <div ref={attachPanel}>
              <Input
                ref={searchRef}
                size="sm"
                value={search}
                placeholder={searchPlaceholderText}
                aria-label={wording.searchOptions}
                clearable
                onClear={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div className={styles.scopes} role="group" aria-label={wording.optionScope}>
                <button
                  type="button"
                  className={cx(styles.scope, scope === "all" && styles.scopeActive)}
                  aria-pressed={scope === "all"}
                  onClick={() => switchScope("all")}
                >
                  {wording.optionScopeAll}
                </button>
                <button
                  type="button"
                  className={cx(styles.scope, scope === "selected" && styles.scopeActive)}
                  aria-pressed={scope === "selected"}
                  onClick={() => switchScope("selected")}
                >
                  {wording.optionScopeSelected(value.length)}
                </button>
              </div>
              <div className={styles.qol}>
                <div className={styles.qolButtons}>
                  <Button size="sm" variant="ghost" disabled={filteredValues.length === 0} onClick={selectAllOf}>
                    {wording.selectAll}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={filteredValues.length === 0} onClick={selectNoneOf}>
                    {wording.selectNone}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={filteredValues.length === 0} onClick={invertSelection}>
                    {wording.invertSelection}
                  </Button>
                </div>
                <span className={styles.count}>
                  {wording.multiSelectSummary(value.length, options.length)}
                </span>
              </div>
              <div
                ref={listRef}
                className={styles.list}
                role="group"
                aria-label={wording.options}
                onKeyDown={handleListKeyDown}
              >
                {filtered.length === 0 ? (
                  <div className={styles.empty}>
                    {scope === "selected" && base.length === 0 ? wording.nothingSelected : emptyMessage}
                  </div>
                ) : (
                  filtered.map((option) => (
                    <Checkbox
                      key={option.value}
                      className={styles.option}
                      label={option.label}
                      checked={value.includes(option.value)}
                      disabled={option.disabled}
                      onChange={() => toggle(option.value)}
                    />
                  ))
                )}
              </div>
          </div>
      </Popover>
    </>  );
}) as <T extends string = string>(
  props: MultiSelectProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
