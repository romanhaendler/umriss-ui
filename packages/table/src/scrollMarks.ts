/* The marks the scroll area carries as attributes - beyond, under, stuck -
   which the stylesheet draws its fades and shadows from. Set by hand, not by
   state: scrolling re-renders nothing. */

import type { PinBlocks } from "./model/pinning";

/* Whether columns lie beyond a side of the scroll area where no block
   sticks: that side fades out. A table a few pixels too wide for a phone cut
   "1,951.24" to "1,951.2" at the edge and read as cut, not as a table that
   scrolls. Marked on the scroll, and whenever the area or the table changes
   its width. */
export function markBeyond(scroller: HTMLElement, blocks: PinBlocks) {
  const room = scroller.scrollWidth - scroller.clientWidth;
  scroller.toggleAttribute("data-beyond-start", !blocks.start && scroller.scrollLeft > 0.5);
  scroller.toggleAttribute("data-beyond-end", !blocks.end && scroller.scrollLeft < room - 0.5);
}

/* Whether content lies under a pinned block - the block's shadow shows only
   then: under the start block once scrolled away from the start, under the end
   block until scrolled to the end. */
export function markUnder(scroller: HTMLElement) {
  const room = scroller.scrollWidth - scroller.clientWidth;
  scroller.toggleAttribute("data-under-start", scroller.scrollLeft > 0.5);
  scroller.toggleAttribute("data-under-end", scroller.scrollLeft < room - 0.5);
}

/* A group header that sticks gets its shadow step: it sticks when it stands higher than
   its place in the flow would put it - measured against the row after it. */
export function markStuck(scroller: HTMLElement) {
  for (const header of Array.from(scroller.querySelectorAll<HTMLTableRowElement>("tbody > tr[data-line='header']"))) {
    const cell = header.cells[header.cells.length - 1];
    const stuck = !!cell && cell.getBoundingClientRect().top > header.getBoundingClientRect().top + 0.5;
    header.toggleAttribute("data-stuck", stuck);
  }
}
