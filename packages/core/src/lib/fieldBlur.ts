import type { FocusEvent, RefObject } from "react";

/**
 * A blur handler's body for a field made of a trigger and a panel: the caller's `onBlur` runs when
 * the focus leaves the whole field, not when it moves from the trigger into the panel or back. The
 * trigger and the panel (through the popover) each call it from their own handler and name the other
 * parts as `inside` - a ref, or an element id (the panel's, which stands only while open); the event's
 * own element is always one. Form libraries validate on blur, and an error shown while the user is
 * still picking would stay stale.
 */
export function fieldBlur(
  event: FocusEvent<HTMLElement>,
  onBlur: ((event: FocusEvent<never>) => void) | undefined,
  ...inside: ReadonlyArray<RefObject<Element | null> | string>
): void {
  const next = event.relatedTarget;
  const parts = inside.map((part) => (typeof part === "string" ? document.getElementById(part) : part.current));
  if (next instanceof Node && [event.currentTarget, ...parts].some((part) => part?.contains(next))) return;
  (onBlur as ((event: FocusEvent<HTMLElement>) => void) | undefined)?.(event);
}
