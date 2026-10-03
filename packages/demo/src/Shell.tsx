/* The shell of a demo: header bar, sidebar, scenarios page, jump palette.

   It is the same one for all three demos (table-demo decision A, extended to
   charts by ADR-0020); what makes a demo a particular one arrives as `demo`.

   Why no tabs. The pages of a demo fit into no tab bar, and tabs assert ONE
   level while two exist here: rubric and page. What component libraries
   actually use is a standing sidebar with every page in it - a long bar
   scrolls well and keeps the whole library in view.

   The rubric is a HEADING and not a button. It sorts the bar and does nothing
   else: it has no address, no page of its own and no meaning inside the
   library. That is why its name is not in the address either - a page that
   changes rubric must not break a link (CONTEXT.md, "Rubric").

   The shell is built from plain elements and not from the building blocks it
   shows: surroundings made of the exhibit itself blur what is being examined.
   It uses only the design tokens - those are public anyway.

   WITH ONE EXCEPTION, and it stands here so that the next reader does not take
   it for an oversight: the jump palette IS `CommandPalette` from the library.
   It was once a hundred and fifteen lines in this spot, with no module
   boundary, no test, and no way for a user of the package to get the same
   thing (`command-palette` 07).

   The reason for the exception is the kind of fault it finds. Whether a palette
   feels right is not decided by whether it works, but by whether the ranking is
   right, whether the tick stays put while typing, and whether the pointer does
   not take it away from you. None of that is visible on a page photographed
   once; all of it is obvious at the fiftieth Cmd-K. This shell is the only
   place in the repository where something is used daily.

   The rule above still holds for everything else. It has been broken once
   more - "Copy page" in every page head is the library's split button and
   menu (`CopyPage.tsx`) - and not abolished.

   The palette finds pages, scenarios AND examples, examples grouped under
   their component, pages by the words of their lede too - around a hundred
   and eighty candidates, which is nothing for a filtered list. Its worth
   grows with what it can find (.scratch/one-search).

   The front door is the scenarios page (`Scenarios.tsx`): composed screens
   first, the components after them. It stands at the head of the sidebar,
   above the rubrics. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommandPalette, LanguageProvider, useCommandPaletteShortcut } from "@umriss-ui/core";
import type { Demo } from "./demo";
import { BASE, hrefOf } from "./href";
import { SCENARIOS, placeOfLocation, twinOfPlace } from "./outline";
import { PACKAGES } from "./packages";
import { searchEntries, type SearchEntry, type SearchKind } from "./search";
import { Page } from "./Page";
import { Scenarios } from "./Scenarios";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch, ShownGerman, useLanguage, type German } from "./Language";
import { pageTitle } from "./tooling/title";
import { EDIT_LINK, editHref } from "./tooling/edit";

/* The palette's candidates are the search entries (`search.ts`) translated
   into the palette's language (CONTEXT.md, "Finding"): the id IS the entry's
   address, so that choosing has nothing to look up.

   The matcher sorts name finds before group finds before keyword finds.
   Inside one of those tiers the kind decides, broadest first - a page above
   its examples, an example above a prop - in steps far wider than any rank a
   match earns. The own package wins a tie and nothing more: half a point is
   the smallest step between two matches. */
const KIND_WEIGHT: Readonly<Record<SearchKind, number>> = {
  page: 60_000,
  scenario: 50_000,
  example: 40_000,
  export: 30_000,
  prop: 20_000,
  token: 10_000,
  wording: 0,
};
const OWN_PACKAGE_WEIGHT = 0.25;

/** What the palette's empty field says, and the header's search button with
    it: the button promises what the field searches. */
const PALETTE_PLACEHOLDER = "Search pages, examples, props, tokens …";

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

/* The site's root, above every demo's directory: `/umriss-ui/` on the site,
   `/` in the dev server and the test build, where each demo stands alone. */
const SITE = BASE.replace(/[^/]+\/$/, "");

const REPOSITORY = "https://github.com/romanhaendler/umriss-ui";

