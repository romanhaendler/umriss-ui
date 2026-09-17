/* What moves the visible window: scrolling, measuring, the keyboard.

   The arithmetic itself lies in ./virtual and knows no DOM. Here stands only
   where its inputs come from - and that is the whole reason for the
   separation: the arithmetic can be checked, the measuring cannot. */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { scrollForRow, visibleWindow } from "./virtual";
import type { RowWindow } from "./virtual";

export interface VirtualOptions {
  /**
   * Expected row height in pixels. It is re-measured on a real row after the
   * first render; the value given is the starting point, so that the first
   * window is not empty.
   */
  rowHeight: number;
  /** Rows above and below the visible area. Default 4. */
  overscan?: number;
}

export interface VirtualRows {
  /** Goes on the scroll area - in @umriss-ui/table on the table's frame; hangs
      the ref and the scroll listener on it. */
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Index of the first rendered row within the filtered set. */
  from: number;
  to: number;
  /** Height of the upper filler row, in pixels. */
  fillerBefore: number;
  /** Height of the lower filler row, in pixels. */
  fillerAfter: number;
  /** Rows in total - the filler rows carry the rest. */
  count: number;
  /** Brings a row into view; for the keyboard. */
  showRow: (index: number) => void;
  /** Reports a new scroll position to the container. Internal. */
  onScroll: () => void;
}

/**
 * Holds the scroll position and the measured heights and derives the window
 * from them.
 *
 * It is measured on the first rendered row rather than taken from the caller's
 * value: row height depends on density, font size and zoom, and an assumption
 * two pixels off adds up over twenty thousand rows to a scrollbar that lies by
 * forty thousand pixels.
 */
export function useVirtual(count: number, options: VirtualOptions): VirtualRows {
  const { rowHeight: expected, overscan = 4 } = options;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(expected);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setScrollTop(el.scrollTop);
  }, []);

  /* The visible height lives in the layout, not in the properties. It changes
     with the window, with a collapsed card and with a scrollbar appearing -
     hence observed rather than read once. */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setViewportHeight(el.clientHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Re-measure the row height on a real row as soon as there is one.
     `data-row` is carried only by the data rows, not by the filler rows.

     The dependencies are the occasion to re-measure: the first row appears
     (count), the layout changed (viewportHeight), or the previous measurement was
     off (rowHeight). The comparison lets the chain come to rest after one
     pass. */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const row = el.querySelector<HTMLElement>("[data-row]");
    if (!row) return;
    const measured = row.getBoundingClientRect().height;
    if (measured > 0 && Math.abs(measured - rowHeight) > 0.5) setRowHeight(measured);
  }, [count, viewportHeight, rowHeight]);

  const rowWindow: RowWindow = visibleWindow({ count, rowHeight, scrollTop, viewportHeight, overscan });

  /**
   * Brings a row into view.
   *
   * The height of the sticky header is measured and not assumed: without it
   * the row lands behind the header, and so is scrolled to and nevertheless
   * invisible.
   */
  const showRow = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const header = el.querySelector<HTMLElement>("thead");
      const target = scrollForRow(index, {
        rowHeight,
        scrollTop: el.scrollTop,
        viewportHeight: el.clientHeight,
        headerHeight: header?.getBoundingClientRect().height ?? 0,
      });
      if (target === null) return;
      el.scrollTop = target;
      setScrollTop(target);
    },
    [rowHeight],
  );

  return {
    scrollRef,
    from: rowWindow.from,
    to: rowWindow.to,
    fillerBefore: rowWindow.before,
    fillerAfter: rowWindow.after,
    count,
    showRow,
    onScroll,
  };
}
