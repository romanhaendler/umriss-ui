import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { SurfaceSizeReset } from "../../lib/controlSize";
import { FormFieldBoundary } from "../FormField";
import { computePosition, motionOrigin, visibleViewport } from "./position";
import type { Align, PopoverPosition } from "./position";
import styles from "./Popover.module.css";
import { usePortalTarget } from "../../lib/provider";
import { portalTargetFor } from "../../lib/portalTarget";
import { usePresence } from "../../lib/motion";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The props of `Popover`. */
export interface PopoverProps {
  /** Whether the surface stands. Controlled: the popover never opens itself. */
  open: boolean;
  /** Reports every wish to change the state – outside click, Escape,
      scrolling. Whether it closes as a result is the caller's decision. */
  onOpenChange: (open: boolean) => void;
  /** Trigger the panel hangs from (the reference for the position). */
  anchorRef: RefObject<HTMLElement | null>;
  /**
   * Element that receives the focus on closing. Needed where the anchor is
   * a non-focusable shell and the actual trigger sits inside it.
   *
   * @default anchorRef
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
 * return, travelling along on scroll, stacking order, entrance from its motion
 * origin and exit.
 *
 * Two things it takes off the callers' hands:
 *
 * - It portals into the nearest <dialog> ancestor of the anchor, otherwise
 *   into the body. A menu in a modal would land behind the dialog otherwise,
 *   because a portal at the body does not reach the top layer.
 * - It resets the FormField context inside the panel. Without that, form
 *   elements in the panel inherit the field id of the trigger, and a click on
 *   their label closes the panel.
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
  /* Portal target, set in an effect: no ref may be read during the render. */
  const [target, setTarget] = useState<Element | null>(null);
  const portalTarget = usePortalTarget();
  /* Closed, it stays for its exit - inert, and no longer listening. */
  const present = usePresence(open, panelRef, "--u-duration-exit-fast");
  const closing = present && !open;

  const close = useCallback(
    (returnFocus: boolean) => {
      onOpenChange(false);
      if (returnFocus && restoreFocus) (focusRef ?? anchorRef).current?.focus();
    },
    [onOpenChange, restoreFocus, anchorRef, focusRef],
  );

  /* Measure and set before painting, so the clamping holds from the first
     opening: before the panel is in the document its size would measure zero. */
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

    /* The previous cut goes first, or a panel cut to its room measures as if
       it fitted. Set by hand like the width: it must hold before the height
       is read. */
    panel.style.maxHeight = "";

    // The exact size, not offsetWidth/-Height: those round.
    const size = panel.getBoundingClientRect();
    /* The entry animation scales the panel from 0.96, and the rectangle is
       taken while it runs: without dividing the scale out, a tall panel is
       placed as if it were smaller and sticks out of the window at the bottom. */
    const transform = getComputedStyle(panel).transform;
    const scale = transform && transform !== "none" ? new DOMMatrixReadOnly(transform).a : 1;
    const next = computePosition(
      anchorRect,
      { width: size.width / scale, height: size.height / scale },
      visibleViewport(),
      { align, offset },
    );
    if (next.maxHeight !== undefined) panel.style.maxHeight = `${next.maxHeight}px`;
    setPosition(next);
  }, [anchorRef, align, offset, width, minWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    /* Dialog, then the setting, then the body (`portalTargetFor`). It reads
       the DOM, so it runs in the effect. */
    setTarget(portalTargetFor(anchorRef.current, portalTarget));
  }, [open, anchorRef, portalTarget]);

  useLayoutEffect(() => {
    if (!open || !target) return;
    // Runs before painting, so the position never flickers.
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
      /* The first node of the composed path: inside a shadow root `target` is
         retargeted to the host, which no ref contains. */
      if (!isInside(event.composedPath()[0] as Node)) close(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      /* Escape closes the panel and nothing more: the same key is a dialog's
         close request. */
      event.preventDefault();
      close(true);
    };

    // One recomputation per frame instead of one per scroll event.
    let requested = 0;
    const reposition = () => {
      if (requested) return;
      requested = requestAnimationFrame(() => {
        requested = 0;
        measure();
      });
    };
    const handleScroll = (event: Event) => {
      /* A scroll inside the panel moves nothing the position depends on; a
         re-measure would drop its cut and jump it back to its top. */
      if (event.target instanceof Node && panelRef.current?.contains(event.target)) return;
      if (hideOnScroll) close(false);
      else reposition();
    };
    /* The on-screen keyboard and a zoom change the visible part of the window
       without a scroll or resize of the window itself: the keyboard comes up
       only after the field has the focus and the panel already stands. */
    const visualViewport = window.visualViewport;

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    visualViewport?.addEventListener("resize", reposition);
    visualViewport?.addEventListener("scroll", reposition);
    return () => {
      visualViewport?.removeEventListener("resize", reposition);
      visualViewport?.removeEventListener("scroll", reposition);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
      if (requested) cancelAnimationFrame(requested);
    };
    // insideRefs deliberately not in the dependencies: it is read through a ref
    // so that a fresh array per render does not rebind the listeners.
  }, [open, anchorRef, close, measure, hideOnScroll]);

  /* A dialog takes the focus in: the first focusable element, else the panel
     itself - unless its content placed the focus already. Children's effects
     run before this one, so their own focusing has happened. */
  const standing = present && !!target;
  useEffect(() => {
    const panel = panelRef.current;
    if (!standing || !open || role !== "dialog" || !panel) return;
    const root = panel.getRootNode();
    const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
    if (active && panel.contains(active)) return;
    (panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus({ preventScroll: true });
  }, [standing, open, role]);

  if (!standing) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      /* Focusable by script, so a dialog without a control can take the focus. */
      tabIndex={role === "dialog" ? -1 : undefined}
      aria-label={ariaLabel}
      className={cx(styles.panel, className)}
      data-closing={closing || undefined}
      /* A panel that is leaving is gone for assistive technology at once: its
         fade is for the eye. `inert` takes it out of reach, `aria-hidden` out
         of the tree - a second dialog beside the one opening would be read. */
      inert={closing}
      aria-hidden={closing || undefined}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        /* The motion origin, computed here and drawn by the stylesheet. */
        "--_origin": position ? motionOrigin(position.side, position.align) : undefined,
        /* Not shown before the first measurement. Transparent and not
           `visibility: hidden`: a hidden panel takes no focus. */
        opacity: position ? undefined : 0,
      } as CSSProperties}
    >
      {/* A surface of its own: no field and no size from the place it was
          opened from (ADR-0041). */}
      <FormFieldBoundary>
        <SurfaceSizeReset>{children}</SurfaceSizeReset>
      </FormFieldBoundary>
    </div>,
    target,
  );
}
