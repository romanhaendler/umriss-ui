/* The shell of a demo: header bar, sidebar, overview, jump palette.

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

   The rule above still holds for everything else. It has been broken once and
   not abolished.

   The palette finds pages AND examples, examples grouped under their component
   - around a hundred and eighty candidates, which is nothing for a filtered
   list. Its worth grows with what it can find. */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CommandPalette, LanguageProvider, useCommandPaletteShortcut } from "@umriss-ui/core";
import type { Demo } from "./demo";
import type { Rubric, Page as PageData } from "./outline";
import { Page } from "./Page";

/* The palette's candidates: the flat view of the outline and the run of
   example files, translated into the palette's language (CONTEXT.md,
   "Finding"). Two lists beside each other would drift apart - so they come
   from there.

   The id IS the place, so that choosing has nothing to look up - and it comes
   from `placeOf()` and not from a template here. One spot knows the format;
   whoever rebuilds it holds a second truth about it. */
function paletteCandidates({ addresses, examples }: Demo) {
  const { ALL_PAGES, placeOf } = addresses;
  return [
    ...ALL_PAGES.map((page) => ({
      id: placeOf(page.id),
      label: page.name,
      group: page.rubric.name,
    })),
    ...examples.map((example) => {
      const page = ALL_PAGES.find((p) => p.id === example.pageId);
      return {
        id: placeOf(example.pageId, example.id),
        label: example.title,
        group: page?.name ?? example.pageId,
      };
    }),
  ];
}

function readPlace(fromAddress: Demo["addresses"]["fromAddress"]): { pageId: string; example?: string } {
  const { page, example } = fromAddress(window.location.hash);
  /* An unknown address lands on the overview and not on an empty surface: a
     typo is no reason for a white picture. */
  return { pageId: page?.id ?? "", ...(example === undefined ? {} : { example }) };
}

export interface ShellProps {
  /** What makes this demo a particular one. */
  demo: Demo;
  brand: string;
  version: string;
  title: string;
  sentence: string;
  /** On the right of the header, e.g. the theme switch. */
  actions?: ReactNode;
}

