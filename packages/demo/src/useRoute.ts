/* The route: which page the address names, following it as it moves, and the
   landing on the example or anchor it names. */

import { useCallback, useEffect, useState } from "react";
import type { Demo } from "./demo";
import { BASE, hrefOf } from "./href";
import { SCENARIOS, placeOfLocation } from "./outline";

function placeAt(path: string, hash: string): string {
  return placeOfLocation(path.startsWith(BASE) ? path.slice(BASE.length - 1) : "/", hash);
}

function placeHere(): string {
  return placeAt(window.location.pathname, window.location.hash);
}

function readPlace(fromPlace: Demo["addresses"]["fromPlace"]): { pageId: string; example?: string } {
  const { page, example } = fromPlace(placeHere());
  /* An unknown address lands on the scenarios page and not on an empty
     surface: a typo is no reason for a white picture. */
  return { pageId: page?.id ?? "", ...(example === undefined ? {} : { example }) };
}

/** The page and example the address names, the jump counter, and `goTo`,
    which moves there. */
export function useRoute({ addressOf, fromPlace }: Demo["addresses"]) {
  const [place, setPlace] = useState(() => readPlace(fromPlace));
  /* The jump needs a counter of its own. Two examples on the same page one
     after the other do not change the page - an effect hanging only on that
     would not run at all on the second click, and the jump would not happen. */
  const [jump, setJump] = useState(0);

  const goTo = useCallback(
    (pageId: string, exampleId?: string) => {
      window.history.pushState(null, "", hrefOf(addressOf(pageId, exampleId)));
      setPlace(readPlace(fromPlace));
      setJump((n) => n + 1);
    },
    [addressOf, fromPlace],
  );

  useEffect(() => {
    /* An old hash address - a bookmark, a link from before ADR-0037, a
       `#/page` in a page's text - is replaced by its path, so the address bar
       only ever shows the one form. So is the path of a page whose id has
       changed (`MOVED` in the outline): the bar shows the current one. */
    const forward = () => {
      const { page, example, moved } = fromPlace(placeHere());
      if (!window.location.hash.startsWith("#/") && moved === undefined) return;
      window.history.replaceState(null, "", hrefOf(addressOf(page?.id ?? SCENARIOS, example)));
    };
    const onMove = () => {
      forward();
      setPlace(readPlace(fromPlace));
      setJump((n) => n + 1);
    };
    /* A link to a page of this demo moves without a reload - the sidebar's
       entries are such links, with their page's real address. Anything else -
       another demo, `llms.txt` beside this one, a new tab, a modified or
       middle click, "copy link" - is the browser's. */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a");
      if (link === null || link === undefined || link.target !== "" || link.hasAttribute("download")) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith(BASE)) return;
      const place = placeAt(url.pathname, url.hash);
      const { page, example } = fromPlace(place);
      if (place !== "" && page === undefined && example === undefined) return;
      event.preventDefault();
      window.history.pushState(null, "", url.pathname + url.hash);
      onMove();
    };
    forward();
    window.addEventListener("popstate", onMove);
    window.addEventListener("hashchange", onMove);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onMove);
      window.removeEventListener("hashchange", onMove);
      document.removeEventListener("click", onClick);
    };
  }, [addressOf, fromPlace]);

  /* After the change, fetch the example meant and mark it briefly - otherwise
     one lands at the head of a page and starts searching again. */
  useEffect(() => {
    const target = place.example;
    /* An example, a scenario - or another anchor of the page, such as a
       section's heading or a props table's `#type-<Name>`. */
    const example =
      target === undefined ? null : document.querySelector(`[data-example="${target}"], [data-scenario="${target}"]`);
    const el = example ?? (target === undefined ? null : document.getElementById(target));
    if (el === null) {
      /* A page change with no named target starts at the top. Otherwise one
         would stay at the height one was at on the previous page. scrollTop
         rather than window.scrollTo: the same result in the browser, and jsdom
         reports no "not implemented" into every smoke test for it. */
      document.documentElement.scrollTop = 0;
      return;
    }
    /* A fold never hides a target a row
       of a long props table's folded group opens its group first. The
       browser's own opening on a fragment is not relied on - not every engine
       does it, and none does it on a jump without a reload. */
    for (let fold = el.parentElement?.closest("details"); fold; fold = fold.parentElement?.closest("details")) fold.open = true;
    /* scroll-margin-top keeps the sticky header away from the example;
       without it the jump lands a little too high. */
    el.scrollIntoView({ block: "start", behavior: "auto" });
    /* An anchor that names no example is a plain scroll: the reader asked for
       a heading, not for a place to be shown. */
    if (example === null) return;
    /* Attribute off, force layout, attribute on again: otherwise the mark does
       not run a second time on a second jump to the same example. */
    el.removeAttribute("data-highlight");
    void (el as HTMLElement).offsetWidth;
    el.setAttribute("data-highlight", "");
    const t = window.setTimeout(() => el.removeAttribute("data-highlight"), 1400);
    return () => window.clearTimeout(t);
  }, [place.pageId, place.example, jump]);

  return { place, jump, goTo };
}
