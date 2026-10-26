/* A head cell: its label, the sort button, the filter button and the grip
   that drags or fits the column's width. */

import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { useTimeZoneLabel } from "@umriss-ui/core";
import { cx } from "./cx";
import { ColumnFilterButton } from "./filter";
import { filterOf } from "./columnFilter";
import type { HookSnapshot, Registry, ColumnEntry } from "./registry";
import type { PinnedCell } from "./pinned";
import { isRightAligned } from "./values";
import styles from "./Table.module.css";

export function HeaderCell({
  entry,
  registry,
  hook,
  pin,
}: {
  entry: ColumnEntry;
  registry: Registry;
  hook: HookSnapshot;
  pin: PinnedCell;
}) {
  const { spec } = entry;
  const snapshot = hook.publicSnapshot;
  const kind = registry.kindOf(entry, hook.rows);
  const rightAligned = isRightAligned(kind, spec.rightAligned);
  const sortable = registry.isSortable(entry, hook.rows);
  const id = spec.id;
  const levelIndex = snapshot.sort.findIndex((s) => s.column === id);
  const direction = levelIndex === -1 ? undefined : snapshot.sort[levelIndex]!.direction;
  const rank = snapshot.sort.length > 1 && levelIndex !== -1 ? levelIndex + 1 : undefined;
  const width = snapshot.widths[id];
  const MIN = 48;

  /* The pointer gesture runs at the grip, not over React state - taken over
     from Th in @umriss-ui/core, with the same two guarantees: a drag does not
     sort, and a second pointer neither moves nor ends it. */
  const dragFrom = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const grip = event.currentTarget;
    const cell = grip.closest("th");
    if (!cell) return;
    const startX = event.clientX;
    const startWidth = cell.getBoundingClientRect().width;
    const pointer = event.pointerId;
    grip.setPointerCapture(pointer);
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      snapshot.setWidth(id, Math.max(MIN, startWidth + (e.clientX - startX)));
    };
    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      grip.removeEventListener("pointermove", onMove);
      grip.removeEventListener("pointerup", onEnd);
      grip.removeEventListener("pointercancel", onEnd);
      if (grip.hasPointerCapture(pointer)) grip.releasePointerCapture(pointer);
    };
    grip.addEventListener("pointermove", onMove);
    grip.addEventListener("pointerup", onEnd);
    grip.addEventListener("pointercancel", onEnd);
  };

  /* "Fit to content" measures the widest cell of the column; rows with a
     different number of cells (detail rows) stay out of it. */
  const measureAndSet = (cell: HTMLTableCellElement | null) => {
    const headerRow = cell?.parentElement;
    const table = cell?.closest("table");
    if (!cell || !headerRow || !table) return;
    const index = Array.from(headerRow.children).indexOf(cell);
    const count = headerRow.children.length;
    /* Measured without the width it has now, and without the surplus a full
       width table hands its columns: a cell is never narrower than its width,
       so a widened column would only ever grow. */
    const before = { cell: cell.style.width, table: table.style.width };
    cell.style.width = "";
    table.style.width = "auto";
    let widest = 0;
    for (const tableRow of Array.from(table.rows)) {
      if (tableRow.cells.length !== count) continue;
      const c = tableRow.cells[index];
      if (!c) continue;
      /* A value cut at the cap is wider than its box: its whole width, and
         the cell's padding beside it. */
      const box = c.querySelector<HTMLElement>(`.${styles.value}`);
      const style = getComputedStyle(c);
      const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      /* A head's label gives way with an ellipsis: what it hides counts. */
      const label = c.querySelector<HTMLElement>(`.${styles.headLabel}`);
      const hidden = label ? label.scrollWidth - label.clientWidth : 0;
      widest = Math.max(widest, c.scrollWidth + hidden, box ? box.scrollWidth + padding : 0);
    }
    cell.style.width = before.cell;
    table.style.width = before.table;
    if (widest > 0) snapshot.setWidth(id, Math.max(MIN, widest + 1));
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTableCellElement>) => {
    if (!spec.resizable || !event.altKey) return;
    const wider = event.key === "ArrowRight";
    const narrower = event.key === "ArrowLeft";
    const toContent = event.key === "Home";
    if (!wider && !narrower && !toContent) return;
    event.preventDefault();
    const cell = event.currentTarget;
    if (toContent) {
      measureAndSet(cell);
      return;
    }
    const now = cell.getBoundingClientRect().width;
    const step = event.shiftKey ? 32 : 8;
    snapshot.setWidth(id, Math.max(MIN, now + (wider ? step : -step)));
  };

  /* The zone's name after the text of a column that writes instants, where the
     reader's zone is another: part of the head's accessible name. */
  const zone = useTimeZoneLabel();
  const text = (
    <>
      {spec.label}
      {zone !== null && (spec.format === "date" || spec.format === "time" || spec.format === "dateTime") && (
        <span className={styles.zoneLabel}> {zone}</span>
      )}
    </>
  );

  const label = sortable ? (
    <button
      type="button"
      className={cx(styles.sortButton, styles.headLine)}
      onClick={(event: ReactMouseEvent) => snapshot.toggleSort(id, event.shiftKey || event.metaKey)}
    >
      <span className={styles.headLabel}>{text}</span>
      {rank !== undefined && (
        <span className={styles.sortRank} aria-hidden="true">
          {rank}
        </span>
      )}
      <span className={cx(styles.sortIndicator, direction && styles.sortActive)} aria-hidden="true">
        {direction ? (
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" className={cx(styles.sortArrow, direction === "desc" && styles.sortArrowDesc)}>
            <path d="M2.2 6.2 5 3.4l2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          /* Drawn in the nominal box and set in the 12 pixels the indicator
             takes, so that the head does not move. */
          <svg viewBox="0 0 10 10" width="10" height="12" aria-hidden="true">
            <path d="M2.8 3.7 5 1.5l2.2 2.2M2.8 6.3 5 8.5l2.2-2.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  ) : (
    <span className={styles.headLine}>
      <span className={styles.headLabel}>{text}</span>
    </span>
  );

  const ariaSort = direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
  /* A list filter needs values with a text form; a filter of one's own knows
     itself what it offers. */
  const withFilter = filterOf(spec.filter) !== undefined && !(spec.filter === "list" && kind === "other");

  return (
    <th
      scope="col"
      data-column={id}
      aria-sort={sortable ? ariaSort : undefined}
      tabIndex={spec.resizable && !sortable ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={cx(styles.th, rightAligned && styles.numeric, width !== undefined && styles.sized, pin.className)}
      style={{
        ...(width !== undefined ? { width } : {}),
        ...pin.style,
      }}
    >
      {withFilter ? (
        <span className={styles.thFlex}>
          {label}
          <ColumnFilterButton entry={entry} registry={registry} hook={hook} />
        </span>
      ) : (
        label
      )}
      {spec.resizable && (
        <span
          role="presentation"
          className={styles.grip}
          onPointerDown={dragFrom}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => {
            event.stopPropagation();
            measureAndSet(event.currentTarget.closest("th"));
          }}
        />
      )}
    </th>
  );
}
