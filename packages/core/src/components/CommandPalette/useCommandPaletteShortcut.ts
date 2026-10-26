/* The two keyboard shortcuts that open a palette - together with the rules
   every caller would otherwise rediscover through a bug report.

   Cmd+K or Ctrl+K opens everywhere except inside a modal dialog. "/" is a
   character: it opens only where no text is being entered (no input,
   textarea, select, editable content or textbox/searchbox/combobox around the
   target), and an application can switch it off (WCAG 2.1.4). */

import { useEffect, useRef } from "react";

/** Options of `useCommandPaletteShortcut`. */
export interface CommandPaletteShortcutOptions {
  /**
   * Whether "/" opens the palette (WCAG 2.1.4: offer the user a way to turn a single-key shortcut off). Cmd+K / Ctrl+K is unaffected.
   * @default true
   */
  slash?: boolean;
}

const TEXT_ENTRY = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="searchbox"], [role="combobox"]';

/** Is the focus where a "/" is a character and not a command? */
function inTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.closest(TEXT_ENTRY) !== null;
}

/** Is the target inside a modal dialog, where a page-level shortcut is not the user's? */
function inModal(target: EventTarget | null): boolean {
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    if (el.getAttribute("aria-modal") === "true") return true;
    if (el.tagName === "DIALOG" && el.matches(":modal")) return true;
  }
  return false;
}

/**
 * Binds Cmd+K/Ctrl+K and "/" to the opening of a palette. To remap a key, call the same `onOpen` from your own listener.
 *
 * `onOpen` and `options` may be new on every render: the hook remembers the
 * current version rather than unsubscribing and resubscribing the listener each time.
 */
export function useCommandPaletteShortcut(onOpen: () => void, options: CommandPaletteShortcutOptions = {}): void {
  const latest = useRef({ onOpen, options });
  useEffect(() => {
    latest.current = { onOpen, options };
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (inModal(event.target)) return;
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        latest.current.onOpen();
        return;
      }
      if (
        event.key === "/" &&
        latest.current.options.slash !== false &&
        !event.metaKey &&
        !event.ctrlKey &&
        !inTextEntry(event.target)
      ) {
        event.preventDefault();
        latest.current.onOpen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
