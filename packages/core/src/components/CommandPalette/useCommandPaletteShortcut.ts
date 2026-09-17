/* The two keyboard shortcuts that open a palette - together with the one rule
   every caller would otherwise rediscover through a bug report.

   Cmd+K or Ctrl+K always opens. "/" opens only if the focus is NOT in a text
   field: otherwise no input on the page can take a slash any more without the
   search window springing open. */

import { useEffect, useRef } from "react";

/** Is the focus where a "/" is a character and not a command? */
function inTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

/**
 * Binds Cmd+K/Ctrl+K and "/" to the opening of a palette.
 *
 * `onOpen` may be new on every render: the hook remembers the current version
 * rather than unsubscribing and resubscribing the listener each time.
 */
export function useCommandPaletteShortcut(onOpen: () => void): void {
  const latest = useRef(onOpen);
  useEffect(() => {
    latest.current = onOpen;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        latest.current();
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !inTextField(event.target)) {
        event.preventDefault();
        latest.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
