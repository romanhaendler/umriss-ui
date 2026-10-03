/* The workspace's own documents the site renders as pages of its own
   (.scratch/concepts-and-changelog-pages, ADR-0046): rendered from their
   markdown when the site is built, never copied - the file in the repository
   stays the only text.

   `scripts/build-pages.mjs` reads each file and wraps what this returns in
   the front page's layout; the guard over the result is `documentFaults` in
   `site.ts`. It runs in Node, as the tooling beside it does. */

import { Marked, type Token, type Tokens } from "marked";
import { PACKAGES } from "../packages.ts";
import { linkAdrs, type AdrLinks } from "./references.ts";

/** A document of the repository that is a page of the site. */
export interface SiteDocument {
  /** The file, from the repository's root. */
  source: string;
  /** Its address below the site's, with the trailing slash. */
  path: string;
  /** The page's title. */
  title: string;
  /** What a link to it says, in the front page's foot and index. */
  name: string;
  /** The package whose changelog it is: linked from that package's pages and
      its group of the front page's index, not from the front page's foot. */
  changelogOf?: string;
}

/** Every document the site renders, and only these: what a caller reads to
    understand the library as a whole. The other ADRs, the journal, CONTEXT.md
    and the contributor documents stay on GitHub. Adding one is a line here.
    Each package's changelog stands in its package's directory. */
export const DOCUMENTS: readonly SiteDocument[] = [
  { source: "docs/design-language.md", path: "design-language/", title: "Design language – umriss-ui", name: "Design language" },
  { source: "docs/standards.md", path: "standards/", title: "Industrial standards – umriss-ui", name: "Standards" },
  { source: "docs/adr/0032-what-umriss-is-not.md", path: "what-umriss-ui-is-not/", title: "What umriss-ui is not – umriss-ui", name: "What umriss-ui is not" },
  ...PACKAGES.map((p) => ({ source: `packages/${p.id}/CHANGELOG.md`, path: `${p.id}/changelog/`, title: `Changelog – ${p.npm}`, name: "Changelog", changelogOf: p.id })),
];

/** A version of a package, as its changelog's heading names it. */
export interface Release {
  version: string;
  title: string;
  /** "Oct. 2026" */
  month: string;
  /** The heading's id on the changelog's page: `v0-24-0`. */
  anchor: string;
}

/* A version at the head of a heading - `internal` before the first release -
   and its id, the dots made dashes. */
const VERSION = /^(?:internal )?(\d+\.\d+\.\d+(?:-[\da-z.]+)?)(?= |$)/i;
const versionAnchor = (text: string) => {
  const version = VERSION.exec(text)?.[1];
  return version === undefined ? undefined : `v${version.replace(/\./g, "-")}`;
};

/** A changelog's version heading of the released shape, `0.24.0 – The
    select's own list (Oct. 2026)`, read; any other heading is undefined. */
export function readRelease(heading: string): Release | undefined {
  const match = /^(\d+\.\d+\.\d+(?:-[\da-z.]+)?) – (.+) \(([A-Z][a-z]+\.? \d{4})\)$/.exec(heading.trim());
  if (match === null) return undefined;
  return { version: match[1]!, title: match[2]!, month: match[3]!, anchor: versionAnchor(match[1]!)! };
}

/** The newest release a changelog records: its first version heading after
    the unreleased work. A heading of another shape there throws, naming the
    file `from` - the build stops on it. */
export function newestRelease(markdown: string, from: string): Release {
  const heading = [...markdown.matchAll(/^## (.+)$/gm)].map((match) => match[1]!.trim()).find((text) => text !== "Unreleased");
  const release = heading === undefined ? undefined : readRelease(heading);
  if (release === undefined) throw new Error(`${from}: its newest version heading "${heading ?? ""}" is not "<version> – <title> (<month>)".`);
  return release;
}

/** Where a file of the repository is read on GitHub: on `main`. */
export const SOURCE_HOME = "https://github.com/romanhaendler/umriss-ui/blob/main/";

/** Where a link written in the document `from` leads on the site: a rendered
    document to its page (by path, so that a copy served locally stays
    local), any other file of the repository to GitHub, the anchor kept. An
    anchor alone and an address elsewhere stay as they are; a file that does
    not exist throws. `home` is the site's address, `exists` asks the
    repository for a path from its root. */
export function documentHref(href: string, from: string, home: string, exists: (path: string) => boolean): string {
  if (href.startsWith("#") || /^[a-z][a-z\d+.-]*:|^\/\//i.test(href)) return href;
  const cut = href.indexOf("#");
  const file = cut === -1 ? href : href.slice(0, cut);
  const anchor = cut === -1 ? "" : href.slice(cut);
  const path = decodeURIComponent(new URL(file, `file:///${from}`).pathname.slice(1));
  const document = DOCUMENTS.find((one) => one.source === path);
  if (document !== undefined) return new URL(document.path, home).pathname + anchor;
  if (!exists(path)) throw new Error(`${from} links ${href}, which is no file of the repository.`);
  return SOURCE_HOME + path + anchor;
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* The text of inline tokens, without their markup. */
const plain = (tokens: readonly Token[]): string =>
  tokens.map((token) => ("tokens" in token && token.tokens !== undefined ? plain(token.tokens) : token.type === "br" ? " " : "text" in token ? token.text : "")).join("");

/** A document as the site shows it: its markdown rendered as the prerendered
    pages are (marked, markup in the text shown and never passed through),
    each ADR number a link, each link led by `documentHref`, each heading
    addressed as GitHub addresses it - a changelog's version by an id of its
    own, `v0-24-0` - and a "Changed" section marked, the word kept. Its first heading is the page's h1, so
    it is written as one. The description is its first paragraph - after an
    ADR's status lines - as plain text, cut at a word before 160 characters. */
export function renderDocument(markdown: string, from: string, { home, exists, adrs }: { home: string; exists: (path: string) => boolean; adrs: AdrLinks }): { html: string; description: string } {
  const seen = new Map<string, number>();
  const marked = new Marked({
    renderer: {
      html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
      heading({ tokens, depth, text }: Tokens.Heading) {
        const slug = (depth === 2 ? versionAnchor(text) : undefined) ?? text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
        const count = seen.get(slug) ?? 0;
        seen.set(slug, count + 1);
        const changed = text.startsWith("Changed") ? ' class="changed"' : "";
        return `<h${depth} id="${count === 0 ? slug : `${slug}-${count}`}"${changed}>${this.parser.parseInline(tokens)}</h${depth}>\n`;
      },
    },
    walkTokens(token) {
      if (token.type === "link") token.href = documentHref(token.href, from, home, exists);
    },
  });
  /* Block by block, a code block left alone: across blocks a fence's
     backticks would pair with an inline span's, and hide the mention after it. */
  const linked = marked
    .lexer(markdown)
    .map((token) => (token.type === "code" ? token.raw : linkAdrs(token.raw, adrs)))
    .join("");
  const first = marked.lexer(linked).find((token): token is Tokens.Paragraph => token.type === "paragraph" && !token.text.startsWith("Status:"));
  const text = plain(first?.tokens ?? []).replace(/\s+/g, " ").trim();
  const description = text.length <= 160 ? text : `${text.slice(0, text.lastIndexOf(" ", 159)).replace(/[\s,;:–—-]+$/, "")}…`;
  return { html: (marked.parse(linked, { async: false }) as string).trim(), description };
}
