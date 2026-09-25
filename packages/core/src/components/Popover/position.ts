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
  /** The edge of the anchor the panel lines up with, after flipping: `start`
      asked for and no room to the right becomes `end`. */
  align: Align;
  /** Set where the panel fits on neither side and is cut to the room on the
      larger one, to scroll in itself: the height it may take. */
  maxHeight?: number;
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
/** The least room a panel is cut to. Below it, a calendar scrolling in a
    strip is worse than a panel over its own trigger. */
export const MIN_SCROLL_HEIGHT = 240;

export function computePosition(
  anchor: AnchorRect,
  panel: Size,
  viewport: Viewport,
  options: PositionOptions = {},
): PopoverPosition {
  const { align = "start", side = "bottom", offset = OFFSET, margin = MARGIN } = options;

  const { top: vTop = 0, left: vLeft = 0 } = viewport;
  /* The room on each side, the window's margin already taken off: without it
     a panel that fitted to the pixel stood flush against the window's edge. */
  const spaceBelow = vTop + viewport.height - anchor.bottom - offset - margin;
  const spaceAbove = anchor.top - vTop - offset - margin;
  const spacePreferred = side === "top" ? spaceAbove : spaceBelow;
  const spaceOther = side === "top" ? spaceBelow : spaceAbove;
  const fits = spacePreferred >= panel.height || spaceOther >= panel.height;
  const roomy = Math.max(spacePreferred, spaceOther) >= MIN_SCROLL_HEIGHT;

  let flipped: boolean;
  let top: number;
  let maxHeight: number | undefined;
  if (fits) {
    /* Only switch when the other side really is better. */
    flipped = spacePreferred < panel.height;
    const above = (side === "top") !== flipped;
    top = above ? anchor.top - offset - panel.height : anchor.bottom + offset;
  } else if (roomy) {
    /* It fits on neither side: it takes the larger one, cut to its room, and
       scrolls in itself - the trigger stays in view. */
    flipped = spaceOther > spacePreferred;
    maxHeight = Math.max(spacePreferred, spaceOther);
    const above = (side === "top") !== flipped;
    top = above ? anchor.top - offset - maxHeight : anchor.bottom + offset;
  } else {
    /* Too little room on either side to scroll in (a tall panel on a phone):
       it is pulled into the window, over the anchor if need be. A panel
       taller than the window keeps its top edge; its own max-height lets it
       scroll. */
    flipped = false;
    const hanging = side === "top" ? anchor.top - offset - panel.height : anchor.bottom + offset;
    top = Math.max(vTop + margin, Math.min(hanging, vTop + viewport.height - panel.height - margin));
  }
  const above = (side === "top") !== flipped;

  const leftFor = (edge: Align) =>
    edge === "end"
      ? anchor.right - panel.width
      : edge === "center"
        ? anchor.left + anchor.width / 2 - panel.width / 2
        : anchor.left;
  const fitsAcross = (x: number) => x >= vLeft + margin && x + panel.width <= vLeft + viewport.width - margin;
  /* Across as along: where the edge asked for pushes the panel out of the
     window and the other one does not, it lines up with the other one - flush
     with the trigger rather than shoved against the window's edge. Where
     neither edge fits (a phone), centred under the trigger still points at
     it; only then is it shoved. */
  const other: Align = align === "start" ? "end" : align === "end" ? "start" : "center";
  const used = ([align, other, "center"] as const).find((edge) => fitsAcross(leftFor(edge))) ?? align;
  // Clamp at the right edge first, then at the left: if the panel is wider than
  // the viewport, the left edge wins.
  const left = Math.max(vLeft + margin, Math.min(leftFor(used), vLeft + viewport.width - panel.width - margin));

  return { top, left, flipped, side: above ? "top" : "bottom", align: used, ...(maxHeight === undefined ? {} : { maxHeight }) };
}

/**
 * The motion origin: the point a panel grows out of, as a `transform-origin`
 * for its stylesheet. It lies on the panel's edge that faces the anchor - a
 * panel below grows from its top - at the end the alignment holds on to.
 *
 * `side` and `align` are where the panel really stands (`PopoverPosition`),
 * not what was asked for: a flipped panel grows from the other edge.
 */
// ponytail: a panel clamped at the window's edge (a phone, where neither edge
// fits) still grows from its aligned corner, not from under the anchor; an x in
// pixels from the anchor if it shows.
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
