/* The long press under a finger, one detector for the Tooltip and
   `useContextMenuTrigger`: a touch pointer held 500 ms within 10 px.

   The click that ends such a press is swallowed, and so is the `contextmenu`
   that Android fires for it (iOS fires none). Both belong to the press, so the
   target never sees them. A mouse and a pen are never a press. */

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

const HOLD = 500;
const SLOP = 10;
/** How long after the lift the click of a held press is still swallowed. */
const CLICK_WINDOW = 500;

/** Where the finger stands, in client coordinates. */
export interface PressPoint {
  x: number;
  y: number;
}

/** The handlers of a press, to spread on the pressed element. */
export interface LongPressHandlers {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
}

/**
 * @param onPress called once the finger has been held; `at` is where it stands.
 * @param onEnd called when a press that has fired is lifted or cancelled.
 * `touching()` tells whether the last pointer on the element was a finger -
 * the `contextmenu` of such a pointer is the press's, not a right-click.
 */
export function useLongPress(onPress: (at: PressPoint) => void, onEnd?: () => void) {
  const callbacks = useRef({ onPress, onEnd });
  useLayoutEffect(() => {
    callbacks.current = { onPress, onEnd };
  });
  const state = useRef({
    timer: null as ReturnType<typeof setTimeout> | null,
    at: { x: 0, y: 0 },
    touch: false,
    fired: false,
    swallowUntil: 0,
  });

  const clear = useCallback(() => {
    const s = state.current;
    if (s.timer) clearTimeout(s.timer);
    s.timer = null;
  }, []);

  const end = useCallback(() => {
    const s = state.current;
    clear();
    if (!s.fired) return;
    s.fired = false;
    s.swallowUntil = Date.now() + CLICK_WINDOW;
    callbacks.current.onEnd?.();
  }, [clear]);

  const handlers: LongPressHandlers = useMemo(
    () => ({
      onPointerDown: (event) => {
        const s = state.current;
        clear();
        s.fired = false;
        s.swallowUntil = 0;
        s.touch = event.pointerType === "touch";
        if (!s.touch) return;
        s.at = { x: event.clientX, y: event.clientY };
        s.timer = setTimeout(() => {
          s.timer = null;
          s.fired = true;
          s.swallowUntil = Infinity;
          callbacks.current.onPress(s.at);
        }, HOLD);
      },
      onPointerMove: (event) => {
        const s = state.current;
        if (!s.timer) return;
        if (Math.hypot(event.clientX - s.at.x, event.clientY - s.at.y) > SLOP) clear();
      },
      onPointerUp: end,
      onPointerCancel: end,
      onClickCapture: (event) => {
        const s = state.current;
        if (Date.now() >= s.swallowUntil) return;
        s.swallowUntil = 0;
        event.preventDefault();
        event.stopPropagation();
      },
    }),
    [clear, end],
  );

  useLayoutEffect(() => clear, [clear]);

  return { handlers, touching: () => state.current.touch };
}
