/* The places: where each standing card lies, closed and open, and the height
   of the region that holds them. */
import { useLayoutEffect, useRef } from "react";
import type { ToastItem } from "./Toast";

export interface Place {
  /** Distance from the region's edge, in px. */
  offset: number;
  /** Behind the front card of a closed deck: cut to its height, smaller. */
  behind: boolean;
  scale: number;
  /** Further back than BEHIND in a closed deck. */
  hidden: boolean;
  zIndex: number;
}

/* The deck. Closed, the newest toast stands in front and at most two stand
   behind it, each PEEK further back and a little smaller, cut to the front
   one's height. Open, they stand one after the other, GAP apart. Every card
   lies absolutely in the region and is moved by a transform, so that opening
   and closing are one transition - the heights that takes are measured once
   per card, on its content, which is never cut.
   Closed, the front card lies above the ones behind it, its shadow on what
   peeks out. Open, the card lower on the screen lies above the one above it,
   so that every shadow falls under the next card - at the top edge the newest
   stands at the top, so the order turns there (the stylesheet holds the turn
   back until the cards stand apart). */
const PEEK = 14;
const GAP = 8;
const SHRINK = 0.04;
const BEHIND = 2;

export function useDeckPlaces(items: ToastItem[], open: boolean, heights: Record<number, number>, edge: "top" | "bottom") {
  /* Where each card stood at the last picture, for the one that leaves. */
  const lastPlaceRef = useRef(new Map<number, Place>());

  const standing = items.filter((item) => !item.leaving);
  const count = standing.length;
  const byRank = [...standing].reverse();
  const frontHeight = byRank[0] ? (heights[byRank[0].id] ?? 0) : 0;
  const places = new Map<number, Place>();
  let reach = 0;
  byRank.forEach((item, rank) => {
    const behind = !open && rank > 0;
    places.set(item.id, {
      offset: open ? reach : rank * PEEK,
      behind,
      scale: behind ? 1 - rank * SHRINK : 1,
      hidden: !open && rank > BEHIND,
      zIndex: open && edge === "top" ? rank + 1 : count - rank,
    });
    reach += (heights[item.id] ?? 0) + GAP;
  });
  useLayoutEffect(() => {
    lastPlaceRef.current = places;
  });
  const regionHeight = count === 0 ? 0 : open ? reach - GAP : frontHeight + PEEK * Math.min(count - 1, BEHIND);

  return { lastPlaceRef, places, count, byRank, frontHeight, regionHeight };
}