/** The ways out of the demo: the package's changelog - a static page of the
    site beside its pages, which the click handler leaves to the browser - the
    source, the package on npm, the text for a coding agent. In the header on
    a wide screen, at the foot of the sidebar on a narrow one - so the narrow
    header loses no destination. */
function OutLinks({ npm, where }: { npm: string; where: "head" | "rail" }) {
  const links = [
    {
      label: "Changelog",
      href: `${BASE}changelog/`,
      // A clock: what happened when.
      d: "M5 1a4 4 0 1 0 0 8 4 4 0 1 0 0-8ZM5 2.8V5l1.6 1",
    },
    {
      label: "Source on GitHub",
      href: REPOSITORY,
      // Two angle brackets: code.
      d: "M3.5 2.5 1 5l2.5 2.5M6.5 2.5 9 5 6.5 7.5",
    },
    {
      label: `${npm} on npm`,
      href: `https://www.npmjs.com/package/${npm}`,
      // A box: a package.
      d: "M5 1 9 3v4L5 9 1 7V3ZM1 3l4 2 4-2M5 5v4",
    },
    {
      label: "llms.txt for coding agents",
      href: `${BASE}llms.txt`,
      // A leaf with lines: a text.
      d: "M2 1h4.2L8 2.8V9H2ZM4 4.5h2M4 6.5h2",
    },
  ];
  return (
    <div className={where === "head" ? "shellOut" : "railOut"}>
      {links.map((link) => (
        <a key={link.href} className="shellIcon" href={link.href} aria-label={link.label} title={link.label}>
          <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
            <path d={link.d} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {where === "rail" && <span>{link.label}</span>}
        </a>
      ))}
    </div>
  );
}

export interface ShellProps {
  /** What makes this demo a particular one - its package among the five
      included, which the header reads its name and links from. */
  demo: Demo;
  /** What the demo is - under "Scenarios" on the front page. */
  sentence: string;
  /** The German pair from `@umriss-ui/core/wording/de`, where this demo's
      components read core's language: the header then carries the EN/DE
      switch, and DE renders the examples and the scenarios in it
      (`Language.tsx`). The charts take their words per chart and pass none. */
  german?: German;
}

