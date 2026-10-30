/* Whether the frame fills a parent of definite height, asked of the browser.

   The frame is `height: 100%`: where the parent has a definite height the
   percentage resolves, otherwise it is auto. The probe asks the frame to be
   7 px shorter than its parent; if its height follows, the percentage
   resolved. It reads neither the rows, the scroll area nor the pager, so a
   part may render a Pagination depending on the answer without a loop. The
   style is put back before anything paints or an observer is told, and the
   scroll area's offsets with it: a step may clamp them. */

import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import type { Registry } from "./registry";

const STEP = 7;

function probe(frame: HTMLElement, registry: Registry) {
  const keep = frame.style.height;
  const parent = frame.parentElement;
  const scroll = frame.querySelector("table")?.parentElement;
  const [top, left] = [scroll?.scrollTop ?? 0, scroll?.scrollLeft ?? 0];
  const full = frame.getBoundingClientRect().height;
  frame.style.height = `calc(100% - ${STEP}px)`;
  const shorter = frame.getBoundingClientRect().height;
  frame.style.height = keep;
  /* The percentage resolving is not enough: a content-sized parent (a stretched
     flex or grid item the table itself makes tall) resolves it too. The frame
     is taken out of flow - not out of the tree, so that focus and boxes
     stay; a parent that keeps its height has one of its own. */
  const before = parent?.getBoundingClientRect().height ?? 0;
  const position = frame.style.position;
  frame.style.position = "absolute";
  const without = parent?.getBoundingClientRect().height ?? 0;
  frame.style.position = position;
  if (scroll) {
    scroll.scrollTop = top;
    scroll.scrollLeft = left;
  }
  /* A frame that stands stays while the percentage resolves: a neighbour that
     shrinks below the table makes the parent depend on it, which would unframe
     the table into a cliff. It becomes framed only when the parent is
     independent of it, so the answer never flips back and forth on its own. */
  const resolves = Math.abs(full - shorter - STEP) < 0.5;
  registry.setFramed(resolves && (registry.framed || Math.abs(before - without) < 0.5));
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
