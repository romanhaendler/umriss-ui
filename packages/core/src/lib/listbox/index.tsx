/* The one list of options that opens under a field (ADR-0043): the
   Combobox's, and the Select's under a pointer and the keys. It draws the
   popover, the options, the list's cursor and the check; the field keeps the
   focus, the keys and the value, and tells the list which option is active. */

import { useCallback, useEffect, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { cx } from "../cx";
import { useVirtual } from "../useVirtual";
import { Popover } from "../../components/Popover";
import styles from "./Listbox.module.css";

export interface ListboxItem {
  label: string;
  disabled?: boolean;
  selected?: boolean;
  /** The label of the `<optgroup>` the option stands in; consecutive options
      with the same group stand under one heading. */
  group?: string;
}

export interface ListboxProps {
  open: boolean;
  /** Outside click, Escape, scrolling away: the popover's wishes. */
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** Elements whose press is not an outside click (a chevron, a cross). */
  insideRefs?: ReadonlyArray<RefObject<HTMLElement | null>>;
  /** The listbox's id; option `i` is `${id}-${i}`. */
  id: string;
  ariaLabel: string;
  items: readonly ListboxItem[];
  activeIndex: number;
  /** The pointer moved onto an option that is not disabled. */
  onActivate: (index: number) => void;
  onChoose: (index: number) => void;
  /** What stands in the list when it has no options. */
  emptyText: ReactNode;
  /** A line that stands below the options - or in place of the empty text -
      and marks the list busy: "Loading" while results are on their way. */
  busyText?: ReactNode;
}

/** A list of more than this many options is drawn through a window. */
export const WINDOW_ABOVE = 500;

/** The id of option `index` in the listbox `id` - for `aria-activedescendant`. */
export const optionId = (id: string, index: number) => `${id}-${index}`;

export function Listbox({
  open,
  onClose,
  anchorRef,
  insideRefs,
  id,
  ariaLabel,
  items,
  activeIndex,
  onActivate,
  onChoose,
  emptyText,
  busyText,
}: ListboxProps) {
  /* The list's element as state: on the first opening the popover finds its
     portal only after this render, and the list arrives a render later than
     `open` - its arrival must show the active option too. */
  const [list, setList] = useState<HTMLDivElement | null>(null);

  /* A grouped list is drawn whole: the window covers a flat list only. */
  const windowed = items.length > WINDOW_ABOVE && !items.some((item) => item.group !== undefined);

  // Keep the active option in view (a windowed list does it through its hook)
  useEffect(() => {
    if (!open || windowed) return;
    list?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, list, windowed]);

  /* A press anywhere in the panel keeps the focus in the field: a group's
     label, the padding and the scrollbar closed the list on the field's blur. */
  useEffect(() => {
    const panel = list?.parentElement;
    if (!panel) return;
    const keep = (event: MouseEvent) => event.preventDefault();
    panel.addEventListener("mousedown", keep);
    return () => panel.removeEventListener("mousedown", keep);
  }, [list]);

  const option = (item: ListboxItem, index: number) => (
    <div
      key={index}
      id={optionId(id, index)}
      data-index={index}
      data-row={windowed ? "" : undefined}
      aria-setsize={windowed ? items.length : undefined}
      aria-posinset={windowed ? index + 1 : undefined}
      role="option"
      aria-selected={item.selected ?? false}
      aria-disabled={item.disabled || undefined}
      className={cx(
        styles.option,
        index === activeIndex && styles.active,
        item.selected && styles.selected,
        item.disabled && styles.optionDisabled,
      )}
      // The pointer does not move the cursor onto a disabled option: a
      // disabled element reacts to nothing. The arrow keys still reach it, so
      // that the list reads through in order.
      onMouseEnter={() => !item.disabled && onActivate(index)}
      onClick={() => !item.disabled && onChoose(index)}
    >
      <span className={styles.optionLabel}>{item.label}</span>
      {item.selected && (
        <svg viewBox="0 0 10 8" width="10" height="8" aria-hidden="true">
          <path d="M1 4l2.5 2.5L9 1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );

  /* Runs of options under one <optgroup> stand in a group with its label. */
  const rows: ReactNode[] = [];
  for (let index = 0; index < items.length; ) {
    const group = items[index]!.group;
    if (group === undefined) {
      rows.push(option(items[index]!, index));
      index += 1;
      continue;
    }
    const start = index;
    while (index < items.length && items[index]!.group === group) index += 1;
    const labelId = `${id}-group-${start}`;
    rows.push(
      <div key={`group-${start}`} role="group" aria-labelledby={labelId}>
        <div id={labelId} role="presentation" className={styles.groupLabel}>
          {group}
        </div>
        {items.slice(start, index).map((item, offset) => option(item, start + offset))}
      </div>,
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      anchorRef={anchorRef}
      insideRefs={insideRefs}
      width="anchor"
      /* As wide as the field, and never narrower than a list can be read: a
         field of six characters would otherwise cut every option to an
         ellipsis. */
      minWidth={200}
      className={styles.panel}
    >
      {windowed ? (
        <WindowedList
          listRef={setList}
          id={id}
          ariaLabel={ariaLabel}
          count={items.length}
          activeIndex={activeIndex}
          open={open}
          option={(index) => option(items[index]!, index)}
          busyText={busyText}
        />
      ) : (
        <div ref={setList} role="listbox" id={id} className={styles.list} aria-label={ariaLabel} aria-busy={busyText ? true : undefined}>
          {items.length === 0 ? <div className={styles.empty}>{busyText ?? emptyText}</div> : rows}
          {items.length > 0 && busyText && <div className={styles.empty}>{busyText}</div>}
        </div>
      )}
    </Popover>
  );
}

interface WindowedListProps {
  listRef: (element: HTMLDivElement | null) => void;
  id: string;
  ariaLabel: string;
  count: number;
  activeIndex: number;
  open: boolean;
  option: (index: number) => ReactNode;
  busyText?: ReactNode;
}

/* The scroll element of a long list: it draws the options in view and filler
   rows for the rest. The active option is always drawn - apart from the window
   when it lies outside, so that aria-activedescendant names an element at
   once - and the hook brings it into view. Mounted inside the panel, so the
   hook finds the list when it measures. */
function WindowedList({ listRef, id, ariaLabel, count, activeIndex, open, option, busyText }: WindowedListProps) {
  const { scrollRef, from, to, fillerBefore, fillerAfter, showRow, onScroll } = useVirtual(count, { rowHeight: 32 });

  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element;
      listRef(element);
    },
    [scrollRef, listRef],
  );

  useEffect(() => {
    if (open && activeIndex >= 0 && activeIndex < count) showRow(activeIndex);
  }, [open, activeIndex, count, showRow]);

  // The height of a row, from whichever filler stands beside rows
  const rowHeight =
    from > 0 ? fillerBefore / from : to < count ? fillerAfter / (count - to) : 32;
  const apart = activeIndex >= 0 && activeIndex < count && (activeIndex < from || activeIndex >= to);
  const filler = (rows: number) =>
    rows > 0 ? <div aria-hidden="true" style={{ height: rows * rowHeight, flexShrink: 0 }} /> : null;
  const range = (a: number, b: number) => Array.from({ length: b - a }, (_, i) => option(a + i));

  return (
    <div
      ref={ref}
      role="listbox"
      id={id}
      className={styles.list}
      aria-label={ariaLabel}
      aria-busy={busyText ? true : undefined}
      onScroll={onScroll}
    >
      {apart && activeIndex < from ? (
        <>
          {filler(activeIndex)}
          {option(activeIndex)}
          {filler(from - activeIndex - 1)}
        </>
      ) : (
        filler(from)
      )}
      {range(from, to)}
      {apart && activeIndex >= to ? (
        <>
          {filler(activeIndex - to)}
          {option(activeIndex)}
          {filler(count - activeIndex - 1)}
        </>
      ) : (
        filler(count - to)
      )}
      {busyText && <div className={styles.empty}>{busyText}</div>}
    </div>
  );
}