export function Shell({ demo, sentence, german }: ShellProps) {
  const { OUTLINE, ALL_PAGES, fromPlace, addressOf } = demo.addresses;
  const [place, setPlace] = useState(() => readPlace(fromPlace));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [language, chooseLanguage] = useLanguage();

  /* THE PALETTE'S TWO SOURCES. The package's search fragment is a part of
     the bundle of its own, fetched on the palette's first opening and kept.
     Until it has arrived - or if it never does - the palette searches the
     same pages, scenarios and examples from the outline in hand, so the
     window is never empty and a lost request breaks nothing.

     The other four packages come from the site's index (`search.json` at the
     site's root, `scripts/build-pages.mjs`), fetched on the same first
     opening, without the own package's entries, which the fragment already
     has. A demo standing alone - the dev server, the test build - has no
     site above it and fetches nothing. A failed fetch is silent: the reader
     can do nothing about it, and the own package is still searched. */
  const ownId = demo.packageName.split("/")[1]!;
  const [fragment, setFragment] = useState<readonly SearchEntry[] | null>(null);
  const [elsewhere, setElsewhere] = useState<readonly SearchEntry[] | null>(null);
  useEffect(() => {
    if (!paletteOpen || fragment !== null) return;
    demo.search().then(setFragment, () => {});
  }, [paletteOpen, fragment, demo]);
  useEffect(() => {
    if (!paletteOpen || elsewhere !== null || SITE === BASE) return;
    fetch(`${SITE}search.json`)
      .then((response) => (response.ok ? (response.json() as Promise<SearchEntry[]>) : []))
      .then((entries) => setElsewhere(entries.filter((entry) => !entry.address.startsWith(`/${ownId}/`))))
      .catch(() => setElsewhere([]));
  }, [paletteOpen, elsewhere, ownId]);
  const candidates = useMemo(
    () =>
      [...(fragment ?? searchEntries(ownId, OUTLINE, demo.scenarios, demo.examples)), ...(elsewhere ?? [])].map((entry) => ({
        id: entry.address,
        label: entry.label,
        group: entry.group,
        keywords: entry.keywords,
        weight: KIND_WEIGHT[entry.kind] + (entry.address.startsWith(`/${ownId}/`) ? OWN_PACKAGE_WEIGHT : 0),
      })),
    [fragment, elsewhere, ownId, OUTLINE, demo.scenarios, demo.examples],
  );
  /* The jump needs a counter of its own. Two examples on the same page one
     after the other do not change the page - an effect hanging only on that
     would not run at all on the second click, and the jump would not happen. */
  const [jump, setJump] = useState(0);

  const goTo = useCallback(
    (pageId: string, exampleId?: string) => {
      window.history.pushState(null, "", hrefOf(addressOf(pageId, exampleId)));
      setPlace(readPlace(fromPlace));
      setJump((n) => n + 1);
      setPaletteOpen(false);
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
    /* A fold never hides a target (.scratch/props-table-hygiene, 02): a row
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

  /* THE ACTIVE ENTRY STAYS IN VIEW, on the first load and on every move - and
     when the drawer opens. */
  const railRef = useRef<HTMLElement>(null);
  const narrow = useNarrow();
  useEffect(() => {
    if (railRef.current !== null) activeInView(railRef.current);
  }, [place.pageId, jump, narrow]);

  /* THE DRAWER. At 900 px and less the sidebar does not stand under the page
     but in a modal dialog behind the header's Menu button - the same `rail`
     below, placed there instead of beside the content. The platform's dialog
     holds the focus, closes on Escape and gives the focus back to the button.
     The shell adds the rest: a click on the backdrop closes it, a page chosen
     in it closes it with the focus on the new page's heading - where a screen
     reader announces the arrival - and a window widened past 900 px closes
     it, since the standing sidebar takes over. Plain elements, not the
     library's `Drawer`: the rule at the top of this file. */
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

  /* Cmd-K/Ctrl+K as everywhere, "/" as in every documentation - including the
     rule that "/" in a text field stays a slash. That once stood here by hand;
     it belongs to the shortcut and now travels with it. */
  useCommandPaletteShortcut(useCallback(() => setPaletteOpen(true), []));

  const page = ALL_PAGES.find((p) => p.id === place.pageId);

  /* THE HEAD FOLLOWS THE PAGE - the one place that does it, on the first
     load and on every move: the title, by the formula the prerendering writes
     it with, and the one alternate link to the page's Markdown twin
     (.scratch/pages-as-markdown), which the prerendering writes as well and a
     page outside it lacks. An example anchor changes neither: it stands in
     its page's text. */
  const title = pageTitle({ name: demo.packageName, description: demo.description }, page?.name);
  const twin = hrefOf(twinOfPlace(page === undefined ? "" : `/${page.id}`));
  useEffect(() => {
    document.title = title;
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="alternate"][type="text/markdown"]');
    if (link === null) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.type = "text/markdown";
      document.head.append(link);
    }
    link.setAttribute("href", twin);
  }, [title, twin]);

  const rail = (
    <nav className="rail" aria-label="Components" ref={railRef}>
      <a
        className="railEntry railScenarios"
        href={BASE}
        data-active={page === undefined ? "" : undefined}
        aria-current={page === undefined ? "page" : undefined}
      >
        Scenarios
      </a>
      {OUTLINE.map((rubric) => (
        <div className="railRubric" key={rubric.id}>
          <h2 className="railHead">
            <span>{rubric.name}</span>
            <span className="railCount">{rubric.pages.length}</span>
          </h2>
          <ul className="railList">
            {rubric.pages.map((entry) => (
              <li key={entry.id}>
                <a
                  className="railEntry"
                  href={hrefOf(addressOf(entry.id))}
                  data-active={place.pageId === entry.id ? "" : undefined}
                  aria-current={place.pageId === entry.id ? "page" : undefined}
                >
                  {entry.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <OutLinks npm={demo.packageName} where="rail" />
    </nav>
  );

  return (
    <ShownGerman.Provider value={language === "de" ? german : undefined}>
      <div className="shell">
        {/* One bar for every page of every demo: the way to the front page, to
            the four other packages and out of the site. The wordmark and the
            other packages leave this demo, so they are plain links and a full
            load; the current package's link is a link into this demo, which the
            click handler above moves without one. */}
        <header className="shellHead">
          <button
            type="button"
            className="shellIcon shellMenu"
            aria-label="Menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={openDrawer}
          >
            <svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true">
              <path d="M1.5 2.5h7M1.5 5h7M1.5 7.5h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <a className="shellMark" href={SITE}>
            umriss-ui
          </a>
          <nav className="shellPackages" aria-label="Packages">
            {PACKAGES.map((pkg) =>
              pkg.npm === demo.packageName ? (
                <a key={pkg.id} className="shellPackage" href={BASE} aria-current="page">
                  {pkg.name}{" "}
                  <span className="shellVersion">{demo.version}</span>
                </a>
              ) : (
                <a key={pkg.id} className="shellPackage" href={`${SITE}${pkg.id}/`}>
                  {pkg.name}
                </a>
              ),
            )}
          </nav>
          <button
            type="button"
            className="shellSearch"
            onClick={() => setPaletteOpen(true)}
            aria-haspopup="dialog"
          >
            <span>{PALETTE_PLACEHOLDER}</span>
            <kbd className="shellKbd">⌘K</kbd>
          </button>
          <div className="shellActions">
            {german !== undefined && <LanguageSwitch language={language} onChoose={chooseLanguage} />}
            <ThemeSwitch />
            <OutLinks npm={demo.packageName} where="head" />
          </div>
        </header>

        <div className="shellBody">
          {!narrow && rail}

          <main className="shellContent">
            {page === undefined ? (
              <Scenarios demo={demo} sentence={sentence} />
            ) : (
              <Page key={page.id} demo={demo} page={page} />
            )}
            {/* Under every page, the scenarios page too: an issue that names the
                page - its title, and its address without an example's anchor. */}
            <p className="pageEdit">
              <a href={editHref(title, new URL(page === undefined ? BASE : hrefOf(addressOf(page.id)), window.location.href).href)}>
                {EDIT_LINK}
              </a>
            </p>
          </main>
        </div>

        {/* A click on the dialog itself is one on its backdrop: the sidebar
            fills the dialog to its edges. */}
        <dialog
          ref={drawerRef}
          className="shellDrawer"
          aria-label="Menu"
          onClose={() => setDrawerOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
        >
          {narrow && rail}
        </dialog>

        {/* The library's wording is general ("search", "open"); this demo jumps
            anywhere in umriss-ui and says so. That is exactly what the seam is
            for - the component need not be touched for it. */}
        <LanguageProvider
          wording={{
            palettePlaceholder: PALETTE_PLACEHOLDER,
            paletteField: "Search umriss-ui",
            palettePanel: "Jump anywhere in umriss-ui",
            paletteList: "Found",
            paletteHintChoose: "jump",
          }}
        >
          <CommandPalette
            open={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            items={candidates}
            onChoose={(address) => {
              /* Another package's find is that demo's page, a full navigation:
                 the site keeps it in a directory beside this one. */
              if (!address.startsWith(`/${ownId}/`)) {
                window.location.assign(`${SITE}${address.slice(1)}`);
                return;
              }
              /* An own one is split with the same functions that split the
                 address bar - not with a `split` beside them - and jumps in
                 place. */
              const [path = "/", hash = ""] = address.slice(ownId.length + 1).split("#");
              const { page: target, example } = fromPlace(placeOfLocation(path, hash));
              goTo(target?.id ?? SCENARIOS, example);
            }}
          />
        </LanguageProvider>
      </div>
    </ShownGerman.Provider>
  );
}
