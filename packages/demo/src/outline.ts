/* The shape of an outline, and the addresses that follow from it.

   Every demo writes its own outline - rubrics, pages, one sentence per page,
   the props types and the import line. What stands here is what all outlines
   have in common: their shape and the format of their addresses.

   About the address. It is single-segment: `#/button`. The rubric is
   deliberately NOT in it. A rubric sorts the sidebar and means nothing inside
   the library; were it in the address, every re-sorting of the sidebar would
   break every link (CONTEXT.md, "Rubric"). Component names are unique within a
   package, so one segment is enough.

   This file runs without a bundler too: the props generator loads a demo's
   outline in Node. That is why it imports nothing. */

export interface Page {
  /** The page's address: the component name, lower-cased. */
  id: string;
  /** The name the component is looked up under. */
  name: string;
  /** One sentence: what the component is for - not what it is made of. */
  sentence: string;
  /** The props types whose tables stand on this page, in the order they
      appear there. */
  types: readonly string[];
  /** What the import line in the page head shows.

      Not derived from `types`, although it almost fitted: `TabList` has no
      props of its own, `useToast` is not a type, and a table carries names of
      which a reader imports only some. What one takes and what is documented
      are two questions. */
  exports: readonly string[];
}

export interface Rubric {
  id: string;
  name: string;
  /** One sentence saying what the rubric is for - not what it contains. */
  sentence: string;
  pages: readonly Page[];
}

export type PageWithRubric = Page & { rubric: Rubric };

export interface Addresses {
  OUTLINE: readonly Rubric[];
  /** Every page with its rubric - the flat view for palette and tests. */
  ALL_PAGES: readonly PageWithRubric[];
  /** The place of a page, optionally with an example on it - as it stands
      behind the `#`.

      The only place that knows the format. Whoever bypasses it holds a second
      truth about the same address; a `.replace()` on the result is one too. */
  placeOf: (pageId: string, exampleId?: string) => string;
  /** The same address as a whole - for `page.goto()` and for an `href`. */
  addressOf: (pageId: string, exampleId?: string) => string;
  /** The page for an address, and the example named in it.

      An unknown address yields no page - the shell then shows the overview and
      not an empty surface. */
  fromAddress: (hash: string) => { page?: PageWithRubric; example?: string };
}

/** The addresses of an outline. */
export function addresses(outline: readonly Rubric[]): Addresses {
  const ALL_PAGES: readonly PageWithRubric[] = outline.flatMap((rubric) =>
    rubric.pages.map((page) => ({ ...page, rubric })),
  );

  const placeOf = (pageId: string, exampleId?: string): string => {
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return "";
    return exampleId === undefined ? `/${page.id}` : `/${page.id}/${exampleId}`;
  };

  const addressOf = (pageId: string, exampleId?: string): string => {
    const place = placeOf(pageId, exampleId);
    return place === "" ? "/" : `/#${place}`;
  };

  const fromAddress = (hash: string): { page?: PageWithRubric; example?: string } => {
    const raw = hash.replace(/^#/, "").replace(/^\//, "");
    if (raw === "") return {};
    const [pageId, exampleId] = raw.split("/");
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return {};
    return exampleId === undefined || exampleId === "" ? { page } : { page, example: exampleId };
  };

  return { OUTLINE: outline, ALL_PAGES, placeOf, addressOf, fromAddress };
}
