/* What a caller does to a table from outside it: bring a row into view, put
   the focus on a cell. Both read the hook's latest snapshot when called, and
   change nothing for a row the table does not show. */

import type { Registry } from "./registry";
import { pageLines } from "./model/grouping";

/** The row `scrollToRow` asked for, shown once it stands in the document: at
    the nearest edge, the sticky head kept clear by the scroll padding, and in
    grid mode its cell made the Active cell. A page or a virtual window renders
    the row a render after the call, so `useRevealedRow` asks again after every
    render. `true` when nothing is pending any more. */
export function showPending(registry: Registry): boolean {
  const pending = registry.reveal;
  if (!pending) return true;
  const row = Array.from(registry.frameTable?.querySelectorAll<HTMLElement>("tr[data-motion]") ?? []).find(
    (tr) => tr.dataset.motion === pending.key,
  );
  if (!row) return false;
  registry.setReveal(null);
  row.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  if (pending.column !== undefined) registry.cellFocus?.put(pending.key, pending.column);
  return true;
}

/** The row with this key brought into view: its page, the window or the
    scroll, once it is rendered (`showPending`). `false` and nothing changed
    for a key the table does not show. */
export function scrollToRow(registry: Registry, key: string, column?: string): boolean {
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

  let moves = false;
  if (state.virtual) {
    state.virtual.showRow(at);
    moves = true;
  } else if (!registry.server && !registry.tree && registry.paginates() && state.pageSize > 0) {
    const page = lines
      ? Array.from({ length: state.pageCount }, (_, i) => i + 1).find((p) =>
          pageLines(lines, p, state.pageSize).lines.some((l) => l.kind === "row" && hook.rowKey(l.row) === key),
        )
      : Math.floor(at / state.pageSize) + 1;
    if (page === undefined) return false;
    if (page !== state.page) {
      state.setPage(page);
      moves = true;
    }
  }
  registry.setReveal({ key, column });
  if (!moves) showPending(registry);
  return true;
}

/** The cell of this row and column made the Active cell and focused - grid
    mode only. */
export function focusCell(registry: Registry, key: string, column: string): boolean {
  const focus = registry.cellFocus;
  return !!focus && focus.columns.includes(column) && scrollToRow(registry, key, column);
}
