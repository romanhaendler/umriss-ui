import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from "react";
import { cx } from "../../lib/cx";
import { mergeRefs } from "../../lib/mergeRefs";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";
import { useFormField } from "../FormField";
import * as Options from "../../lib/options";
import { Popover } from "../Popover";
import { WINDOW_ABOVE } from "../../lib/listbox";
import { useVirtual } from "../../lib/useVirtual";
import type { RefProp } from "../../lib/refProp";
import styles from "./MultiSelect.module.css";
import { useControlSize } from "../../lib/controlSize";
import { extentStyle } from "../../lib/extent";
import { useWording } from "../../lib/language";
import { AngleGlyph, CrossGlyph } from "../../lib/glyphs";
import { announce } from "../../lib/announce";

/** One possibility of a `MultiSelect`: the value it stands for and its label. */
export interface MultiSelectOption<T extends string = string> {
  /** What stands in `value` when this row is ticked. */
  value: T;
  /** What is shown – in the panel and as a chip in the field. */
  label: string;
  /** Shows the row but does not let it be ticked. A value already chosen
      stays chosen: disabled means "do not change", not "gone". */
  disabled?: boolean;
}

/** The props of `MultiSelect`. */
export interface MultiSelectProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onChange" | "defaultValue">, RefProp<HTMLButtonElement> {
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
  /** `sm` for a toolbar and dense forms, `md` otherwise.
      @default the size of a `ControlSizeProvider` around it, else `"md"` */
  size?: "sm" | "md";
  /** The width in characters - room for the chips; the field adds its own
      padding and chevron. Given, the field is that wide wherever it stands,
      and never wider than its place. Without it the field fills its place,
      and is 20 characters wide where the place asks - in a toolbar or a row,
      room for two short chips and the counter. Either way, choosing and removing
      values never moves it: the chips that do not fit stand as "+N". */
  chars?: number;
  /** Locks field and panel. */
  disabled?: boolean;
  /** Marks the field as invalid. `FormField` sets it itself as soon as it
      carries an `error` – by hand only necessary without `FormField`. */
  invalid?: boolean;
  /** Shows a cross beside the chips that empties the selection, as "Select
      none" does: a chosen value whose option is disabled stays. The field
      keeps room for it, chosen values or none, so that it never moves. */
  clearable?: boolean;
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
export function MultiSelect<T extends string = string>(
  {
    ref,
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyText,
    size: ownSize,
    chars,
    disabled = false,
    invalid,
    clearable = false,
    className,
    style,
    id,
    onClick,
    ...rest
  }: MultiSelectProps<T>,
) {
  const size = useControlSize(ownSize);
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
  /* The pointer of the gesture last made on the field, or "key" for a key -
     what decides where the focus goes when the panel opens. */
  const pointerType = useRef("mouse");
  const touchOpened = useRef(false);
  /* The option the keys or a touch opening want focused in a windowed list:
     the list draws it, brings it into view and takes the focus there. */
  const [wanted, setWanted] = useState<number | null>(null);

  /* What the list says through the shared announcer:
     how many options the search and the scope leave - typing in the search
     otherwise gives no word of it - and what a gesture away from the
     checkboxes added or removed. A ticked checkbox with the focus says
     "checked" itself and is left to do so. */
  const labelOf = (optionValue: T) => options.find((option) => option.value === optionValue)?.label ?? optionValue;

  /** `inScope` is the list before the search: the snapshot of the chosen
      while the scope holds, the chosen now when it is entered. */
  const sayCount = (targetScope: Scope, term: string, inScope: readonly MultiSelectOption<T>[]) => {
    const count = Options.filterOptions(inScope, term).length;
    announce(
      count > 0
        ? wording.optionCount(count)
        : targetScope === "selected" && inScope.length === 0
          ? wording.nothingSelected
          : emptyMessage,
      fieldRef.current,
    );
  };

  const chosenNow = (targetScope: Scope) =>
    targetScope === "selected" ? options.filter((option) => value.includes(option.value)) : options;

  const sayRemoved = (optionValue: T) => announce(wording.optionRemoved(labelOf(optionValue)), fieldRef.current);

  const openPanel = (targetScope: Scope = "all") => {
    touchOpened.current = pointerType.current === "touch";
    setScope(targetScope);
    setSelectedSnapshot(new Set(value));
    setSearch("");
    setOpen(true);
    const shown = chosenNow(targetScope);
    // A long list is drawn through a window: the list takes the focus to the option
    if (touchOpened.current && shown.length > WINDOW_ABOVE) {
      const first = shown.findIndex((option) => !option.disabled);
      setWanted(first === -1 ? null : first);
    }
    sayCount(targetScope, "", shown);
  };

  const switchScope = (target: Scope) => {
    setScope(target);
    if (target === "selected") {
      setSelectedSnapshot(new Set(value));
    }
    searchRef.current?.focus();
    sayCount(target, search, chosenNow(target));
  };

  /* Into the search as soon as the panel stands. An effect on `open` runs
     before the popover has found its portal target, so the first opening
     would leave the focus on the trigger. A touch takes no search, and so no
     keyboard over the list: the first enabled option takes the focus, or
     the trigger keeps it. */
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    if (touchOpened.current && !listRef.current?.dataset.windowed) {
      listRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
    } else {
      searchRef.current?.focus();
    }
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
    sayRemoved(optionValue);
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
      if (windowed) setWanted(enabled[0] ?? null);
      else optionInputs()[0]?.focus();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const first = filtered.find((option) => !option.disabled);
      if (!first) return;
      toggle(first.value);
      // `value` is still the one before the toggle: it comes back as a prop.
      announce(
        (value.includes(first.value) ? wording.optionRemoved : wording.optionAdded)(first.label),
        fieldRef.current,
      );
    }
  };

  /* The indices of the options a key can reach: all but the disabled. */
  const enabled = filtered.flatMap((option, index) => (option.disabled ? [] : [index]));
  const windowed = filtered.length > WINDOW_ABOVE;

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const inputs = optionInputs();
    const row = document.activeElement?.closest<HTMLElement>("[data-index]");
    const at = windowed ? enabled.indexOf(Number(row?.dataset.index)) : inputs.findIndex((input) => input === document.activeElement);
    if (at === -1) return;
    event.preventDefault();
    const last = enabled.length - 1;
    if (event.key === "ArrowUp" && at === 0) {
      searchRef.current?.focus();
      return;
    }
    const to = { ArrowDown: Math.min(at + 1, last), ArrowUp: at - 1, Home: 0, End: last }[event.key]!;
    if (windowed) setWanted(enabled[to]!);
    else inputs[to]?.focus();
  };

  /* ---- Roving tabindex in the field: only the main button lies in the tab
     flow; arrow left/right travels across chips and counter, Delete/Backspace
     deletes the focused chip. ---- */
  const navElements = () =>
    Array.from(fieldRef.current?.querySelectorAll<HTMLElement>("[data-nav]") ?? []);

  const handleFieldKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
        sayRemoved(value[value.length - 1]!);
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
    /* The gap from the stylesheet, not a number kept in step with it. */
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

  /* The cross empties what "Select none" would: a chosen value whose option
     is disabled stays. */
  const cleared = Options.selectNoneOf(value, Options.selectableValues(options));

  const chipRemoveX = <CrossGlyph size={8} />;

  return (
    <>
      {/* The class and the style dress the field, the element that carries
          the ring; the ref and the rest belong to the button that takes the
          focus (principle 1). Its key handler runs before the field's own and
          can prevent them. */}
      <div
        ref={fieldRef}
        className={cx(styles.field, size === "sm" && styles.sm, clearable && styles.fieldClearable, isInvalid && styles.invalid, disabled && styles.fieldDisabled, className)}
        /* The width in characters, and the caller's own style over it. */
        style={{ ...extentStyle(chars), ...style }}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
          } else {
            openPanel("all");
          }
        }}
        onPointerDown={(event) => {
          pointerType.current = event.pointerType;
        }}
        onKeyDown={(event) => {
          pointerType.current = "key";
          handleFieldKeyDown(event);
        }}
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
        {clearable && !disabled && cleared.length < value.length && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={wording.clearSelection}
            className={styles.clear}
            onMouseDown={(event) => event.preventDefault() /* focus stays where it is */}
            onClick={(event) => {
              event.stopPropagation();
              onChange(cleared);
              mainRef.current?.focus();
            }}
          >
            <CrossGlyph />
          </button>
        )}
        <button
          {...rest}
          ref={mergeRefs(mainRef, ref)}
          type="button"
          id={id ?? field?.id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-describedby={rest["aria-describedby"] ?? field?.describedBy}
          aria-invalid={isInvalid || undefined}
          className={cx(styles.main, value.length === 0 && styles.mainEmpty)}
          onClick={(event) => {
            onClick?.(event);
            event.stopPropagation();
            if (event.defaultPrevented) return;
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
        className={styles.panel}
      >
          {/* The role sits here, not on the popover: a dialog the popover
              names would take the focus for itself on opening. */}
          <div ref={attachPanel} role="dialog" aria-label={placeholderText} id={panelId}>
              <Input
                ref={searchRef}
                size="sm"
                value={search}
                placeholder={searchPlaceholderText}
                aria-label={wording.searchOptions}
                autoComplete="off"
                enterKeyHint="done"
                clearable
                onClear={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                onChange={(event) => {
                  setSearch(event.target.value);
                  sayCount(scope, event.target.value, base);
                }}
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
              {filtered.length === 0 ? (
                <div ref={listRef} className={styles.list} role="group" aria-label={wording.options} onKeyDown={handleListKeyDown}>
                  <div className={styles.empty}>
                    {scope === "selected" && base.length === 0 ? wording.nothingSelected : emptyMessage}
                  </div>
                </div>
              ) : windowed ? (
                <WindowedChecks
                  listRef={listRef}
                  count={filtered.length}
                  wanted={wanted}
                  onWanted={() => setWanted(null)}
                  onKeyDown={handleListKeyDown}
                  row={(index) => {
                    const option = filtered[index]!;
                    return (
                      <div key={option.value} className={styles.row} data-row="" data-index={index}>
                        <Checkbox
                          className={styles.option}
                          label={option.label}
                          checked={value.includes(option.value)}
                          disabled={option.disabled}
                          onChange={() => toggle(option.value)}
                        />
                      </div>
                    );
                  }}
                />
              ) : (
                <div ref={listRef} className={styles.list} role="group" aria-label={wording.options} onKeyDown={handleListKeyDown}>
                  {filtered.map((option) => (
                    <Checkbox
                      key={option.value}
                      className={styles.option}
                      label={option.label}
                      checked={value.includes(option.value)}
                      disabled={option.disabled}
                      onChange={() => toggle(option.value)}
                    />
                  ))}
                </div>
              )}
          </div>
      </Popover>
    </>
  );
}

interface WindowedChecksProps {
  listRef: RefObject<HTMLDivElement | null>;
  count: number;
  /** An option to bring into view and focus; `onWanted` says it was done. */
  wanted: number | null;
  onWanted: () => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  row: (index: number) => ReactNode;
}

/* The list of a long MultiSelect: the checkboxes in view and filler rows for
   the rest. The option holding the focus, or about to, is always drawn, so a
   scroll never drops the focused element. Mounted inside the panel, so the
   hook finds the list when it measures. */
function WindowedChecks({ listRef, count, wanted, onWanted, onKeyDown, row }: WindowedChecksProps) {
  const { scrollRef, from, to, fillerBefore, fillerAfter, showRow, onScroll } = useVirtual(count, { rowHeight: 36 });
  const wording = useWording();
  const [focused, setFocused] = useState<number | null>(null);
  const extra = wanted ?? focused;

  useEffect(() => {
    if (wanted === null) return;
    showRow(wanted);
    listRef.current?.querySelector<HTMLInputElement>(`[data-index="${wanted}"] input`)?.focus();
    onWanted();
  }, [wanted, showRow, listRef, onWanted]);

  const rowHeight = from > 0 ? fillerBefore / from : to < count ? fillerAfter / (count - to) : 36;
  // The drawn stretches in order: the window, and the focused option beside it
  const stretches: Array<[number, number]> = [[from, to]];
  if (extra !== null && extra < count && (extra < from || extra >= to)) {
    stretches.push([extra, extra + 1]);
    stretches.sort((a, b) => a[0] - b[0]);
  }
  const content: ReactNode[] = [];
  let next = 0;
  const filler = (rows: number, key: string) =>
    rows > 0 && content.push(<div key={key} aria-hidden="true" style={{ height: rows * rowHeight, flex: "none" }} />);
  for (const [a, b] of stretches) {
    filler(a - next, `filler-${a}`);
    for (let index = a; index < b; index += 1) content.push(row(index));
    next = b;
  }
  filler(count - next, "filler-end");

  return (
    <div
      ref={(element) => {
        scrollRef.current = element;
        listRef.current = element;
      }}
      data-windowed=""
      className={styles.list}
      role="group"
      aria-label={wording.options}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
      onFocus={(event) => {
        const index = event.target.closest<HTMLElement>("[data-index]")?.dataset.index;
        setFocused(index === undefined ? null : Number(index));
      }}
      onBlur={() => setFocused(null)}
    >
      {content}
    </div>
  );
}
