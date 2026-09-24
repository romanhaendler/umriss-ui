/* Motion that explains the grouping (table-grouping 06).

   When the grouping or a fold changes, every row that stays travels from where
   it stood to where it stands now (FLIP), and a line that is new - a group header, a
   row that unfolded - settles in. The motion shows WHAT happened: the rows go
   to their group, and flow back when the grouping is lifted.

   The durations come from the tokens, so that `prefers-reduced-motion`, which
   sets them to 0 ms, switches all of it off; without the Web Animations API
   (jsdom) nothing moves either. */

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

/** How far each line that stays has moved: old top minus new top. Lines that
    did not move, and those that are new or gone, are absent. */
export function deltas(before: ReadonlyMap<string, number>, after: ReadonlyMap<string, number>): Map<string, number> {
  const out = new Map<string, number>();
  for (const [key, top] of after) {
    const old = before.get(key);
    if (old !== undefined && Math.abs(old - top) >= 0.5) out.set(key, old - top);
  }
  return out;
}

/** A duration token in milliseconds - 0 where it cannot be read. */
export function durationOf(element: Element, token: string): number {
  const raw = getComputedStyle(element).getPropertyValue(token).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  return raw.endsWith("ms") ? value : value * 1000;
}

/* Measured against the table, not the viewport: when the page scrolls because
   a fold shortened it, every row would otherwise seem to have moved, and all
   of them travelled. */
const positions = (table: HTMLTableElement): Map<string, number> => {
  const out = new Map<string, number>();
  const origin = table.getBoundingClientRect().top;
  for (const row of Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody > tr[data-motion]"))) {
    out.set(row.dataset.motion!, row.getBoundingClientRect().top - origin);
  }
  return out;
};

/**
 * Moves the lines of a table when `trigger` changes: those that stay travel,
 * those that are new settle in. Between changes it only remembers where the
 * lines stand.
 */
export function useLineMotion(table: RefObject<HTMLTableElement | null>, trigger: string) {
  const last = useRef<{ trigger: string; positions: Map<string, number> } | null>(null);
  useLayoutEffect(() => {
    const element = table.current;
    if (!element) return;
    const now = positions(element);
    const before = last.current;
    last.current = { trigger, positions: now };
    if (!before || before.trigger === trigger) return;
    const duration = durationOf(element, "--u-duration-medium");
    if (duration === 0 || typeof element.animate !== "function") return;
    const easing = getComputedStyle(element).getPropertyValue("--u-ease-out").trim() || "ease-out";
    const moved = deltas(before.positions, now);
    for (const row of Array.from(element.querySelectorAll<HTMLTableRowElement>("tbody > tr[data-motion]"))) {
      const key = row.dataset.motion!;
      const dy = moved.get(key);
      if (dy !== undefined) {
        row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration, easing });
      } else if (!before.positions.has(key)) {
        row.animate([{ opacity: 0, transform: "translateY(-4px)" }, { opacity: 1, transform: "none" }], { duration, easing });
      }
    }
  });
}

/**
 * A count that counts to its new value when it changes - a group header's count while
 * the user filters. Writes into the element directly, so that a running count
 * costs no render; the text the render gives is always the final one.
 */
export function useCountTo(element: RefObject<HTMLElement | null>, value: number, write: (n: number) => string) {
  const shown = useRef(value);
  useLayoutEffect(() => {
    const node = element.current;
    const from = shown.current;
    shown.current = value;
    if (!node || from === value || typeof node.animate !== "function") return;
    const duration = durationOf(node, "--u-duration-medium");
    if (duration === 0) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      node.textContent = write(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => {
      cancelAnimationFrame(frame);
      node.textContent = write(value);
    };
  }, [element, value, write]);
}
