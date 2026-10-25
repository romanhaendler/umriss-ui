import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useLongPress } from "./longPress";
import type { LongPressHandlers } from "./longPress";

/** What `useContextMenuTrigger` returns: spread it on the target. */
export interface ContextMenuTriggerProps extends LongPressHandlers {
  /** Opens at the pointer on a right-click; a finger's own `contextmenu` is held back. */
  onContextMenu: (event: ReactMouseEvent<HTMLElement>) => void;
  /** Opens at the target's box on the context-menu key or Shift+F10. */
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  /** Keeps the system from selecting text or showing its callout under the held finger. */
  style: CSSProperties;
}

const STYLE = { userSelect: "none", WebkitTouchCallout: "none" } as CSSProperties;

/**
 * Opens a `ContextMenu` the same way on every device: on a right-click (at the
 * pointer), on the context-menu key or Shift+F10 (at the target's box) and on
 * a long press with a finger (at the finger), which is the only way on iOS.
 * `open` receives the point to pass on as the menu's `position`.
 *
 * Spread the result on the target. It sets `style`, so a caller with a style
 * of their own merges it: `style={{ ...trigger.style, ...mine }}`. The click
 * and the `contextmenu` that end a long press do not reach the target.
 */
export function useContextMenuTrigger(open: (position: { x: number; y: number }) => void): ContextMenuTriggerProps {
  const { handlers, touching } = useLongPress(open);
  return {
    ...handlers,
    onContextMenu: (event) => {
      event.preventDefault();
      /* A finger's `contextmenu` (Android) is the press's; the press opens it. */
      if (touching()) return;
      open({ x: event.clientX, y: event.clientY });
    },
    onKeyDown: (event) => {
      if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
      event.preventDefault();
      const box = event.currentTarget.getBoundingClientRect();
      open({ x: box.left, y: box.bottom });
    },
    style: STYLE,
  };
}
