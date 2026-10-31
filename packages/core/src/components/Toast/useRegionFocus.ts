/* The region's keyboard focus: the document-level Alt+T that moves it in, and
   the place it goes back to. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export function useRegionFocus(regionRef: RefObject<HTMLDivElement | null>, seen: boolean) {
  /* Alt+T puts the focus on the region by a key, but Chrome shows no
     `:focus-visible` for a scripted focus after a click: the ring is drawn
     for this focus by hand. */
  const [byKeys, setByKeys] = useState(false);

  /** Where Alt+T took the focus from, to give it back. */
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const leaveRegion = useCallback(() => {
    const back = returnFocusRef.current;
    returnFocusRef.current = null;
    if (back?.isConnected) back.focus();
    else (regionRef.current?.ownerDocument.activeElement as HTMLElement | null)?.blur();
  }, [regionRef]);

  useEffect(() => {
    /* The region's own document: in an iframe the global one is the top page's. */
    const doc = regionRef.current?.ownerDocument;
    if (!seen || !doc) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      /* `code`, not `key`: on a Mac, Alt+T types "†". */
      if (!event.altKey || event.ctrlKey || event.metaKey || event.code !== "KeyT") return;
      event.preventDefault();
      const active = doc.activeElement;
      if (!regionRef.current?.contains(active)) {
        returnFocusRef.current = active instanceof HTMLElement ? active : null;
      }
      regionRef.current?.focus();
      setByKeys(true);
    };
    doc.addEventListener("keydown", onKey);
    return () => doc.removeEventListener("keydown", onKey);
  }, [seen, regionRef]);

  return { byKeys, setByKeys, returnFocusRef, leaveRegion };
}
