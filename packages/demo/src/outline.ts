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

   The texts of a page - lede, about, alternatives, keys, accessibility,
   limits - are plain strings with two marks: `code` in backticks and a [link](#/page). The demo
   renders them, turning `#/page` into the page's address; the llms text
   carries them as they are.

   The scenarios page opens every demo. It is no page of the outline: it
   stands at `/`, a scenario on it at `/#<anchor>`. Its place - what the
   palette and `fromPlace` speak - is `/scenarios/<anchor>` all the same.

   A page whose id changes keeps its old address alive: the demo's outline
   module declares the old id beside the current one (`MOVED`), and the old
   address lands on the current page - in the app, which rewrites the address
   bar, and on the site, where a forwarder stands at the old path
   (.scratch/sidebar-tree, "Forwarding a moved address").

   This file runs without a bundler too: the props generator loads a demo's
   outline in Node. That is why it imports nothing. */

/** A page this demo does not have: a component of a neighbouring package,
    linked into that package's demo. */
export interface ForeignPage {
  name: string;
  /** `"@umriss-ui/charts#trend"` - the package and the page's address. */
  page: string;
}

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
  /** The pages whose keyboard tables apply here too: an id of this demo, or
      a neighbour's page as a scenario's `builtFrom` names it. Linked under
      the page's own table, never copied into it (`keysOfText`). */
  keysOf?: readonly (string | ForeignPage)[];
  /** What a screen reader meets, at most three short paragraphs, each only
      where it says something: the role and accessible name it exposes and
      where the name comes from; what it announces, through which live
      region, and when; what the caller must supply and what happens
      without it; where forced colours or reduced motion change it. */
  accessibility?: readonly string[];
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
  /** A page whose body is generated rather than written: the shell gives it
      the page head without an import line, and the generated body after it.
      One kind so far, the API index (ADR-0044). */
  body?: "api-index";
  /** On the API index: a constant whose entries a table shows elsewhere - a
      wording or a format directory - and the link to that table, as a text
      with marks: `{ DEFAULT_WORDING: "[Wording](#/language/wording)" }`. */
  values?: Readonly<Record<string, string>>;
}

export interface Rubric {
  id: string;
  name: string;
  /** One sentence saying what the rubric is for - not what it contains. */
  sentence: string;
  pages: readonly Page[];
}

export type PageWithRubric = Page & { rubric: Rubric };

/** Page ids that changed: the old id, and the id of the page it is now. */
export type Moved = Readonly<Record<string, string>>;

export interface Addresses {
  OUTLINE: readonly Rubric[];
  /** The old ids this demo still answers to, and where each stands now. */
  MOVED: Moved;
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
      scenario as the example. A moved id yields its current page and
      `moved`, so that the shell rewrites the address. */
  fromPlace: (place: string) => { page?: PageWithRubric; example?: string; moved?: true };
}

/** The address of a place, below the demo's base (ADR-0037): the page a
    directory, the example an anchor on it; a scenario an anchor on the front
    page. Needs no outline - the format is the same for every demo. */
