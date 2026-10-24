/* The renderless parts of the scroll area: where the pinned cells stick, the
   width the empty body's message centres in, and the fade beyond the sides. */

import { useEffect, useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";
import { blocksThatStick } from "./model/pinning";
import type { PinBlocks } from "./model/pinning";
import { markBeyond, markUnder } from "./scrollMarks";

/* Where the pinned cells stick: each at the sum of the widths before it in
   its block, read off the head row - after every render and whenever a cell
   of a block changes its width (a font arriving, a column dragged), which
   happens without one. A component and not a hook of the frame's: the blocks
   are known only after the frame's early return. */
export function PinPlacement({
  table: tableRef,
  blocks,
  onSticking,
  pinnedKeys,
}: {
  table: RefObject<HTMLTableElement | null>;
  /** The blocks as pinned - whether they stick is decided here. */
  blocks: PinBlocks;
  onSticking: (sticking: { start: boolean; end: boolean }) => void;
  /** Which columns are pinned: another column in a block is another cell to watch. */
  pinnedKeys: string;
}) {
  const { start, end } = blocks;
  /* A block's width as it stood while it stuck - for the pinned columns, not
     for the pin: a group header's label covers only the start block while
     it sticks and widens it, so a block measured loose would fit and stick
     again in a loop. */
  const known = useRef<{ key: string; sticking: { start: boolean; end: boolean }; start?: number; end?: number }>({
    key: "",
    sticking: { start: true, end: true },
  });
  const place = () => {
    const table = tableRef.current;
    const scroller = table?.parentElement;
    if (!table || !scroller) return;
    /* The browser's own scroll into view keeps a cell it brings in clear of
       the blocks; a pinned cell, which lies in that
       padding, shifts its target out of it by the same width (pinned.ts). */
    scroller.style.removeProperty("scroll-padding-left");
    scroller.style.removeProperty("scroll-padding-right");
    if (!start && !end) return;
    const cells = Array.from(table.tHead?.rows?.[0]?.cells ?? []);
    let startWidth = 0;
    for (let i = 0; i < start; i++) {
      table.style.setProperty(`--u-table-pin-start-${i}`, `${startWidth}px`);
      startWidth += cells[i]?.getBoundingClientRect().width ?? 0;
    }
    let endWidth = 0;
    for (let i = 0; i < end; i++) {
      table.style.setProperty(`--u-table-pin-end-${i}`, `${endWidth}px`);
      endWidth += cells[cells.length - 1 - i]?.getBoundingClientRect().width ?? 0;
    }
    /* Other columns in a block are other widths. */
    const key = `${start}|${end}|${blocks.count}|${pinnedKeys}`;
    if (known.current.key !== key) known.current = { key, sticking: known.current.sticking };
    const now = known.current;
    if (now.sticking.start) now.start = startWidth;
    if (now.sticking.end) now.end = endWidth;
    const sticking = blocksThatStick(now.start ?? startWidth, now.end ?? endWidth, scroller.clientWidth);
    now.sticking = sticking;
    onSticking(sticking);
    if (!sticking.start) startWidth = 0;
    if (!sticking.end) endWidth = 0;
    table.style.setProperty("--u-table-pin-start", `${startWidth}px`);
    table.style.setProperty("--u-table-pin-end", `${endWidth}px`);
    if (startWidth) scroller.style.setProperty("scroll-padding-left", `${startWidth}px`);
    if (endWidth) scroller.style.setProperty("scroll-padding-right", `${endWidth}px`);
    markUnder(scroller);
  };
  useLayoutEffect(place);
  useEffect(() => {
    const table = tableRef.current;
    if (!table || (!start && !end) || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    const cells = Array.from(table.tHead?.rows?.[0]?.cells ?? []);
    for (const cell of [...cells.slice(0, start), ...cells.slice(cells.length - end)]) observer.observe(cell);
    /* The scroll area too: whether content lies under a block changes with its width. */
    if (table.parentElement) observer.observe(table.parentElement);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` reads the table afresh; the cells change with the blocks
  }, [tableRef, start, end, blocks.count, pinnedKeys]);
  return null;
}

/* The width the scroll area shows, for the empty body's message: it spans
   every column, and centred across a table wider than the screen it would
   stand half out of view. */
export function ViewWidth({ table: tableRef }: { table: RefObject<HTMLTableElement | null> }) {
  useLayoutEffect(() => {
    const scroller = tableRef.current?.parentElement;
    if (!scroller) return;
    const measure = () => scroller.style.setProperty("--u-table-view", `${scroller.clientWidth}px`);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [tableRef]);
  return null;
}

export function Beyond({ table: tableRef, blocks }: { table: RefObject<HTMLTableElement | null>; blocks: PinBlocks }) {
  const latest = useRef(blocks);
  useLayoutEffect(() => {
    latest.current = blocks;
    const scroller = tableRef.current?.parentElement;
    if (scroller) markBeyond(scroller, blocks);
  });
  useEffect(() => {
    const table = tableRef.current;
    const scroller = table?.parentElement;
    if (!table || !scroller || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => markBeyond(scroller, latest.current));
    observer.observe(scroller);
    observer.observe(table);
    return () => observer.disconnect();
  }, [tableRef]);
  return null;
}
