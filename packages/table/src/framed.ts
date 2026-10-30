/* Whether the frame fills a parent of definite height, asked of the browser.

   The frame is `height: 100%`: where the parent has a definite height the
   percentage resolves, otherwise it is auto. The probe asks the frame to be
   7 px shorter than its parent; if its height follows, the percentage
   resolved. It reads neither the rows, the scroll area nor the pager, so a
   part may render a Pagination depending on the answer without a loop. The
   style is put back before anything paints or an observer is told. */

import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import type { Registry } from "./registry";

const STEP = 7;

function probe(frame: HTMLElement, registry: Registry) {
  const keep = frame.style.height;
  const full = frame.getBoundingClientRect().height;
  frame.style.height = `calc(100% - ${STEP}px)`;
  const shorter = frame.getBoundingClientRect().height;
  frame.style.height = keep;
  registry.setFramed(Math.abs(full - shorter - STEP) < 0.5);
  registry.commit();
}

export function useFramed(registry: Registry, childrenRef: RefObject<HTMLElement | null>, off: boolean) {
  useLayoutEffect(() => {
    const frame = childrenRef.current?.parentElement;
    if (!frame || off) {
      registry.setFramed(false);
      registry.commit();
      return;
    }
    probe(frame, registry);
    const observer = new ResizeObserver(() => probe(frame, registry));
    observer.observe(frame);
    return () => observer.disconnect();
  }, [registry, childrenRef, off]);
}
