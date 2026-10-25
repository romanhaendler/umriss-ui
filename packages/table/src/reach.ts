/* What a caller does to a table from outside it: bring a row into view, put
   the focus on a cell. Both read the hook's latest snapshot when called, and
   change nothing for a row the table does not show. */

import type { Registry } from "./registry";
import { pageLines } from "./model/grouping";

/** The row with this key brought into view: its page, or the scroll. `false`
    and nothing changed for a key the table does not show. */
export function scrollToRow(registry: Registry, key: string): boolean {
  const hook = registry.hook;
  if (!hook || !registry.frameTable) return false;
  const state = hook.tableState;
  const { lines } = state;
  /* What is shown: the rows or lines the table walks, without what a search,
     a condition, the pre-filter or a fold leaves out. */
  const list = lines ?? state.shown ?? state.filtered;
  const same = (item: unknown) => hook.rowKey((lines ? (item as { row?: unknown }).row : item) as unknown) === key;
  const at = list.findIndex((item) => (lines ? (item as { kind: string }).kind === "row" : true) && same(item));
  if (at < 0) return false;

  if (state.virtual) {
    /* The window moves to the row; `useRevealedRow` shows it once rendered. */
    state.virtual.showRow(at);
    registry.setReveal(at);
  } else if (!registry.server && !registry.tree && registry.paginates() && state.pageSize > 0) {
    const page = lines
      ? Array.from({ length: state.pageCount }, (_, i) => i + 1).find((p) =>
          pageLines(lines, p, state.pageSize).lines.some((l) => l.kind === "row" && hook.rowKey(l.row) === key),
        )
      : Math.floor(at / state.pageSize) + 1;
    if (page !== undefined && page !== state.page) state.setPage(page);
  } else {
    /* A scroll area, virtual or not: the offset from the row pitch (ADR-0042),
       the head row standing above the rows. A virtual window follows the scroll
       event. ponytail: a detail row or a footer
       makes the pitch approximate; measure the row if that shows. */
    const scroller = registry.frameTable?.parentElement;
    const head = registry.frameTable?.tHead?.rows[0]?.getBoundingClientRect().height ?? 0;
    if (scroller && head > 0) {
      const top = head + at * head;
      const bottom = top + head;
      if (top < scroller.scrollTop + head) scroller.scrollTop = Math.max(0, top - head);
      else if (bottom > scroller.scrollTop + scroller.clientHeight) scroller.scrollTop = bottom - scroller.clientHeight;
    }
  }
  return true;
}

/** The cell of this row and column made the Active cell and focused - grid
    mode only. */
export function focusCell(registry: Registry, key: string, column: string): boolean {
  const focus = registry.cellFocus;
  if (!focus || !focus.columns.includes(column) || !scrollToRow(registry, key)) return false;
  focus.put(key, column);
  return true;
}
