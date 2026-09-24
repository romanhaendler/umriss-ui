/* Where a popover stands. Pure arithmetic on numbers, without the DOM: this is
   the half of the popover logic that can be tested - jsdom reports every
   element as zero-sized, there is no layout there.

   Before this, the calculation stood in nine versions across the package, with
   four different strategies: sometimes without clamping at the right edge,
   sometimes with, sometimes right-aligned, and exactly once (Tooltip) with
   flipping. The one function that reads the browser, `visibleViewport`,
   stands at the end and only measures. */

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

/** The visible part of the window, counted from the window's corner. `top` and
    `left` are its offset: on a phone the keyboard and a zoom move and shorten
    it, while anchor and panel still count from the corner. Default 0. */
export interface Viewport extends Size {
  top?: number;
  left?: number;
}

export type Align = "start" | "end" | "center";

/** Preferred side; the other one is taken when there is no room there. */
export type Side = "top" | "bottom";

export interface PopoverPosition {
  top: number;
  left: number;
  /** The panel stands on the other side than asked, because there was no room. */
  flipped: boolean;
  /** The side of the anchor the panel stands on, after flipping. */
  side: Side;
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
  viewport: Viewport,
  options: PositionOptions = {},
): PopoverPosition {
  const { align = "start", side = "bottom", offset = OFFSET, margin = MARGIN } = options;

  const { top: vTop = 0, left: vLeft = 0 } = viewport;
  const spaceBelow = vTop + viewport.height - anchor.bottom - offset;
  const spaceAbove = anchor.top - vTop - offset;
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
  const top = fits ? hanging : Math.max(vTop + margin, Math.min(hanging, vTop + viewport.height - panel.height - margin));

  const raw =
    align === "end"
      ? anchor.right - panel.width
      : align === "center"
        ? anchor.left + anchor.width / 2 - panel.width / 2
        : anchor.left;
  // Clamp at the right edge first, then at the left: if the panel is wider than
  // the viewport, the left edge wins.
  const left = Math.max(vLeft + margin, Math.min(raw, vLeft + viewport.width - panel.width - margin));

  return { top, left, flipped, side: above ? "top" : "bottom" };
}

/**
 * The motion origin: the point a panel grows out of, as a `transform-origin`
 * for its stylesheet. It lies on the panel's edge that faces the anchor - a
 * panel below grows from its top - at the end the alignment holds on to.
 *
 * `side` is the side the panel really stands on (`PopoverPosition.side`), not
 * the one asked for: a flipped panel grows from the other edge.
 */
// ponytail: a panel clamped at the window's edge still grows from its aligned
// corner, not from under the anchor; an x in pixels from the anchor if it shows.
export function motionOrigin(side: Side, align: Align): string {
  const x = align === "start" ? "left" : align === "end" ? "right" : "center";
  return `${x} ${side === "bottom" ? "top" : "bottom"}`;
}

/** The visible part of the window, read from the browser. `innerWidth` and
    `innerHeight` were read before: Safari reports the zoomed-in size there but
    positions from the unzoomed corner, and neither of them knows the on-screen
    keyboard - on an iPhone the combobox's list stood above the field and cut
    off at the left. Where `visualViewport` is missing (jsdom), the window. */
export function visibleViewport(): Viewport {
  const v = window.visualViewport;
  if (!v) return { width: window.innerWidth, height: window.innerHeight };
  return { top: v.offsetTop, left: v.offsetLeft, width: v.width, height: v.height };
}
