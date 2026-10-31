/* Fixed surfaces against the visual viewport.

   A fixed box is placed against the layout viewport. On a pinch-zoomed page
   the visible part is smaller and has moved, so a toast at the bottom edge or
   a dialog sized to the window stands partly outside what the user sees. While
   the page is zoomed, the visible part is written onto the element as custom
   properties for its stylesheet; unzoomed, they are removed and the
   stylesheet's fallbacks (the window) apply.

   `--_vv-x` and `--_vv-y` are where the visible part starts, `--_vv-w` and
   `--_vv-h` its size, `--_vv-r` and `--_vv-b` what the layout viewport has
   beyond it on the right and at the bottom. All in px. */

import { useEffect, type RefObject } from "react";

const PROPERTIES = ["--_vv-x", "--_vv-y", "--_vv-w", "--_vv-h", "--_vv-r", "--_vv-b"] as const;

/**
 * Keeps `--_vv-*` on the element of `ref` for as long as `active` and the
 * page is pinch-zoomed. `dependency` re-binds when the element is replaced.
 */
export function useVisualViewportBox(ref: RefObject<HTMLElement | null>, active: boolean, dependency?: unknown): void {
  useEffect(() => {
    const element = ref.current;
    const viewport = element?.ownerDocument.defaultView?.visualViewport;
    if (!active || !element || !viewport) return;
    const root = element.ownerDocument.documentElement;
    const write = () => {
      if (Math.abs(viewport.scale - 1) < 0.01) {
        PROPERTIES.forEach((name) => element.style.removeProperty(name));
        return;
      }
      const values = [
        viewport.offsetLeft,
        viewport.offsetTop,
        viewport.width,
        viewport.height,
        root.clientWidth - viewport.offsetLeft - viewport.width,
        root.clientHeight - viewport.offsetTop - viewport.height,
      ];
      PROPERTIES.forEach((name, index) => element.style.setProperty(name, `${values[index]}px`));
    };
    write();
    viewport.addEventListener("resize", write);
    viewport.addEventListener("scroll", write);
    return () => {
      viewport.removeEventListener("resize", write);
      viewport.removeEventListener("scroll", write);
      PROPERTIES.forEach((name) => element.style.removeProperty(name));
    };
  }, [ref, active, dependency]);
}
