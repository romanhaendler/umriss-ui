/* The tip that shows the whole of a value the table cut at its cell's edge. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import { usePortalTarget } from "@umriss-ui/core";
import styles from "./Table.module.css";

/* The whole of a cut value (ADR-0042): one tip per table, under the pointer
   after the core tooltip's 300 ms, at once on the Active cell of grid mode,
   and only where a value is actually cut. It goes with Escape, a scroll and
   the pointer leaving; it stands below its cell, above it where the window
   ends. Drawn as core's tooltip is, from the same tokens. */
export function CutValueTip({ table: tableRef }: { table: RefObject<HTMLTableElement | null> }) {
  const [tip, setTip] = useState<{ text: string; cell: DOMRect; target: Element } | null>(null);
  const portalTarget = usePortalTarget();
  const tipRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => {
      clearTimeout(timer);
      setTip(null);
    };
    const show = (target: EventTarget | null, wait: number) => {
      clearTimeout(timer);
      const cell = target instanceof Element ? target.closest("td, th") : null;
      /* A head's label from its own line only: the funnel beside it has a
         tip of its own. */
      const head = target instanceof Element ? target.closest(`.${styles.headLine}`) : null;
      const box = head
        ? head.querySelector<HTMLElement>(`.${styles.headLabel}`)
        : cell?.querySelector<HTMLElement>(`:scope > .${styles.value}, :scope .${styles.treeText} > .${styles.value}`);
      /* Text only: a cut badge or meter has no words that say it whole. */
      if (!cell || !box || box.childElementCount > 0 || box.scrollWidth <= box.clientWidth + 1) return setTip(null);
      /* Inside a dialog the tip portals there, or it lies behind the dialog -
         the order of core's floating surfaces. */
      const portal = table.closest("dialog") ?? portalTarget() ?? document.body;
      timer = setTimeout(() => setTip({ text: box.textContent ?? "", cell: cell.getBoundingClientRect(), target: portal }), wait);
    };
    const over = (event: PointerEvent) => show(event.target, 300);
    const focus = (event: FocusEvent) => show(event.target, 0);
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") hide();
    };
    table.addEventListener("pointerover", over);
    table.addEventListener("pointerleave", hide);
    table.addEventListener("focusin", focus);
    table.addEventListener("focusout", hide);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", hide, true);
    return () => {
      clearTimeout(timer);
      table.removeEventListener("pointerover", over);
      table.removeEventListener("pointerleave", hide);
      table.removeEventListener("focusin", focus);
      table.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", hide, true);
    };
  }, [tableRef, portalTarget]);
  /* Placed once it is measured: below its cell, above it where the window
     ends, and inside the window's sides. */
  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!tip || !el) return;
    const gap = 4;
    const below = tip.cell.bottom + gap + el.offsetHeight <= window.innerHeight;
    el.style.top = `${below ? tip.cell.bottom + gap : tip.cell.top - gap - el.offsetHeight}px`;
    el.style.left = `${Math.max(8, Math.min(tip.cell.left, window.innerWidth - 8 - el.offsetWidth))}px`;
    el.style.visibility = "";
  }, [tip]);
  if (!tip) return null;
  return createPortal(
    <div ref={tipRef} role="tooltip" className={styles.cutTip} style={{ visibility: "hidden", top: 0, left: 0 }}>
      {tip.text}
    </div>,
    tip.target,
  );
}
