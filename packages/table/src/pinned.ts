/* A cell of a pinned block: its class and its offset (table-column-pinning).

   The offset is a variable the table sets from the widths of its head row
   (parts.tsx, `placePins`) - the cells only name it. That way a measurement
   writes one value per place instead of one per cell, and a virtual row that
   appears later finds its offset already standing. */

import type { CSSProperties } from "react";
import { cx } from "./cx";
import { pinOf } from "./model/pinning";
import type { PinBlocks } from "./model/pinning";
import styles from "./Table.module.css";

export interface PinnedCell {
  className?: string;
  style?: CSSProperties;
}

export const NOT_PINNED: PinnedCell = {};

/** The class and offset of a cell covering the head row's cells `first` to
    `last`; nothing when it does not stick. */
export function pinnedCell(blocks: PinBlocks, first: number, last = first): PinnedCell {
  const pin = pinOf(blocks, first, last);
  if (!pin) return NOT_PINNED;
  const start = pin.side === "start";
  return {
    className: cx(styles.pinned, pin.edge && (start ? styles.pinStartEdge : styles.pinEndEdge)),
    style: start ? { left: `var(--u-table-pin-start-${pin.at}, 0px)` } : { right: `var(--u-table-pin-end-${pin.at}, 0px)` },
  };
}
