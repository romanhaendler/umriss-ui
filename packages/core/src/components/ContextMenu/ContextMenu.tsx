import { useCallback, useLayoutEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Popover } from "../Popover";
import { MenuContext, handleMenuKeyDown } from "../Menu/Menu";
import styles from "../Menu/Menu.module.css";

/* ------------------------------------------------------------------ */
/* ContextMenu – the menu of a point (schedule 01).                    */
/* ------------------------------------------------------------------ */

export interface ContextMenuProps {
  /** Whether the menu stands. Controlled, like `Popover`: a right-click
      opens it only because the caller says so. */
  open: boolean;
  /** Reports every wish to change the state – an entry chosen, Escape, an
      outside click. */
  onOpenChange: (open: boolean) => void;
  /** Where the menu opens, in client coordinates – typically `clientX` and
      `clientY` of the event that asked for it. At a window edge the panel
      flips and clamps as every popover does. */
  position: { x: number; y: number };
  /** Accessible name of the menu: what it acts on. A context menu has no
      trigger whose label could name it. */
  ariaLabel: string;
  /** The entries – `MenuItem` and `MenuSeparator`, as in `Menu`. */
  children: ReactNode;
}

/**
 * A menu that opens at a point instead of under a trigger – for a right-click
 * on something that is not a button: a canvas, a row, a subtask.
 *
 * It hangs from an invisible anchor that stands at the point, so the one
 * popover does the placing, the dismissal and the portal. The focus goes to
 * the first entry and, on closing, back to where it was when the menu opened.
 */
export function ContextMenu({ open, onOpenChange, position, ariaLabel, children }: ContextMenuProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);

  /* The focus is noted in the commit that opens the menu. The panel arrives
     a pass later (the popover finds its portal target in an effect), so the
     first entry has not taken the focus yet. */
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    returnRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [open]);

  /* On to the first entry as soon as the panel stands. An effect on `open`
     would run too early: the popover finds its portal target in an effect of
     its own, and the panel arrives a pass later. */
  const panelRef = useRef<HTMLDivElement | null>(null);
  const attachPanel = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    node?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus();
  }, []);

  const close = () => {
    onOpenChange(false);
    returnRef.current?.focus();
  };

  return (
    <>
      <span
        ref={anchorRef}
        data-context-menu-anchor=""
        aria-hidden="true"
        style={{ position: "fixed", left: `${position.x}px`, top: `${position.y}px`, width: 0, height: 0, pointerEvents: "none" }}
      />
      <Popover
        open={open}
        onOpenChange={onOpenChange}
        anchorRef={anchorRef}
        focusRef={returnRef}
        offset={0}
        role="menu"
        ariaLabel={ariaLabel}
        className={styles.panel}
      >
        <div
          ref={attachPanel}
          className={styles.content}
          onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => handleMenuKeyDown(event, panelRef.current, () => onOpenChange(false))}
        >
          <MenuContext.Provider value={{ close }}>{children}</MenuContext.Provider>
        </div>
      </Popover>
    </>
  );
}
