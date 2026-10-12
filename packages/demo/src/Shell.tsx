/* The shell of a demo: header bar, sidebar, scenarios page, jump palette.

   It is the same one for all five demos (ADR-0020); what makes a demo a particular one arrives as `demo`.

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
   A palette written here would have no module boundary, no test, and no way
   for a user of the package to get the same thing.

   The reason for the exception is the kind of fault it finds. Whether a palette
   feels right is not decided by whether it works, but by whether the ranking is
   right, whether the tick stays put while typing, and whether the pointer does
   not take it away from you. None of that is visible on a page photographed
   once; all of it is obvious at the fiftieth Cmd-K. This shell is the only
   place in the repository where something is used daily.

   The rule above still holds for everything else. It has been broken once
   more - "Copy page" in every page head is the library's split button and
   menu (`CopyPage.tsx`).

   The palette finds pages, scenarios AND examples, examples grouped under
   their component, pages by the words of their lede too - around a hundred
   and eighty candidates, which is nothing for a filtered list. Its worth
   grows with what it can find.

   The front door is the scenarios page (`Scenarios.tsx`): composed screens
   first, the components after them. It stands at the head of the sidebar,
   above the rubrics. */

import { useCallback, useState } from "react";
import { CommandPalette, LanguageProvider, useCommandPaletteShortcut } from "@umriss-ui/core";
import type { Demo } from "./demo";
import { BASE, hrefOf } from "./href";
import { SCENARIOS, placeOfLocation } from "./outline";
import { PACKAGES } from "./packages";
import { useDocumentHead } from "./useDocumentHead";
import { useDrawer } from "./useDrawer";
import { usePaletteSearch } from "./usePaletteSearch";
import { useRoute } from "./useRoute";
import { Page } from "./Page";
import { Scenarios } from "./Scenarios";
import { ThemeSwitch } from "./ThemeSwitch";
import { LanguageSwitch, ShownGerman, useLanguage, type German } from "./Language";
import { EDIT_LINK, editHref } from "./tooling/edit";

/* The most finds the palette draws: a single letter finds a few thousand
   across five packages, and drawing them all made every keystroke wait. The
   best fifty and a line saying how many more - typing on narrows them. */
const MAX_FINDS = 50;

/** What the palette's empty field says, and the header's search button with
    it: the button promises what the field searches. */
const PALETTE_PLACEHOLDER = "Search pages, examples, props, tokens …";

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
  const ownId = demo.packageName.split("/")[1]!;
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [language, chooseLanguage] = useLanguage();

  /* The hooks stand in the order their effects must run in: the palette's
     fetches, the route (address, then landing on the target), the drawer
     (closing on a move, which follows the route's landing and its focus) and
     the head. */
  const candidates = usePaletteSearch(demo, paletteOpen, SITE);
  const { place, jump, goTo } = useRoute(demo.addresses);
  const { railRef, drawerRef, drawerOpen, setDrawerOpen, openDrawer, narrow } = useDrawer(place, jump);

  /* Cmd-K/Ctrl+K as everywhere, "/" as in every documentation - including the
     rule that "/" in a text field stays a slash. */
  useCommandPaletteShortcut(useCallback(() => setPaletteOpen(true), []));

  const page = ALL_PAGES.find((p) => p.id === place.pageId);
  const title = useDocumentHead(demo, page);

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
    <ShownGerman value={language === "de" ? german : undefined}>
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
            maxFinds={MAX_FINDS}
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
              setPaletteOpen(false);
            }}
          />
        </LanguageProvider>
      </div>
    </ShownGerman>
  );
}
