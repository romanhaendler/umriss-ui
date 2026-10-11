/* One element, two holders of its ref - in one place.

   A component that needs its own root element (to measure it, to open a
   <dialog>, to anchor a panel) and forwards the same element to the caller
   (principle 1) hands both refs one callback. Written by hand it would repeat
   in every such component.

   Internal. */

import type { Ref, RefCallback, RefObject } from "react";

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as RefObject<T | null>).current = node;
    }
  };
}
