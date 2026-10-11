/* The measured height of the palette's body, which the window grows and
   shrinks to as a number a CSS transition can travel towards. */

import { useEffect, useRef, useState } from "react";

export function usePaletteGrowth(open: boolean) {
  /* The height is measured and set as a number, so that `transition` can travel
     towards it. A keyframe animation would be wrong here: it starts again from
     the beginning on every keystroke, and `tab`, `tabe`, `tabel` then reads as
     three jerks instead of one settling. A transition aims from the current
     value.

     It is measured through a ResizeObserver and not in a layout effect with
     `[open, query, ...]` as dependencies. The reason is an order one cannot
     see: `showModal()` runs in the choreography's passive effect, whereas a
     layout effect runs before it - so it would measure a dialog that is still
     `display: none` and would get zero.

     As long as the resting state was always empty, zero happened to be the
     right answer, and the bug stayed invisible. With `restingItems` the window
     opened and remained a strip: the rows stood in the tree and had no height.
     The observer hangs on what really counts - the size of the content - and
     thereby manages without that knowledge too. */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [bodyHeight, setBodyHeight] = useState(0);

  useEffect(() => {
    const body = bodyRef.current;
    if (!open || body === null) return;
    /* This stands after the choreography: the dialog is already open here, so
       the first measurement is usable. The observer takes over everything else -
       typing, fonts loaded later, longer labels. */
    setBodyHeight(body.offsetHeight);
    const observer = new ResizeObserver(() => setBodyHeight(body.offsetHeight));
    observer.observe(body);
    return () => observer.disconnect();
  }, [open]);

  return { bodyRef, bodyHeight };
}
