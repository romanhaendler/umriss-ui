import { cloneElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";
import { usePortalTarget } from "../../lib/provider";
import { portalTargetFor } from "../../lib/portalTarget";
import { computePosition } from "../Popover/position";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** Short help text; no interaction, no long content. */
  content: ReactNode;
  /** Exactly one element that triggers the tooltip (must accept refs). */
  children: ReactElement<Record<string, unknown>>;
  /** Delay in ms before the tooltip appears. */
  delay?: number;
}

/** Appears on hover and keyboard focus; purely descriptive (role="tooltip"). */
export function Tooltip({ content, children, delay = 300 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties | null>(null);
  const [below, setBelow] = useState(false);
  /* Portal target determined in the effect, as with the popover: the rule
     reads the DOM of the trigger, and rendering may not do that. */
  const [target, setTarget] = useState<Element | null>(null);
  const portalTarget = usePortalTarget();
  const targetRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!open) return;
    /* Dialog, then the setting, then the body - the same function as the
       popover. Without it a tooltip in a modal lay behind the dialog, and
       with it every tooltip of a dock inside one. */
    setTarget(portalTargetFor(targetRef.current, portalTarget));
  }, [open, portalTarget]);

  /* Mount first, then measure and set - this way the measured height decides
     the flipping instead of a fixed threshold. Runs before painting, so it is
     not visible. */
  useLayoutEffect(() => {
    if (!open || !target) return;
    const rect = targetRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const pos = computePosition(
      rect,
      { width: panel.offsetWidth, height: panel.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
      { align: "center", side: "top", offset: 8 },
    );
    setBelow(pos.flipped);
    setPosition({ top: pos.top, left: pos.left });
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

  return (
    <>
      {cloneElement(children, {
        ref: targetRef,
        /* Added to the child's own description, not put in its place: a field's
           hint went silent for as long as the tooltip stood. */
        "aria-describedby":
          [childProps["aria-describedby"] as string | undefined, open ? id : undefined]
            .filter(Boolean)
            .join(" ") || undefined,
        onPointerEnter: (event: PointerEvent) => {
          (childProps.onPointerEnter as ((e: PointerEvent) => void) | undefined)?.(event);
          show();
        },
        onPointerLeave: (event: PointerEvent) => {
          (childProps.onPointerLeave as ((e: PointerEvent) => void) | undefined)?.(event);
          hide();
        },
        onFocus: (event: FocusEvent) => {
          (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(event);
          show();
        },
        onBlur: (event: FocusEvent) => {
          (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(event);
          hide();
        },
      })}
      {open &&
        target &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="tooltip"
            className={cx(styles.tooltip, below ? styles.below : styles.above)}
            // Do not show before the first measurement, or it flashes in the top left.
            style={{ ...position, visibility: position ? undefined : "hidden" }}
          >
            {content}
          </div>,
          target,
        )}
    </>
  );
}
