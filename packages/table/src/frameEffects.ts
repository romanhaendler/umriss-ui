/* The effects of the frame that measure or mend the rendered table: the draft
   of a vanished row, the sticky header's height, the focus after a fold, the
   widths held while loading, the development warnings and the virtual pitch.
   Each runs after every render, in the order the frame calls them. */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import type { VirtualRows } from "@umriss-ui/core";
import { DEV, warnOnce } from "./dev";
import type { Registry } from "./registry";
import { rowLine } from "./model/gridWalk";
import { NEW_LINE } from "./grid";
import type { GridHandle } from "./grid";
import { markStuck } from "./scrollMarks";
import { scrollToRow, showPending } from "./reach";
import styles from "./Table.module.css";

type TableRef = RefObject<HTMLTableElement | null>;

/* A row gone from the rows takes its draft with it (ADR-0036) - nothing is
   left to report it against. */
export function useDraftOfVanishedRow(registry: Registry, grid: GridHandle) {
  const draftLine = grid.state.editing?.line;
  useLayoutEffect(() => {
    const hook = registry.hook;
    if (!hook || draftLine === undefined || draftLine === NEW_LINE) return;
    if (!hook.rows.some((row) => rowLine(hook.rowKey(row)) === draftLine)) grid.setState((s) => ({ ...s, editing: null }));
  });
}

/* Sticky group headers stand below the head and below one another; how high those
   are only the layout knows. Measured after every render - a density or a
   font changes them. */
export function useStickyHeaderHeights(tableRef: TableRef, stickyHeader: boolean) {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (table?.parentElement && !stickyHeader) table.parentElement.style.removeProperty("scroll-padding-top");
    if (!table || !stickyHeader) return;
    const head = table.tHead?.getBoundingClientRect().height ?? 0;
    const headerHeight = table.querySelector("tr[data-line='header']")?.getBoundingClientRect().height ?? 0;
    table.style.setProperty("--u-table-head", `${head}px`);
    table.style.setProperty("--u-table-group-header", `${headerHeight}px`);
    /* The browser's own scroll into view - a focused cell, a walked one -
       keeps what it brings in clear of the head. */
    table.parentElement?.style.setProperty("scroll-padding-top", `${head}px`);
    /* A virtual window draws its group headers anew as it scrolls: marked again after
       every render, not only on the scroll. */
    if (table.parentElement) markStuck(table.parentElement);
  });
}

/* A fold that took away the focused element hands the focus to the fold of
   the innermost group around it that still stands: its folded line or its
   header. A focus the fold left standing stays where it is. */
export function useFocusAfterFold(registry: Registry, tableRef: TableRef) {
  useLayoutEffect(() => {
    const noted = registry.takeFocusBeforeFold();
    const table = tableRef.current;
    if (!noted || !table || noted.table !== table || noted.element.isConnected) return;
    const folds = Array.from(table.querySelectorAll<HTMLButtonElement>("[data-fold-path]"));
    const keys = JSON.parse(noted.group) as unknown[];
    for (let n = keys.length; n > 0; n--) {
      const path = JSON.stringify(keys.slice(0, n));
      const fold = folds.find((b) => b.dataset.foldPath === path);
      if (fold) return fold.focus();
    }
  });
}

/* Server mode: placeholders that stand where a page of rows stood
   keep its columns' widths - the columns of an automatic layout would
   shift to the placeholders' while the answer is out. Their height is the
   pitch's (ADR-0042). Measured from the rendered rows, since only the
   layout knows them. */
export function useHeldColumnWidths(registry: Registry, tableRef: TableRef, loading: boolean) {
  const previousWidths = useRef<number[] | null>(null);
  useLayoutEffect(() => {
    const body = tableRef.current?.tBodies[0];
    if (!body || !registry.server) return;
    if (!loading) {
      const first = body.querySelector<HTMLTableRowElement>(":scope > tr[data-motion]");
      if (first) previousWidths.current = Array.from(first.cells, (cell) => cell.getBoundingClientRect().width);
      return;
    }
    const widths = previousWidths.current;
    const first = body.rows[0];
    if (widths && first?.cells.length === widths.length) {
      Array.from(first.cells).forEach((cell, i) => (cell.style.width = `${widths[i]}px`));
    }
  });
}

