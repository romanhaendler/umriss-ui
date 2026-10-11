/* Whether the deck is open: under the pointer, with the focus inside it, or
   pinned by its count. Also the focus test the deck opens for, and the pinned
   deck's dismissal by a press elsewhere. */
import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { ToastItem } from "./Toast";

/** A focus the deck opens for: on the region itself (Alt+T, the count), or
    one the browser shows as keyboard focus. Where `:focus-visible` is not
    understood (an older browser, jsdom), every focus counts - a deck open too
    often is better than one the keyboard cannot open. */
export function keyboardFocus(element: Element, region: Element): boolean {
  if (element === region) return true;
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

export function useDeckOpen(regionRef: RefObject<HTMLDivElement | null>, items: ToastItem[]) {
  /* The deck opens under the pointer, with the focus inside it, or pinned by
     its count (a finger has no hover). While it is open every countdown
     stands still. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || focused || pinned;

  /* A pinned deck closes on a press anywhere else - and gives up the focus it
     was given, or it would stay open by that. */
  useEffect(() => {
    if (!pinned) return;
    const onDown = (event: globalThis.PointerEvent) => {
      const region = regionRef.current;
      if (!region || region.contains(event.target as Node)) return;
      setPinned(false);
      if (region.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [pinned, regionRef]);

  /* An element that leaves the document takes the focus with it and sends no
     blur: after every change the focus is read again. */
  useEffect(() => {
    const region = regionRef.current;
    const active = document.activeElement;
    setFocused(!!region && active instanceof HTMLElement && region.contains(active) && keyboardFocus(active, region));
  }, [items, regionRef]);

  return { open, setHovered, setFocused, setPinned };
}
