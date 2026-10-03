/* "On this page": what stands on a page, with the part the reader is in
   marked (page-orientation 01).

   The entries come from the page's own data, the same the page renders - a
   new example or section appears here without anyone editing a list. This
   file only places them: from 1300 px a sticky column beside the page,
   narrower a closed disclosure right after the page head. Both are rendered
   and the stylesheet shows one (page.css, also why 1300); they share the
   one mark.

   The links are ordinary addresses. An example's is its own address, which
   the shell turns into the jump with the brief mark; a section's is its
   anchor, which the shell scrolls to and leaves unmarked.

   The mark follows the reader: the last entry whose top has passed a line a
   quarter down the window, and the last entry once the page is scrolled to
   its end, so a short final section can be marked too. Observers drive it,
   not a scroll handler measuring every frame. It is held outside the page's
   state: a moved mark re-renders the two lists, not every example. */

import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

export interface ContentsEntry {
  label: string;
  href: string;
  /** The element the entry stands for, as a selector - what the mark watches. */
  target: string;
  /** Indented, under the entry before it. */
  sub?: true;
  /** A type's name, set as code. */
  code?: true;
}

/** The sticky header's height; the band the mark watches starts below it. */
const HEADER = 56;

interface Mark {
  get: () => number;
  set: (index: number) => void;
  subscribe: (listener: () => void) => () => void;
}

function newMark(): Mark {
  let current = 0;
  const listeners = new Set<() => void>();
  return {
    get: () => current,
    set: (index) => {
      if (index === current) return;
      current = index;
      for (const listener of listeners) listener();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function List({ entries, mark }: { entries: readonly ContentsEntry[]; mark: Mark }) {
  const current = useSyncExternalStore(mark.subscribe, mark.get, mark.get);
  return (
    <ul className="contentsList">
      {entries.map((entry, i) => (
        <li key={entry.target}>
          <a
            href={entry.href}
            data-sub={entry.sub === true ? "" : undefined}
            aria-current={i === current ? "location" : undefined}
          >
            {entry.code === true ? <code>{entry.label}</code> : entry.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The two places of "On this page": the disclosure, which the page sets
    right after its head, and the column, which it sets last. The column
    stands beside the page and not in its flow, and it brings the mark for
    the page's end along. */
export function useContents(entries: readonly ContentsEntry[]): { disclosure: ReactNode; column: ReactNode } {
  const end = useRef<HTMLDivElement>(null);
  const [mark] = useState(newMark);
  const label = useId();
  const key = entries.map((entry) => entry.target).join("\n");

  useEffect(() => {
    const sentinel = end.current;
    /* jsdom has no IntersectionObserver; the smoke tests render without it. */
    if (typeof IntersectionObserver === "undefined" || sentinel === null) return;
    const targets = key.split("\n").map((selector) => document.querySelector(selector));
    let atEnd = false;
    const update = () => {
      const line = window.innerHeight / 4;
      let found = 0;
      targets.forEach((el, i) => {
        if (el !== null && el.getBoundingClientRect().top <= line) found = i;
      });
      mark.set(atEnd && window.scrollY > 0 ? targets.length - 1 : found);
    };
    /* Two observers, one answer. The band from the header to the line fires
       when a top crosses the line; the window fires when an entry enters or
       leaves it at all - a dragged scrollbar can carry a heading across the
       band between two frames, never across the whole window. */
    const band = new IntersectionObserver(update, { rootMargin: `-${HEADER}px 0px -75% 0px` });
    const view = new IntersectionObserver((records) => {
      for (const record of records) if (record.target === sentinel) atEnd = record.isIntersecting;
      update();
    });
    for (const el of targets) {
      if (el === null) continue;
      band.observe(el);
      view.observe(el);
    }
    view.observe(sentinel);
    return () => {
      band.disconnect();
      view.disconnect();
    };
  }, [key, mark]);

  return {
    disclosure: (
      <details className="contentsDisclosure">
        <summary>On this page</summary>
        <nav aria-label="On this page">
          <List entries={entries} mark={mark} />
        </nav>
      </details>
    ),
    column: (
      <>
        <nav className="contentsColumn" aria-labelledby={label}>
          <div className="contentsSticky">
            <p className="contentsLabel" id={label}>
              On this page
            </p>
            <List entries={entries} mark={mark} />
          </div>
        </nav>
        <div className="pageEnd" ref={end} />
      </>
    ),
  };
}
