/* Measuring: each card's content, which the deck never cuts, observed once per
   card. */
import { useCallback, useEffect, useRef, useState } from "react";

export function useCardMeasure() {
  /* The observed content element of each card. */
  const observed = useRef(new Map<number, HTMLElement>());
  const observer = useRef<ResizeObserver | null>(null);
  const [heights, setHeights] = useState<Record<number, number>>({});

  /** Lets go of a card that is gone. */
  const forget = useCallback((id: number) => {
    const element = observed.current.get(id);
    if (element) observer.current?.unobserve(element);
    observed.current.delete(id);
    setHeights((current) => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== id)));
  }, []);

  const measure = useCallback((id: number, height: number) => {
    setHeights((current) => (current[id] === height ? current : { ...current, [id]: height }));
  }, []);
  /** One stable ref for every card's content; the card says which it is. A
      card that moves to the other live region mounts anew, and the element it
      leaves behind is let go. */
  const measureRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      const id = Number(element.dataset.toast);
      const before = observed.current.get(id);
      if (before === element) return;
      if (before) observer.current?.unobserve(before);
      observed.current.set(id, element);
      measure(id, element.offsetHeight);
      if (typeof ResizeObserver === "undefined") return;
      /* The border box, unrounded and untransformed: offsetHeight rounds,
         and eight pixels of gap became 7.6. */
      observer.current ??= new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          measure(Number(target.dataset.toast), entry.borderBoxSize?.[0]?.blockSize ?? target.offsetHeight);
        }
      });
      observer.current.observe(element);
    },
    [measure],
  );
  useEffect(() => () => observer.current?.disconnect(), []);

  return { heights, measureRef, forget };
}
