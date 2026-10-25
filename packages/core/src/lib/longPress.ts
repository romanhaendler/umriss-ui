/* The long press under a finger, one detector for the Tooltip,
   `useContextMenuTrigger` and the schedule: a touch pointer held 500 ms within
   10 px.

   The click that ends such a press is swallowed, and so is the `contextmenu`
   that Android fires for it (iOS fires none). Both belong to the press, so the
   target never sees them. A mouse and a pen are never a press. */

import { useLayoutEffect, useMemo, useRef } from "react";
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

/** What the detector reads of a pointer event - a DOM or a React one fits. */
export interface PressPointer {
  readonly pointerType: string;
  readonly clientX: number;
  readonly clientY: number;
}

/** A press detector over pointer events; see `createLongPress`. */
export interface LongPress {
  /** Arms the press when the pointer is a finger; a mouse and a pen never press. */
  pointerDown(event: PressPointer): void;
  /** Cancels a press that is not yet held once the finger has left its 10 px. */
  pointerMove(event: PressPointer): void;
  /** Ends a press: a held one calls `onEnd`, and its click is then swallowed. */
  pointerUp(): void;
  /** As `pointerUp`, for `pointercancel`. */
  pointerCancel(): void;
  /** Whether this click belongs to a press and must not reach the target: true
      once for the click that ends a held press. Call `preventDefault` and
      `stopPropagation` on the event when it is. */
  swallows(): boolean;
  /** Whether the last pointer was a finger - the `contextmenu` of such a
      pointer is the press's, not a right-click. */
  touching(): boolean;
  /** Drops the timer. Call it when the target goes away. */
  dispose(): void;
}

/**
 * The one long-press detector, a plain function over pointer events so that
 * code outside React can use it. `onPress` fires once, with the finger's point
 * in client coordinates, when a touch pointer has been held 500 ms within 10 px;
 * `onEnd` fires when a press that has fired is lifted or cancelled. A move
 * beyond 10 px, a lift and `pointercancel` before the hold cancel it silently.
 */
export function createLongPress(onPress: (at: PressPoint) => void, onEnd?: () => void): LongPress {
  const s = {
    timer: null as ReturnType<typeof setTimeout> | null,
    at: { x: 0, y: 0 },
    touch: false,
    fired: false,
    swallowUntil: 0,
  };
  const clear = () => {
    if (s.timer) clearTimeout(s.timer);
    s.timer = null;
  };
  const end = () => {
    clear();
    if (!s.fired) return;
    s.fired = false;
    s.swallowUntil = Date.now() + CLICK_WINDOW;
    onEnd?.();
  };
  return {
    pointerDown(event) {
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
        onPress(s.at);
      }, HOLD);
    },
    pointerMove(event) {
      if (!s.timer) return;
      if (Math.hypot(event.clientX - s.at.x, event.clientY - s.at.y) > SLOP) clear();
    },
    pointerUp: end,
    pointerCancel: end,
    swallows() {
      if (Date.now() >= s.swallowUntil) return false;
      s.swallowUntil = 0;
      return true;
    },
    touching: () => s.touch,
    dispose: clear,
  };
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
  /* The detector outlives the renders and reads the ref only when it fires. */
  /* eslint-disable react-hooks/refs */
  const press = useMemo(
    () => createLongPress((at) => callbacks.current.onPress(at), () => callbacks.current.onEnd?.()),
    [],
  );
  /* eslint-enable react-hooks/refs */

  const handlers: LongPressHandlers = useMemo(
    () => ({
      onPointerDown: press.pointerDown,
      onPointerMove: press.pointerMove,
      onPointerUp: press.pointerUp,
      onPointerCancel: press.pointerCancel,
      onClickCapture: (event) => {
        if (!press.swallows()) return;
        event.preventDefault();
        event.stopPropagation();
      },
    }),
    [press],
  );

  useLayoutEffect(() => press.dispose, [press]);

  return { handlers, touching: press.touching };
}
