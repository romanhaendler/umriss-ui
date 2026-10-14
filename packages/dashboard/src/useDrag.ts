/* The drag of a widget by its head: take, carry, update, finish, the page's
   scrolling at the window's edge, the card following the pointer and the
   others' short move to their new places (ADR-0064). */

import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import type { SizeSpan } from "./model";
import { nearestPlace } from "./pack";

/** A widget as the drag sees it: in the order drawn. */
export interface Dragged {
  id: string;
  span: SizeSpan;
  title: string;
}

interface Gesture {
  id: string;
  from: number;
  x0: number;
  y0: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  started: boolean;
  target: number;
}

/** What the drag needs: the grid, the widgets' elements by id, the widgets in
    drawn order, and what to do at a drop and at a cancel. */
export interface DragOptions {
  grid: RefObject<HTMLDivElement | null>;
  cards: ReadonlyMap<string, HTMLElement>;
  shown: ReadonlyArray<Dragged>;
  /** The widget `id` was dropped at the place of the widget `onto`. */
  drop: (id: string, onto: string) => void;
  /** A drag that had started was cancelled. */
  cancelled: (title: string) => void;
}

/** A drag shows the candidate order; the elements stay in the document in the
    stored order (a move in the DOM would end the pointer's capture), so the
    order the list form draws is the CSS `order`. */
export function useDrag({ grid, cards, shown, drop, cancelled }: DragOptions) {
  const [drag, setDrag] = useState<{ id: string; target: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const running = useRef<{ timer?: number; escape?: (event: globalThis.KeyboardEvent) => void }>({});
  const positions = useRef(new Map<string, [number, number]>());
  const placeholder = useRef<HTMLDivElement>(null);
  const latest = useRef<{ update: () => void; finish: (keep: boolean) => void }>({ update: () => {}, finish: () => {} });

  /* The dragged card stays in its landing place and is moved from there by a
     transform to where it is held; the placeholder marks that place. */
  const follow = () => {
    const g = gesture.current;
    const card = g && cards.get(g.id);
    if (!g || !placeholder.current || !card) return;
    const box = placeholder.current.getBoundingClientRect();
    card.style.transform = `translate(${g.x - g.dx - box.left}px, ${g.y - g.dy - box.top}px)`;
  };

  useLayoutEffect(() => {
    const next = new Map<string, [number, number]>();
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const [id, el] of cards) {
      const before = positions.current.get(id);
      next.set(id, [el.offsetLeft, el.offsetTop]);
      if (drag && !calm && before && id !== drag.id && (before[0] !== el.offsetLeft || before[1] !== el.offsetTop)) {
        el.animate([{ transform: `translate(${before[0] - el.offsetLeft}px, ${before[1] - el.offsetTop}px)` }, { transform: "none" }], { duration: 150, easing: "ease-out" });
      }
    }
    positions.current = next;
    if (drag) follow();
  });

  /* Where the held corner is now, as the place it is nearest to. */
  const update = () => {
    const g = gesture.current;
    const host = grid.current;
    const card = g && cards.get(g.id);
    if (!g || !host || !card) return;
    const style = getComputedStyle(host);
    const gap = parseFloat(style.columnGap);
    const tracks = style.gridTemplateColumns.split(" ").length;
    const rect = host.getBoundingClientRect();
    const span = shown[g.from]!.span;
    const geometry = { cell: (rect.width - (tracks - 1) * gap) / tracks, gap, unit: (card.offsetHeight - (span.rows - 1) * gap) / span.rows };
    const target = nearestPlace(shown.map((one) => one.span), tracks, g.from, g.x - g.dx - rect.left, g.y - g.dy - rect.top, geometry);
    if (target === g.target) return follow();
    g.target = target;
    setDrag({ id: g.id, target });
  };

  const finish = (keep: boolean) => {
    const g = gesture.current;
    gesture.current = null;
    window.clearInterval(running.current.timer);
    if (running.current.escape) document.removeEventListener("keydown", running.current.escape);
    if (g) cards.get(g.id)?.style.removeProperty("transform");
    setDrag(null);
    if (!g?.started) return;
    if (!keep) return cancelled(shown[g.from]!.title);
    drop(g.id, shown[g.target]!.id);
  };

  useLayoutEffect(() => {
    latest.current = { update, finish };
  });

  const take = (id: string, from: number) => (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (event.button > 0 || target.closest("button") || !event.currentTarget.contains(target)) return;
    const card = cards.get(id)!.getBoundingClientRect();
    gesture.current = { id, from, x0: event.clientX, y0: event.clientY, x: event.clientX, y: event.clientY, dx: event.clientX - card.left, dy: event.clientY - card.top, started: false, target: from };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const carry = (event: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    g.x = event.clientX;
    g.y = event.clientY;
    if (!g.started) {
      if (Math.hypot(g.x - g.x0, g.y - g.y0) <= 4) return;
      g.started = true;
      setDrag({ id: g.id, target: g.from });
      running.current.escape = (e) => e.key === "Escape" && latest.current.finish(false);
      document.addEventListener("keydown", running.current.escape);
      /* Near the window's top or bottom edge the page scrolls, faster the closer. */
      running.current.timer = window.setInterval(() => {
        const edge = 64;
        const y = gesture.current?.y ?? window.innerHeight / 2;
        const speed = Math.ceil((edge - Math.min(y, window.innerHeight - y)) / 4);
        if (speed <= 0) return;
        window.scrollBy(0, y < window.innerHeight / 2 ? -speed : speed);
        latest.current.update();
      }, 16);
    }
    latest.current.update();
  };

  return {
    drag,
    /** To go on the placeholder. */
    placeholder,
    /** The pointer handlers of a widget's head. */
    handlers: (id: string, from: number) => ({
      onPointerDown: take(id, from),
      onPointerMove: carry,
      onPointerUp: () => latest.current.finish(true),
      onPointerCancel: () => latest.current.finish(false),
    }),
  };
}