/* A value taller than a row is cut at the row's edge (ADR-0042); in
   development the table says so once per column, so that a component of the
   application's own is not cut unnoticed. */
export function useCutValueWarnings(tableRef: TableRef) {
  useEffect(() => {
    const table = tableRef.current;
    if (!DEV || !table) return;
    for (const box of Array.from(table.querySelectorAll<HTMLElement>(`tbody .${styles.value}`))) {
      if (box.scrollHeight <= box.clientHeight + 1) continue;
      const cell = box.closest("td, th");
      const at = cell?.parentElement ? Array.from(cell.parentElement.children).indexOf(cell) : -1;
      const label = table.tHead?.rows?.[0]?.cells[at]?.textContent?.trim() || `column ${at + 1}`;
      warnOnce(
        `taller-than-a-row:${label}`,
        `a value in "${label}" is taller than a row and is cut at its edge. A row's height never follows what it shows (ADR-0042): draw it with a small control, or show it whole in the row's detail.`,
      );
    }
    /* A width below what the head's arrow and funnel take is raised to it,
       and the label has no room left at all. */
    for (const box of Array.from(table.querySelectorAll<HTMLElement>(`thead .${styles.sized} .${styles.headLabel}`))) {
      const label = box.textContent?.trim();
      /* A line without a width is a table not laid out - in a closed panel,
         say - not a label without room. */
      if (!label || box.clientWidth > 0 || !box.parentElement?.clientWidth) continue;
      warnOnce(
        `head-without-room:${box.closest("th")?.dataset.column ?? label}`,
        `the width of "${label}" leaves its label no room: the column is as wide as its sort arrow and filter, and the label shows only in its tip. A head is never cut at its state (ADR-0042): give the column a width its label can begin in.`,
      );
    }
  });
}

/* A virtual table whose scroll area is taller than the viewport and whose
   window holds every row has no bound: the area grows with its rows. */
export function useUnboundedVirtualWarning(virtual: VirtualRows | undefined) {
  useEffect(() => {
    const area = virtual?.scrollRef.current;
    if (!DEV || !virtual || !area || virtual.count === 0) return;
    if (virtual.from === 0 && virtual.to >= virtual.count && area.clientHeight > window.innerHeight) {
      warnOnce("virtual-unbounded", "`virtual` renders every row because its scroll area has no bound. Give the table a `maxHeight`, or a parent of definite height.");
    }
  });
}

/* A virtual window counts in row pitches (ADR-0042): the head is one, and
   the window learns it from there - the density, a finger, a theme of the
   application's may each change it. */
export function useVirtualPitch(registry: Registry, tableRef: TableRef) {
  useLayoutEffect(() => {
    const head = tableRef.current?.tHead?.rows?.[0]?.getBoundingClientRect().height;
    if (head && registry.hook?.tableState.virtual) registry.hook.tableState.setPitch(head);
  });
}

/* A row `scrollToRow` asked for is shown once it stands in the document - a
   page or a window renders it a render after the call (`showPending`). */
export function useRevealedRow(registry: Registry) {
  useLayoutEffect(() => {
    showPending(registry);
  });
}

/* A current row that changes is brought into view (ADR-0071) the way
   `scrollToRow` does it: its page opens, a virtual window renders it, the
   scroll area shows it at the nearest edge. A row already in view stays where
   it is, so a click in the table does not scroll it; a key outside the
   filtered set does nothing; the focus never moves. */
export function useCurrentRowInView(registry: Registry, currentRow: string | null | undefined) {
  const last = useRef<string | null | undefined>(undefined);
  useLayoutEffect(() => {
    if (last.current === currentRow) return;
    last.current = currentRow;
    if (currentRow !== null && currentRow !== undefined) scrollToRow(registry, currentRow);
  });
}
