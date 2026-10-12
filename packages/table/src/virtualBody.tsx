/* The body's fillers: placeholder rows while loading, the rows that hold a
   page's height, and the virtualised body with its tab stop. */

import { createContext, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import type { VirtualRows } from "@umriss-ui/core";
import { cx } from "./cx";
import styles from "./Table.module.css";

export function LoadingRows({ columns, rightAligned = [], rows = 4 }: { columns: number; rightAligned?: readonly boolean[]; rows?: number }) {
  const widths = [72, 48, 60, 40, 56, 64];
  return (
    <>
      {Array.from({ length: rows }, (_, z) => (
        <tr key={z} aria-hidden="true">
          {Array.from({ length: columns }, (_, s) => (
            <td key={s} className={cx(styles.td, rightAligned[s] && styles.numeric)}>
              <span className={styles.skeleton} style={{ width: `${widths[(z + s) % widths.length]}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Taken over from TableVirtualBody in @umriss-ui/core: two
   filler rows keep the scrollbar at its full length, the arrow keys wander over
   rows that are not rendered yet - scroll first, then focus - and exactly one
   row carries the tab stop. */

export const TabStopContext = /* @__PURE__ */ createContext<number>(0);

export function FillerRow({ height, colSpan }: { height: number | string; colSpan: number }) {
  if (typeof height === "number" && height <= 0) return null;
  return (
    <tr aria-hidden="true" data-filler="" className={styles.fillerRow}>
      <td colSpan={colSpan} style={{ height }} />
    </tr>
  );
}

export function VirtualBody({
  virtual,
  colSpan,
  children,
}: {
  virtual: VirtualRows;
  colSpan: number;
  children: ReactNode;
}) {
  const { count, fillerBefore, fillerAfter, showRow } = virtual;
  const wanted = useRef<number | null>(null);
  const [tabStop, setTabStop] = useState(0);

  const focusRow = (body: HTMLTableSectionElement, index: number) => {
    wanted.current = index;
    setTabStop(index);
    showRow(index);
    requestAnimationFrame(() => {
      body.querySelector<HTMLElement>(`[data-row="${index}"]`)?.focus();
    });
  };

  const tabStopInWindow = tabStop >= virtual.from && tabStop < virtual.to ? tabStop : virtual.from;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTableSectionElement>) => {
    if (event.defaultPrevented || count === 0) return;
    const target = event.target as HTMLElement;
    const row = target.closest<HTMLElement>("[data-row]");
    /* Only on the row itself: inside an input element the arrows belong to the
       element. */
    if (row && target !== row) return;
    const current = row ? Number(row.dataset.row) : (wanted.current ?? -1);
    let next: number | null = null;
    if (event.key === "ArrowDown") next = Math.min(count - 1, current + 1);
    else if (event.key === "ArrowUp") next = Math.max(0, current - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null || next === current) return;
    event.preventDefault();
    focusRow(event.currentTarget, next);
  };

  return (
    <tbody
      className={styles.virtualBody}
      onKeyDown={handleKeyDown}
      onFocus={(event) => {
        const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
        if (row) setTabStop(Number(row.dataset.row));
      }}
    >
      <TabStopContext value={tabStopInWindow}>
        <FillerRow height={fillerBefore} colSpan={colSpan} />
        {children}
        <FillerRow height={fillerAfter} colSpan={colSpan} />
      </TabStopContext>
    </tbody>
  );
}
