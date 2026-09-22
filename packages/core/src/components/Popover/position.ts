/* Where a popover stands. Pure arithmetic on numbers, without the DOM: this is
   the half of the popover logic that can be tested - jsdom reports every
   element as zero-sized, there is no layout there.

   Before this, the calculation stood in nine versions across the package, with
   four different strategies: sometimes without clamping at the right edge,
   sometimes with, sometimes right-aligned, and exactly once (Tooltip) with
   flipping. */

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export type Align = "start" | "end" | "center";

/** Preferred side; the other one is taken when there is no room there. */
export type Side = "top" | "bottom";

export interface PopoverPosition {
  top: number;
  left: number;
  /** The panel stands above the anchor, because there was no room below. */
  flipped: boolean;
}

export interface PositionOptions {
  align?: Align;
  side?: Side;
  /** Air between anchor and panel. */
  offset?: number;
  /** Minimum distance to the edge of the viewport. */
  margin?: number;
}

export const OFFSET = 6;
export const MARGIN = 8;

export function computePosition(
  anchor: AnchorRect,
  panel: Size,
  viewport: Size,
  options: PositionOptions = {},
): PopoverPosition {
  const { align = "start", side = "bottom", offset = OFFSET, margin = MARGIN } = options;

  const spaceBelow = viewport.height - anchor.bottom - offset;
  const spaceAbove = anchor.top - offset;
  const spacePreferred = side === "top" ? spaceAbove : spaceBelow;
  const spaceOther = side === "top" ? spaceBelow : spaceAbove;

  /* Only switch when the other side really is better. Where it fits nowhere,
     it stays on the preferred one - being cut off over there would be no
     better. */
  const flipped = spacePreferred < panel.height && spaceOther >= panel.height;
  const above = (side === "top") !== flipped;
  const hanging = above ? anchor.top - offset - panel.height : anchor.bottom + offset;
  /* Where it fits on neither side (a tall panel on a phone), it is pulled into
     the window instead of hanging out of it - over the anchor if need be. A
     panel taller than the window keeps its top edge; the panel's own
     max-height lets it scroll. */
  const fits = spacePreferred >= panel.height || spaceOther >= panel.height;
  const top = fits ? hanging : Math.max(margin, Math.min(hanging, viewport.height - panel.height - margin));

  const raw =
    align === "end"
      ? anchor.right - panel.width
      : align === "center"
        ? anchor.left + anchor.width / 2 - panel.width / 2
        : anchor.left;
  // Clamp at the right edge first, then at the left: if the panel is wider than
  // the viewport, the left edge wins.
  const left = Math.max(margin, Math.min(raw, viewport.width - panel.width - margin));

  return { top, left, flipped };
}
