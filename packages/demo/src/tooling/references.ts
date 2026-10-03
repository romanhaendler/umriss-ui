/* What a reader's text may name, and how (.scratch/props-table-hygiene, 03).

   A reader of a page or a props table is sent nowhere they cannot go. A
   requirement number of a spec that is not on the site ("(R-4.12)") and a
   source path ("`lib/language`") send them there; the gate stops at either
   (`props.ts`), and a requirement number lives on in the source as a
   `@remarks` tag, which the reader drops. An ADR number is a decision the
   reader can read: every `ADR-0021` in a text becomes a link to that ADR's
   file, resolved by its number against `docs/adr/` when the texts are
   generated - one place to retarget, should the ADRs ever stand on the site.

   Pure, and without Vite, React or Node: the shell links the outline's texts
   with it in the browser, the generator the descriptions and the llms text.
   The directory is read in `props.ts`. */

import type { Page, Rubric } from "../outline.ts";
import type { Span } from "./apiTable.ts";
import type { ReferenceTable } from "./referenceTable.ts";

/** Where an ADR is read: its file in the repository on GitHub. */
export const ADR_HOME = "https://github.com/romanhaendler/umriss-ui/blob/main/docs/adr/";

/** An ADR's number to its address: `{ "0021": "https://…/0021-the-styles-….md" }`. */
export type AdrLinks = Readonly<Record<string, string>>;

/** The links of the ADR files a directory holds, by their number. */
export function adrLinksOf(fileNames: readonly string[]): Record<string, string> {
  return Object.fromEntries(
    fileNames.flatMap((name) => {
      const number = /^(\d{4})-.+\.md$/.exec(name)?.[1];
      return number === undefined ? [] : [[number, ADR_HOME + name]];
    }),
  );
}

/* A mark the text already carries - code or a link - stays as it is; an ADR
   number outside one is the mention. */
const MENTION = /(`[^`]+`|\[[^\]]+\]\([^)\s]+\))|ADR-(\d{4})/g;

/** Every ADR number of a text outside a link and outside code, as a link to
    its file. A number no file answers stops: the generator runs this first,
    so a page never shows one. */
export function linkAdrs(text: string, links: AdrLinks): string {
  return text.replace(MENTION, (mention, mark: string | undefined, number: string | undefined) => {
    if (mark !== undefined) return mark;
    const href = links[number!];
    if (href === undefined) throw new Error(`ADR-${number} names no file in docs/adr: "${text}"`);
    return `[${mention}](${href})`;
  });
}

const REQUIREMENT = /\bR-\d+(?:\.\d+)*/g;
/* Not inside a package's subpath: `@umriss-ui/core/styles.css` is what a
   reader imports, not where a source lies. */
const SOURCE_PATH = /(?<![\w@/.-])(?:(?:[\w-]+\/)*[\w-]+\.(?:tsx?|css)\b|(?:src|lib)\/[\w-]+)/g;

/** What a reader's text may not carry, as it stands there: a requirement
    number, a source path, an ADR number no file answers. A link's address is
    no text; its label is. No exception list. */
export function internalReferences(text: string, links: AdrLinks): string[] {
  const shown = text.replace(/\]\([^)\s]+\)/g, "]");
  return [
    ...(shown.match(REQUIREMENT) ?? []),
    ...(shown.match(SOURCE_PATH) ?? []),
    ...[...shown.matchAll(/ADR-(\d{4})/g)].filter((match) => links[match[1]!] === undefined).map((match) => match[0]),
  ];
}

/** A page with each of its texts passed through `edit`: the lede, about,
    alternatives, keys, accessibility and limits - what `Page.tsx` shows and the llms text
    carries. */
export function pageTexts(page: Page, edit: (text: string) => string): Page {
  return {
    ...page,
    sentence: edit(page.sentence),
    ...(page.about === undefined ? {} : { about: page.about.map(edit) }),
    ...(page.alternatives === undefined ? {} : { alternatives: page.alternatives.map(({ when, use }) => ({ when: edit(when), use: edit(use) })) }),
    ...(page.keys === undefined ? {} : { keys: page.keys.map(({ key, action }) => ({ key, action: edit(action) })) }),
    ...(page.accessibility === undefined ? {} : { accessibility: page.accessibility.map(edit) }),
    ...(page.limits === undefined ? {} : { limits: page.limits.map(edit) }),
  };
}

/** An outline with every text of its rubrics and pages passed through `edit`. */
export function outlineTexts(outline: readonly Rubric[], edit: (text: string) => string): Rubric[] {
  return outline.map((rubric) => ({ ...rubric, sentence: edit(rubric.sentence), pages: rubric.pages.map((page) => pageTexts(page, edit)) }));
}

/** Pieces already read, with each ADR number in a plain piece as a link. */
export function linkAdrSpans(spans: readonly Span[], links: AdrLinks): Span[] {
  return spans.flatMap((span) =>
    span.kind !== "text"
      ? [span]
      : span.text
          .split(/(ADR-\d{4})/)
          .filter((piece) => piece !== "")
          .map((piece): Span => (/^ADR-\d{4}$/.test(piece) ? { kind: "link", text: piece, href: adrHref(piece, links) } : { kind: "text", text: piece })),
  );
}

/** Reference tables (`referenceTable.ts`) with their ADR numbers as links. */
export function linkReferences(
  references: Readonly<Record<string, readonly ReferenceTable[]>>,
  links: AdrLinks,
): Record<string, ReferenceTable[]> {
  const link = (spans: readonly Span[]) => linkAdrSpans(spans, links);
  return Object.fromEntries(
    Object.entries(references).map(([page, tables]) => [
      page,
      tables.map((table) => ({
        ...table,
        lead: link(table.lead),
        groups: table.groups.map((group) => ({
          ...group,
          ...(group.title === undefined ? {} : { title: link(group.title) }),
          ...(group.note === undefined ? {} : { note: group.note.map(link) }),
          rows: group.rows.map((row) => ({ ...row, cells: row.cells.map(link) })),
        })),
      })),
    ]),
  );
}

function adrHref(mention: string, links: AdrLinks): string {
  const href = links[mention.slice(4)];
  if (href === undefined) throw new Error(`${mention} names no file in docs/adr.`);
  return href;
}

/** What a built page may not show: a requirement number anywhere, an ADR
    number outside a link. A code block cannot hold a link, so an example's
    comment may name one. */
export function siteLeaks(html: string): string[] {
  const outside = html.replace(/<a\b[^>]*>[\s\S]*?<\/a>|<pre\b[^>]*>[\s\S]*?<\/pre>/g, "");
  return [...(html.match(REQUIREMENT) ?? []), ...(outside.match(/ADR-\d{4}/g) ?? [])];
}
