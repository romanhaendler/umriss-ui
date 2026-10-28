/* Flex columns: a column with `flex` takes a share of the width the other
   columns leave. Only the layout knows what they leave, so the share is
   measured and written as the head's pixel width (a percentage or a calc()
   gives the fixed columns no room in the automatic layout). */

import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import styles from "./Table.module.css";

/** The widths of columns that share `free` pixels by their `flex`; one that
    would get less than its `min` keeps the minimum and the others share the rest. */
export function flexShares(free: number, items: readonly { flex: number; min?: number }[]): number[] {
  const out = items.map((i) => i.min ?? 0);
  let open = items.map((_, i) => i);
  let rest = free;
  for (;;) {
    const total = open.reduce((sum, i) => sum + items[i]!.flex, 0);
    const held = open.filter((i) => (rest * items[i]!.flex) / total < out[i]!);
    if (held.length === 0 || held.length === open.length) {
      if (held.length === 0) for (const i of open) out[i] = (rest * items[i]!.flex) / total;
      return out;
    }
    for (const i of held) rest -= out[i]!;
    open = open.filter((i) => !held.includes(i));
  }
}

/** Writes the pixel width of every head that carries `data-flex`. The other
    columns are measured at their own width, the flex heads without one. */
function fitFlexHeads(table: HTMLTableElement) {
  const heads = Array.from(table.tHead?.querySelectorAll<HTMLElement>("th[data-flex]") ?? []);
  const scroller = table.parentElement;
  if (heads.length === 0 || !scroller) return;
  const before = table.style.width;
  heads.forEach((th) => (th.style.width = ""));
  table.style.width = "auto";
  const taken = table.getBoundingClientRect().width - heads.reduce((sum, th) => sum + th.getBoundingClientRect().width, 0);
  table.style.width = before;
  const widths = flexShares(
    scroller.clientWidth - taken,
    heads.map((th) => ({ flex: Number(th.dataset.flex), min: parseFloat(th.style.minWidth) || 0 })),
  );
  heads.forEach((th, i) => (th.style.width = `${widths[i]}px`));
}

/** Keeps the flex heads at their share: after every render and when the
    scroll area changes its width. */
export function useFlexWidths(tableRef: RefObject<HTMLTableElement | null>) {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (table) fitFlexHeads(table);
  });
  useLayoutEffect(() => {
    const table = tableRef.current;
    const scroller = table?.parentElement;
    if (!table || !scroller || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fitFlexHeads(table));
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [tableRef]);
}

/* "Fit to content" measures the widest cell of the column; rows with a
   different number of cells (detail rows) stay out of it. */
export function contentWidth(cell: HTMLTableCellElement): number {
  const headerRow = cell.parentElement;
  const table = cell.closest("table");
  if (!headerRow || !table) return 0;
  const index = Array.from(headerRow.children).indexOf(cell);
  const count = headerRow.children.length;
  /* Measured without the width it has now, and without the surplus a full
     width table hands its columns: a cell is never narrower than its width,
     so a widened column would only ever grow. */
  const before = { cell: cell.style.width, min: cell.style.minWidth, table: table.style.width };
  cell.style.width = "";
  cell.style.minWidth = "";
  table.style.width = "auto";
  let widest = 0;
  for (const tableRow of Array.from(table.rows)) {
    if (tableRow.cells.length !== count || tableRow.dataset.headGroup !== undefined) continue;
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
  cell.style.minWidth = before.min;
  table.style.width = before.table;
  return widest;
}

/** Sets every column of the table to the width of its content. */
export function fitAllColumns(table: HTMLTableElement | null, setWidth: (column: string, width: number) => void) {
  for (const cell of Array.from(table?.tHead?.querySelectorAll<HTMLTableCellElement>("th[data-column]") ?? [])) {
    const widest = contentWidth(cell);
    if (widest > 0) setWidth(cell.dataset.column!, Math.max(48, widest + 1));
  }
}
