/* A bottom deck inside a dialog stands above the dialog's footer where that
   footer touches the bottom of the window (a drawer's does), so that it does
   not cover the footer's buttons. */
import { useLayoutEffect, useState } from "react";
import { isDialog } from "../../lib/portalTarget";
import type { ToastItem } from "./Toast";

export function useFooterLift(target: Element | null, edge: "top" | "bottom", items: readonly ToastItem[]): number {
  const [lift, setLift] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const footer = edge === "bottom" && isDialog(target) ? target.querySelector("[data-umriss-footer]") : null;
      const box = footer?.getBoundingClientRect();
      setLift(box && box.bottom >= window.innerHeight - 1 ? Math.max(0, window.innerHeight - box.top) : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [target, edge, items]);
  return lift;
}