export function addressOfPlace(place: string): string {
  const [page, anchor] = place.replace(/^#?\/?/, "").split("/");
  const at = anchor === undefined || anchor === "" ? "" : `#${anchor}`;
  return page === undefined || page === "" || page === SCENARIOS ? `/${at}` : `/${page}/${at}`;
}

/** The address of a place's Markdown twin, below the demo's base
    (.scratch/pages-as-markdown): the page's address with `.md` - `/button.md`
    - and `/index.md` for the scenarios page. An example has no twin of its
    own; it stands in its page's. */
export function twinOfPlace(place: string): string {
  const page = addressOfPlace(place).replace(/#.*$/, "").replace(/\/$/, "");
  return page === "" ? "/index.md" : `${page}.md`;
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

/** The record of what umriss is not - every page's known limits point there,
    and every mention of ADR-0032: its page on the site, rendered from the ADR
    (ADR-0046), not its file on GitHub. */
export const ADR_0032 = "https://romanhaendler.github.io/umriss-ui/what-umriss-ui-is-not/";

/** Is it a neighbour's page as `{ name, page }`? */
export function isForeign(value: unknown): value is ForeignPage {
  if (typeof value !== "object" || value === null) return false;
  const { name, page } = value as Record<string, unknown>;
  return typeof name === "string" && typeof page === "string" && /^@[\w-]+\/[\w-]+#[\w-]+$/.test(page);
}

/** The anchor of a page's Keyboard section - in the app and on the site. */
export const keyboardAnchor = (pageId: string): string => `keyboard-${pageId}`;

/** The sentence under a page's keyboard table: "The keys of [Chart] apply
    here.", each page a link to its Keyboard section. Written in the texts'
    format, so that every medium writes it as it writes the page's other
    texts. Where a neighbour's page lies only the medium knows: `neighbour`
    gives its address. */
export function keysOfText(
  keysOf: readonly (string | ForeignPage)[],
  pages: readonly Page[],
  neighbour: (packageName: string, pageId: string) => string,
): string {
  const links = keysOf.map((one) => {
    if (typeof one !== "string") {
      const [packageName, pageId] = one.page.split("#") as [string, string];
      return `[${one.name}](${neighbour(packageName, pageId)}#${keyboardAnchor(pageId)})`;
    }
    return `[${pages.find((page) => page.id === one)?.name ?? one}](#/${one}/${keyboardAnchor(one)})`;
  });
  const listed = links.length === 1 ? links[0] : `${links.slice(0, -1).join(", ")} and ${links.at(-1)}`;
  return `The keys of ${listed} apply here.`;
}

/** The address of the scenarios page, as `placeOf`'s page id. */
export const SCENARIOS = "scenarios";

/** The API index's page id, as `placeOf`'s - an entry is at `#/api/<name>`. */
export const API_INDEX = "api";

/** The last rubric of a demo, alone in it: the API index - every name the
    package exports, generated from its entries (ADR-0044). At `/api/`;
    `values` as `Page.values`. */
export function apiIndexRubric(packageName: string, values?: Readonly<Record<string, string>>): Rubric {
  return {
    id: "api-index",
    name: "API index",
    sentence: "Every name the package exports, in one place.",
    pages: [
      {
        id: API_INDEX,
        name: "API index",
        sentence: `Everything \`${packageName}\` exports, with its signature. A component's props stand on its own page.`,
        types: [],
        exports: [],
        body: "api-index",
        ...(values === undefined ? {} : { values }),
      },
    ],
  };
}

/** The addresses of an outline, and of the page ids it moved away from.

    A moved id that is still a page's id would shadow that page, and one that
    points at no page would land nowhere - both throw. So does a `keysOf`
    entry that names no page with a keyboard table: its link would be dead. */
export function addresses(outline: readonly Rubric[], MOVED: Moved = {}): Addresses {
  const ALL_PAGES: readonly PageWithRubric[] = outline.flatMap((rubric) =>
    rubric.pages.map((page) => ({ ...page, rubric })),
  );
  for (const [old, current] of Object.entries(MOVED)) {
    if (ALL_PAGES.some((page) => page.id === old)) throw new Error(`The moved id \`${old}\` is still the id of a page.`);
    if (!ALL_PAGES.some((page) => page.id === current)) throw new Error(`\`${old}\` moved to \`${current}\`, which is no page.`);
  }
  for (const page of ALL_PAGES) {
    for (const one of (page.keysOf ?? []) as unknown[]) {
      if (typeof one === "string" ? !ALL_PAGES.some((s) => s.id === one && s.keys !== undefined) : !isForeign(one)) {
        throw new Error(`\`demo/outline.ts\`: \`${page.id}\` takes the keys of \`${JSON.stringify(one)}\`, which is no page of this demo with a keyboard table and no \`{ name, page }\`.`);
      }
    }
  }

  const placeOf = (pageId: string, exampleId?: string): string => {
    if (pageId === SCENARIOS) return exampleId === undefined ? "" : `/${SCENARIOS}/${exampleId}`;
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return "";
    return exampleId === undefined ? `/${page.id}` : `/${page.id}/${exampleId}`;
  };

  const addressOf = (pageId: string, exampleId?: string): string => addressOfPlace(placeOf(pageId, exampleId));

  const fromPlace = (place: string): { page?: PageWithRubric; example?: string; moved?: true } => {
    const raw = place.replace(/^#/, "").replace(/^\//, "");
    if (raw === "") return {};
    const [named = "", exampleId] = raw.split("/");
    if (named === SCENARIOS) return exampleId === undefined || exampleId === "" ? {} : { example: exampleId };
    const pageId = Object.hasOwn(MOVED, named) ? MOVED[named] : named;
    const page = ALL_PAGES.find((s) => s.id === pageId);
    if (page === undefined) return {};
    return {
      page,
      ...(exampleId === undefined || exampleId === "" ? {} : { example: exampleId }),
      ...(pageId === named ? {} : { moved: true as const }),
    };
  };

  return { OUTLINE: outline, MOVED, ALL_PAGES, placeOf, addressOf, fromPlace };
}
