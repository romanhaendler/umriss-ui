/* The one list of options that opens under a field (ADR-0043): the
   Combobox's, and the Select's under a pointer and the keys. It draws the
   popover, the options, the list's cursor and the check; the field keeps the
   focus, the keys and the value, and tells the list which option is active. */

import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { cx } from "../cx";
import { mergeRefs } from "../mergeRefs";
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
  /** The listbox element - for a field that asks whether the focus went there. */
  listRef?: RefObject<HTMLDivElement | null>;
}

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
  listRef: outerListRef,
}: ListboxProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the active option in view
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const option = (item: ListboxItem, index: number) => (
    <div
      key={index}
      id={optionId(id, index)}
      data-index={index}
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
      onMouseDown={(event) => event.preventDefault() /* focus stays in the field */}
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
         field of six characters (`chars`) - a country code - would otherwise
         have cut every option to an ellipsis. The multiselect's panel has the
         same floor for its own content. */
      minWidth={200}
      className={styles.panel}
    >
      <div ref={outerListRef ? mergeRefs(listRef, outerListRef) : listRef} role="listbox" id={id} className={styles.list} aria-label={ariaLabel}>
        {items.length === 0 ? <div className={styles.empty}>{emptyText}</div> : rows}
      </div>
    </Popover>
  );
}
