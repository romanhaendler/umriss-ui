/* The sidebar's two shapes: standing beside the page, or a modal drawer on a
   narrow screen; and the active entry kept in view in both. */

import { useEffect, useRef, useState } from "react";

/** Brings the sidebar's active entry into the middle of its visible box when
    it stands outside it, by scrolling the sidebar alone - `scrollIntoView`
    would move the page as well. Where the sidebar does not scroll nothing
    moves. */
function activeInView(rail: HTMLElement) {
  const entry = rail.querySelector('[aria-current="page"]');
  if (entry === null) return;
  const box = rail.getBoundingClientRect();
  const at = entry.getBoundingClientRect();
  if (at.top >= box.top && at.bottom <= box.bottom) return;
  rail.scrollTop += at.top - box.top - (rail.clientHeight - at.height) / 2;
}

/* The width at which the sidebar becomes a drawer - the same query as in
   shell.css. */
const NARROW = "(max-width: 900px)";

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW).matches);
  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const follow = () => setNarrow(query.matches);
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, []);
  return narrow;
}

/* THE ACTIVE ENTRY STAYS IN VIEW, on the first load and on every move - and
   when the drawer opens.

   THE DRAWER. At 900 px and less the sidebar does not stand under the page
   but in a modal dialog behind the header's Menu button - the same `rail`
   the shell builds, placed there instead of beside the content. The platform's
   dialog holds the focus, closes on Escape and gives the focus back to the
   button. The shell adds the rest: a click on the backdrop closes it, a page
   chosen in it closes it with the focus on the new page's heading - where a
   screen reader announces the arrival - and a window widened past 900 px
   closes it, since the standing sidebar takes over. Plain elements, not the
   library's `Drawer`: the rule at the top of Shell.tsx.

   `place` and `jump` are the route's: a move closes the drawer. */
export function useDrawer(place: { pageId: string; example?: string }, jump: number) {
  const railRef = useRef<HTMLElement>(null);
  const narrow = useNarrow();
  useEffect(() => {
    if (railRef.current !== null) activeInView(railRef.current);
  }, [place.pageId, jump, narrow]);

  const drawerRef = useRef<HTMLDialogElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => {
    const drawer = drawerRef.current;
    const rail = railRef.current;
    if (drawer === null || rail === null) return;
    drawer.showModal();
    setDrawerOpen(true);
    activeInView(rail);
    rail.querySelector<HTMLElement>('[aria-current="page"]')?.focus({ preventScroll: true });
  };
  /* Any move while the drawer is open was chosen in it: the drawer is modal. */
  useEffect(() => {
    const drawer = drawerRef.current;
    if (drawer === null || !drawer.open) return;
    drawer.close();
    document.querySelector<HTMLElement>(".shellContent h1")?.focus({ preventScroll: true });
  }, [place.pageId, place.example, jump]);
  useEffect(() => {
    if (!narrow && drawerRef.current?.open === true) drawerRef.current.close();
  }, [narrow]);
  return { railRef, drawerRef, drawerOpen, setDrawerOpen, openDrawer, narrow };
}
