import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from "react";
import { useLongPress } from "../../lib/longPress";
import { createPortal } from "react-dom";
import { usePortalTarget } from "../../lib/provider";
import { portalTargetFor, topLayerPopover, useShownInTopLayer } from "../../lib/portalTarget";
import { computePosition, motionOrigin, visibleViewport } from "../Popover/position";
import { usePresence } from "../../lib/motion";
import { mergeRefs } from "../../lib/mergeRefs";
import { elementRef } from "../../lib/elementRef";
import styles from "./Tooltip.module.css";
import { SurfaceSizeReset } from "../../lib/controlSize";

/** The props of `Tooltip`. */
export interface TooltipProps {
  /** Short help text; no interaction, no long content. */
  content: ReactNode;
  /** Exactly one element that triggers the tooltip (must accept refs). Its
      own ref keeps its element: the tooltip holds the same one beside it. */
  children: ReactElement<Record<string, unknown>>;
  /** Delay in ms before the tooltip appears. */
  delay?: number;
}

/** Appears on hover and keyboard focus; purely descriptive (role="tooltip"). */
export function Tooltip({ content, children, delay = 300 }: TooltipProps) {
  const [wanted, setWanted] = useState(false);
  /* A trigger whose own panel is open says so with `aria-expanded`: the tip
     would stand over that panel, so it gives way for as long as it is open. */
  const expanded = children.props["aria-expanded"] === true;
  const open = wanted && !expanded;
  const [position, setPosition] = useState<CSSProperties | null>(null);
  // Portal target, set in an effect as in the popover: it reads the trigger's DOM.
  const [target, setTarget] = useState<Element | null>(null);
  const portalTarget = usePortalTarget();
  const targetRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();
  /* Closed, it stays for its exit; the description goes with `open` at once. */
  const present = usePresence(open, panelRef, "--u-duration-exit-fast");

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setWanted(true), delay);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setWanted(false);
  };

  /* A finger holding the trigger names it: the tip shows at once, stays while
     the finger is held and for a while after it lifts. */
  const press = useLongPress(
    () => {
      if (timer.current) clearTimeout(timer.current);
      setWanted(true);
    },
    () => {
      timer.current = setTimeout(() => setWanted(false), 1500);
    },
  );

  useLayoutEffect(() => {
    if (!open) return;
    // Dialog, then the setting, then the body - the same function as the popover.
    setTarget(portalTargetFor(targetRef.current, portalTarget));
  }, [open, portalTarget]);

  /* Shown before the measuring below: a popover has no size until it is shown. */
  useShownInTopLayer(panelRef);

  /* Mount first, then measure and set: the measured height decides the
     flipping. Runs before painting. */
  useLayoutEffect(() => {
    if (!open || !target) return;
    const rect = targetRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const pos = computePosition(
      rect,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      visibleViewport(),
      { align: "center", side: "top", offset: 8 },
    );
    /* The motion origin travels with the position: above its trigger it
       grows from its bottom edge, flipped below from its top. */
    setPosition({ top: pos.top, left: pos.left, "--_origin": motionOrigin(pos.side, "center") } as CSSProperties);
  }, [open, target, content]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", hide, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", hide, true);
    };
  }, [open]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const childProps = children.props;
  /* A tip that repeats the trigger's name is not also its description: a
     screen reader would say it twice. */
  const describes = open && content !== childProps["aria-label"];

  return (
    <>
      {/* The child keeps its own ref beside the tooltip's. The rule takes a ref
          handed on as one read during render; nothing here reads `.current`. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      {cloneElement(children, {
        // eslint-disable-next-line react-hooks/refs
        ref: mergeRefs(targetRef, elementRef<HTMLElement>(children)),
        // Added to the child's own description, not put in its place.
        "aria-describedby":
          [childProps["aria-describedby"] as string | undefined, describes ? id : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
        onPointerEnter: (event: PointerEvent) => {
          (childProps.onPointerEnter as ((e: PointerEvent) => void) | undefined)?.(event);
          /* A finger has no hover: only its long press shows the tip. */
          if (event.pointerType !== "touch") show();
        },
        /* A press acts; the tip has said what it would do. A finger instead
           arms the long press, which shows it. */
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
          (childProps.onPointerDown as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
          press.handlers.onPointerDown(event);
          if (event.pointerType !== "touch") hide();
          else if (timer.current) clearTimeout(timer.current);
        },
        onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
          (childProps.onPointerMove as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
          press.handlers.onPointerMove(event);
        },
        onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
          (childProps.onPointerUp as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
          press.handlers.onPointerUp(event);
        },
        onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
          (childProps.onPointerCancel as ((e: ReactPointerEvent<HTMLElement>) => void) | undefined)?.(event);
          press.handlers.onPointerCancel(event);
        },
        onClickCapture: (event: ReactMouseEvent<HTMLElement>) => {
          (childProps.onClickCapture as ((e: ReactMouseEvent<HTMLElement>) => void) | undefined)?.(event);
          press.handlers.onClickCapture(event);
        },
        /* Android's menu for the held finger would cover the tip. */
        onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
          (childProps.onContextMenu as ((e: ReactMouseEvent<HTMLElement>) => void) | undefined)?.(event);
          if (press.touching()) event.preventDefault();
        },
        /* A finger's lift ends in a leave that the tip must outlive. */
        onPointerLeave: (event: PointerEvent) => {
          (childProps.onPointerLeave as ((e: PointerEvent) => void) | undefined)?.(event);
          if (event.pointerType !== "touch") hide();
        },
        /* Only a focus the keyboard gave: the one a click hands over follows
           the press, and the press has just hidden the tip. */
        onFocus: (event: FocusEvent) => {
          (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(event);
          if ((event.currentTarget as Element).matches(":focus-visible")) show();
        },
        onBlur: (event: FocusEvent) => {
          (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(event);
          hide();
        },
      })}
      {present &&
        target &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="tooltip"
            popover={topLayerPopover(target)}
            className={styles.tooltip}
            data-closing={!open || undefined}
            // Leaving, it is gone for assistive technology at once; the fade is for the eye.
            aria-hidden={!open || undefined}
            // Do not show before the first measurement, or it flashes in the top left.
            style={{ ...position, visibility: position ? undefined : "hidden" }}
          >
            <SurfaceSizeReset>
              <div className={styles.content}>{content}</div>
            </SurfaceSizeReset>
          </div>,
          target,
        )}
    </>
  );
}
