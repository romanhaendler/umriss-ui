/* Flex columns: a column with `flex` takes a share of the width the other
   columns leave. Only the layout knows what they leave, so the share is
   measured and written as the head's pixel width (a percentage or a calc()
   gives the fixed columns no room in the automatic layout). */

import { useLayoutEffect } from "react";
import type { RefObject } from "react";

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
