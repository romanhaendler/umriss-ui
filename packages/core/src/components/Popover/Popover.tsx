import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { FormFieldBoundary } from "../FormField";
import { computePosition } from "./position";
import type { Align, PopoverPosition } from "./position";
import styles from "./Popover.module.css";
import { usePortalTarget } from "../../lib/provider";
import { portalTargetFor } from "../../lib/portalTarget";

export interface PopoverProps {
  /** Whether the surface stands. Controlled: the popover never opens itself. */
  open: boolean;
  /** Reports every wish to change the state – outside click, Escape,
      scrolling. Whether it closes as a result is the caller's decision. */
  onOpenChange: (open: boolean) => void;
  /** Trigger the panel hangs from (the reference for the position). */
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * Element that receives the focus on closing. Default: the anchor.
   * Needed where the anchor is a non-focusable shell and the actual
   * trigger sits inside it.
   */
  focusRef?: RefObject<HTMLElement | null>;
  /** Further elements whose click does not count as an outside click (e.g. the clear ×). */
  insideRefs?: ReadonlyArray<RefObject<HTMLElement | null>>;
  /** Where the surface points as long as there is room. Where there is none,
      it flips to the other side and clamps to the edge of the window. */
  align?: Align;
  /** Distance between trigger and surface, in pixels. */
  offset?: number;
  /** "anchor" takes over the width of the trigger, a number fixes it. */
  width?: "anchor" | "auto" | number;
  /** Minimum width when the width comes from the anchor. */
  minWidth?: number;
  /** Give the focus back to the trigger on closing. */
  restoreFocus?: boolean;
  /** Close on scrolling instead of travelling along – for tooltips. */
  hideOnScroll?: boolean;
  /** Role of the surface. Omit where an inner element carries it. */
  role?: "dialog" | "listbox" | "menu" | "tooltip";
  /** Accessible name of the surface. Needed as soon as it carries a `role`:
      a named role without a name is a riddle for a screen reader. */
  ariaLabel?: string;
  /** Fixed id of the surface – for `aria-controls` on the trigger. */
  id?: string;
  /** Additional class on the surface. */
  className?: string;
  /** What stands in the surface. */
  children: ReactNode;
}

/**
 * The one closable, anchored surface. It owns: the portal, the position
 * including clamping and flipping, the outside click, Escape with focus
 * return, travelling along on scroll, stacking order and entrance.
 *
 * Two things it takes off the callers' hands that each of them had to carry
 * itself before:
 *
 * - It portals into the nearest <dialog> ancestor of the anchor, otherwise
 *   into the body. A menu in a modal landed behind the dialog otherwise,
 *   because a portal at the body does not reach the top layer.
 * - It resets the FormField context inside the panel. Without that, form
 *   elements in the panel inherit the field id of the trigger, and a click on
 *   their label closes the panel (HANDOFF A.5 §1 – happened twice).
 */
export function Popover({
  open,
  onOpenChange,
  anchorRef,
  focusRef,
  insideRefs,
  align = "start",
  offset,
  width = "auto",
  minWidth,
  restoreFocus = true,
  hideOnScroll = false,
  role,
  ariaLabel,
  id,
  className,
  children,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const insideRefsRef = useRef(insideRefs);
  useEffect(() => {
    insideRefsRef.current = insideRefs;
  });
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  /* Portal target determined in the effect, not while rendering: no ref may be
     read during the render. Costs one pass, which however lies before painting
     and is therefore not visible. */
  const [target, setTarget] = useState<Element | null>(null);
  const portalTarget = usePortalTarget();

  const close = useCallback(
    (returnFocus: boolean) => {
      onOpenChange(false);
      if (returnFocus && restoreFocus) (focusRef ?? anchorRef).current?.focus();
    },
    [onOpenChange, restoreFocus, anchorRef, focusRef],
  );

  /* Measure and set before painting: the measured panel size is the reason
     the clamping already takes hold the first time it opens. Before this, the
     position was computed before the panel stood in the document – the
     measurement was then zero and a fixed fallback value decided. */
  const measure = useCallback(() => {
    const anchorRect = anchorRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!anchorRect || !panel) return;

    /* Width first and immediately: it influences the wrapping and thereby the
       height that is measured next. */
    if (width === "anchor") {
      panel.style.width = `${minWidth ? Math.max(anchorRect.width, minWidth) : anchorRect.width}px`;
    } else if (typeof width === "number") {
      panel.style.width = `${width}px`;
    }

    // The exact size, not offsetWidth/-Height: those round, and half a pixel
    // decided whether a panel at the window's edge fitted or stuck out.
    const size = panel.getBoundingClientRect();
    setPosition(
      computePosition(
        anchorRect,
        { width: size.width, height: size.height },
        { width: window.innerWidth, height: window.innerHeight },
        { align, offset },
      ),
    );
  }, [anchorRef, align, offset, width, minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    /* Dialog, then the setting, then the body - the rule stands in
       `portalTargetFor` and holds for the tooltip just the same. It reads the
       DOM, so it is to be fetched in the effect - and without writing state it
       does not come back into the render. */
    setTarget(portalTargetFor(anchorRef.current, portalTarget));
  }, [open, anchorRef, portalTarget]);

  useLayoutEffect(() => {
    if (!open || !target) return;
    /* Measuring and positioning is exactly the case a layout effect is there
       for: without writing to state, a measurement cannot become a position.
       Runs before painting, so it produces no flicker. */
    measure();
  }, [open, target, measure]);

  useEffect(() => {
    if (!open) return;

    const isInside = (node: Node) =>
      panelRef.current?.contains(node) ||
      anchorRef.current?.contains(node) ||
      (insideRefsRef.current ?? []).some((ref) => ref.current?.contains(node));

    // An outside click does not take the focus back – the pointer is elsewhere already.
    const handlePointerDown = (event: MouseEvent) => {
      if (!isInside(event.target as Node)) close(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      /* Escape closes the panel and nothing more: without this a menu in a
         modal took the modal down with it, because the same key is the
         dialog's close request. */
      event.preventDefault();
      close(true);
    };

    // One recomputation per frame instead of one per scroll event.
    let requested = 0;
    const handleScroll = () => {
      if (hideOnScroll) {
        close(false);
        return;
      }
      if (requested) return;
      requested = requestAnimationFrame(() => {
        requested = 0;
        measure();
      });
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      if (requested) cancelAnimationFrame(requested);
    };
    // insideRefs deliberately not in the dependencies: it is read through a ref
    // so that a fresh array per render does not rebind the listeners.
  }, [open, anchorRef, close, measure, hideOnScroll]);

  if (!open || !target) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-label={ariaLabel}
      className={cx(styles.panel, position?.flipped && styles.above, className)}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        /* Not shown before the first measurement, or it flashes in the top
           left. Transparent and not `visibility: hidden`: a hidden panel takes
           no focus, and the first opening of a menu lost its move to the first
           entry exactly then. The measurement runs before painting, so the
           transparent pass is never seen. */
        opacity: position ? undefined : 0,
      }}
    >
      <FormFieldBoundary>{children}</FormFieldBoundary>
    </div>,
    target,
  );
}