export function Shell({ demo, brand, version, title, sentence, actions }: ShellProps) {
  const { OUTLINE, ALL_PAGES, fromAddress, placeOf } = demo.addresses;
  const candidates = useMemo(() => paletteCandidates(demo), [demo]);
  const [place, setPlace] = useState(() => readPlace(fromAddress));
  const [paletteOpen, setPaletteOpen] = useState(false);
  /* The jump needs a counter of its own. Two examples on the same page one
     after the other do not change the page - an effect hanging only on that
     would not run at all on the second click, and the jump would not happen. */
  const [jump, setJump] = useState(0);

  useEffect(() => {
    const onHash = () => {
      setPlace(readPlace(fromAddress));
      setJump((n) => n + 1);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [fromAddress]);

  const goTo = useCallback(
    (pageId: string, exampleId?: string) => {
      window.location.hash = placeOf(pageId, exampleId);
      setPaletteOpen(false);
    },
    [placeOf],
  );

  /* After the change, fetch the example meant and mark it briefly - otherwise
     one lands at the head of a page and starts searching again. */
  useEffect(() => {
    const target = place.example;
    const el = target === undefined ? null : document.querySelector(`[data-example="${target}"]`);
    if (el === null) {
      /* A page change with no named target starts at the top. Otherwise one
         would stay at the height one was at on the previous page. scrollTop
         rather than window.scrollTo: the same result in the browser, and jsdom
         reports no "not implemented" into every smoke test for it. */
      document.documentElement.scrollTop = 0;
      return;
    }
    /* scroll-margin-top keeps the sticky header away from the example;
       without it the jump lands a little too high. */
    el.scrollIntoView({ block: "start", behavior: "auto" });
    /* Attribute off, force layout, attribute on again: otherwise the mark does
       not run a second time on a second jump to the same example. */
    el.removeAttribute("data-highlight");
    void (el as HTMLElement).offsetWidth;
    el.setAttribute("data-highlight", "");
    const t = window.setTimeout(() => el.removeAttribute("data-highlight"), 1400);
    return () => window.clearTimeout(t);
  }, [place.pageId, place.example, jump]);

  /* Cmd-K/Ctrl+K as everywhere, "/" as in every documentation - including the
     rule that "/" in a text field stays a slash. That once stood here by hand;
     it belongs to the shortcut and now travels with it. */
  useCommandPaletteShortcut(useCallback(() => setPaletteOpen(true), []));

  const page = ALL_PAGES.find((p) => p.id === place.pageId);

  return (
    <div className="shell">
      <header className="shellHead">
        <a
          className="shellMark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
            setPlace({ pageId: "" });
          }}
        >
          <span className="shellMarkName">{brand}</span>
          <span className="shellVersion">{version}</span>
        </a>
        <button
          type="button"
          className="shellSearch"
          onClick={() => setPaletteOpen(true)}
          aria-haspopup="dialog"
        >
          <span>Search …</span>
          <kbd className="shellKbd">⌘K</kbd>
        </button>
        <div className="shellActions">{actions}</div>
      </header>

      <div className="shellBody">
        <nav className="rail" aria-label="Components">
          {OUTLINE.map((rubric) => (
            <div className="railRubric" key={rubric.id}>
              <h2 className="railHead">
                <span>{rubric.name}</span>
                <span className="railCount">{rubric.pages.length}</span>
              </h2>
              <ul className="railList">
                {rubric.pages.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="railEntry"
                      data-active={place.pageId === entry.id ? "" : undefined}
                      aria-current={place.pageId === entry.id ? "page" : undefined}
                      onClick={() => goTo(entry.id)}
                    >
                      {entry.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <main className="shellContent">
          {page === undefined ? (
            <Overview
              outline={OUTLINE}
              pageCount={ALL_PAGES.length}
              exampleCount={demo.examples.length}
              brand={brand}
              title={title}
              sentence={sentence}
              goTo={goTo}
            />
          ) : (
            <Page key={page.id} demo={demo} page={page} />
          )}
        </main>
      </div>

      {/* The library's wording is general ("search", "open"); this demo jumps to
          pages and examples and says so. That is exactly what the seam is for -
          the component need not be touched for it. */}
      <LanguageProvider
        wording={{
          palettePlaceholder: "Search a page or example …",
          paletteField: "Search a page or example",
          palettePanel: "Jump to a page or example",
          paletteList: "Pages and examples found",
          paletteHintChoose: "jump",
        }}
      >
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          items={candidates}
          onChoose={(id) => {
            /* Split with the same function that splits the address bar - not
               with a `split` beside it. */
            const { page: target, example } = fromAddress(id);
            if (target !== undefined) goTo(target.id, example);
          }}
        />
      </LanguageProvider>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The overview - the front door.                                      */
/*                                                                     */
/* It answers the question a sidebar does not: what is actually in     */
/* here. The rubrics with their chips do that, with a few sentences,   */
/* better than a grid of thumbnails. It is itself a page for           */
/* photographing, so that the shell is not the only unchecked part of  */
/* the demo.                                                           */
/* ------------------------------------------------------------------ */

function Overview({
  outline,
  pageCount,
  exampleCount,
  brand,
  title,
  sentence,
  goTo,
}: {
  outline: readonly (Rubric & { pages: readonly PageData[] })[];
  pageCount: number;
  exampleCount: number;
  brand: string;
  title: string;
  sentence: string;
  goTo: (page: string, example?: string) => void;
}) {
  return (
    <section className="overview" data-block="overview" aria-labelledby="overview-title">
      <p className="overviewEyebrow">{brand}</p>
      <h1 className="overviewTitle" id="overview-title">
        {title}
      </h1>
      <p className="overviewSentence">{sentence}</p>
      <p className="overviewCount">
        <strong>{pageCount}</strong> pages in {outline.length} rubrics,{" "}
        <strong>{exampleCount}</strong> examples
      </p>
      <ul className="overviewGrid">
        {outline.map((rubric, i) => (
          <li key={rubric.id}>
            <div className="rubricCard">
              <span className="rubricCardRank">{String(i + 1).padStart(2, "0")}</span>
              <span className="rubricCardName">{rubric.name}</span>
              <span className="rubricCardSentence">{rubric.sentence}</span>
              <span className="rubricCardChips">
                {rubric.pages.map((s) => (
                  <button
                    type="button"
                    className="rubricCardChip"
                    key={s.id}
                    onClick={() => goTo(s.id)}
                  >
                    {s.name}
                  </button>
                ))}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
