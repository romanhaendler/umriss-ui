/* The shape of an outline, and the addresses that follow from it.

   Every demo writes its own outline - rubrics, pages, one sentence per page,
   the props types and the import line. What stands here is what all outlines
   have in common: their shape and the format of their addresses.

   About the address. It is a path of one segment: `/button/`, an example on
   the page an anchor, `/button/#basic` (ADR-0037 - a search engine reads no
   hash, so the hash `#/button` it once was only forwards now). The rubric is
   deliberately NOT in it. A rubric sorts the sidebar and means nothing inside
   the library; were it in the address, every re-sorting of the sidebar would
   break every link (CONTEXT.md, "Rubric"). Component names are unique within a
   package, so one segment is enough.

   The texts of a page - lede, about, alternatives, keys, limits - are plain
   strings with two marks: `code` in backticks and a [link](#/page). The demo
   renders them, turning `#/page` into the page's address; the llms text
   carries them as they are.

   The scenarios page opens every demo. It is no page of the outline: it
   stands at `/`, a scenario on it at `/#<anchor>`. Its place - what the
   palette and `fromPlace` speak - is `/scenarios/<anchor>` all the same.

   This file runs without a bundler too: the props generator loads a demo's
   outline in Node. That is why it imports nothing. */

export interface Page {
  /** The page's address: the component name, lower-cased. */
  id: string;
  /** The name the component is looked up under. */
  name: string;
  /** The lede: what it does for the user of the screen and when to reach
      for it, synonyms once - up to ~60 words, no praise, no prop names. */
  sentence: string;
  /** What a user must know to use it right, at most three short
      paragraphs. Small components have none. */
  about?: readonly string[];
  /** "When to use something else": the situation, and what to use then -
      a page id of this demo becomes a link. */
  alternatives?: readonly { when: string; use: string }[];
  /** The keyboard table: a key or chord, and what it does. */
  keys?: readonly { key: string; action: string }[];
  /** What it deliberately does not do (ADR-0032). */
  limits?: readonly string[];
  /** The props types whose tables stand on this page, in the order they
      appear there. */
  types: readonly string[];
  /** What the import line in the page head shows.

      Not derived from `types`, although it almost fitted: `TabList` has no
      props of its own, `useToast` is not a type, and a table carries names of
      which a reader imports only some. What one takes and what is documented
      are two questions. */
  exports: readonly string[];
  /** The page that installs the package: its head shows the install command,
      derived from the manifest, under the import line. One page per demo. */
  installs?: true;
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
  /** The place of a page, optionally with an example on it: `/button/basic`
      - what the palette and the texts' `#/button/basic` speak. Not the
      address: `addressOfPlace` turns it into one, `placeOfLocation` back.

      These three are the only spots that know the formats. Whoever bypasses
      them holds a second truth about the same address; a `.replace()` on the
      result is one too. */
  placeOf: (pageId: string, exampleId?: string) => string;
  /** The address, below the demo's base: `/button/`, `/button/#basic`, `/`,
      `/#<scenario>` - for `page.goto()` and for an `href`. */
  addressOf: (pageId: string, exampleId?: string) => string;
  /** The page for a place, and the example named in it. A text's
      `#/button` reads the same.

      An unknown place yields no page - the shell then shows the scenarios
      page and not an empty surface. So does `scenarios/<anchor>`, with the
      scenario as the example. */
  fromPlace: (place: string) => { page?: PageWithRubric; example?: string };
}

/** The address of a place, below the demo's base (ADR-0037): the page a
    directory, the example an anchor on it; a scenario an anchor on the front
    page. Needs no outline - the format is the same for every demo. */
export function addressOfPlace(place: string): string {
  const [page, anchor] = place.replace(/^#?\/?/, "").split("/");
  const at = anchor === undefined || anchor === "" ? "" : `#${anchor}`;
  return page === undefined || page === "" || page === SCENARIOS ? `/${at}` : `/${page}/${at}`;
}

/** The place an address names: the path below the demo's base and the hash
    as the browser reports them. An old hash address (`#/button/basic`) wins
    over the path - that is how old links still land. */
export function placeOfLocation(path: string, hash: string): string {
  if (hash.startsWith("#/")) return hash.slice(1);
  const page = path.replace(/^\/+|\/+$/g, "");
  const anchor = hash.replace(/^#/, "");
  if (page === "") return anchor === "" ? "" : `/${SCENARIOS}/${anchor}`;
  return anchor === "" ? `/${page}` : `/${page}/${anchor}`;
}

/** The record of what umriss is not - every page's known limits point there. */
export const ADR_0032 = "https://github.com/romanhaendler/umriss-ui/blob/main/docs/adr/0032-what-umriss-is-not.md";

/** The address of the scenarios page, as `placeOf`'s page id. */
export const SCENARIOS = "scenarios";

/** The addresses of an outline. */
export function addresses(outline: readonly Rubric[]): Addresses {
  const ALL_PAGES: readonly PageWithRubric[] = outline.flatMap((rubric) =>
    rubric.pages.map((page) => ({ ...page, rubric })),
  );

  const placeOf = (pageId: string, exampleId?: string): string => {
    if (pageId === SCENARIOS) return exampleId === undefined ? "" : `/${SCENARIOS}/${exampleId}`;
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return "";
    return exampleId === undefined ? `/${page.id}` : `/${page.id}/${exampleId}`;
  };

  const addressOf = (pageId: string, exampleId?: string): string => addressOfPlace(placeOf(pageId, exampleId));

  const fromPlace = (place: string): { page?: PageWithRubric; example?: string } => {
    const raw = place.replace(/^#/, "").replace(/^\//, "");
    if (raw === "") return {};
    const [pageId, exampleId] = raw.split("/");
    if (pageId === SCENARIOS) return exampleId === undefined || exampleId === "" ? {} : { example: exampleId };
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return {};
    return exampleId === undefined || exampleId === "" ? { page } : { page, example: exampleId };
  };

  return { OUTLINE: outline, ALL_PAGES, placeOf, addressOf, fromPlace };
}
