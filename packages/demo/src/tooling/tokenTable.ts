/* The Theming page's token table, as a reference table (`referenceTable.ts`):
   one model, the HTML the app mounts and the prerendered page carries, the
   Markdown of the llms text.

   A colour is never converted here. Its swatch is an element whose background
   is the token itself, in the `color-scheme` of its column - so `light-dark()`
   resolves in the browser, light in the light column and dark in the dark
   one, whatever the page's own theme. The swatch is decoration; the value
   beside it says the same.

   Pure, and without Vite, React or Node, like `referenceTable.ts`. */

import { spansOf, type Span } from "./apiTable.ts";
import type { ReferenceTable } from "./referenceTable.ts";
import type { Token, TokenGroup } from "./tokens.ts";

/** `--u-color-accent` → `token-u-color-accent`. */
export const tokenAnchor = (name: string) => `token-${name.replace(/^--/, "")}`;

/** Which references become links; the rest stand as code. */
type Linked = (name: string) => boolean;

/** A value as its pieces, in code: every `var(--x` a link to the row of
    `--x`, a fallback after it kept as code. */
function valueSpans(value: string, linked: Linked): Span[] {
  const out: Span[] = [];
  let at = 0;
  for (const match of value.matchAll(/var\((--[\w-]+)/g)) {
    if (!linked(match[1]!)) continue;
    const start = match.index + "var(".length;
    out.push({ kind: "code", text: value.slice(at, start) });
    out.push({ kind: "link", text: match[1]!, href: `#${tokenAnchor(match[1]!)}` });
    at = start + match[1]!.length;
  }
  out.push({ kind: "code", text: value.slice(at) });
  return out.filter((span) => span.text !== "");
}

/** What a swatch's background is: the token itself where the page declares
    it, what it holds where only a chart's root does. */
type Drawn = (token: Token) => string;

function valueCell(token: Token, scheme: "light" | "dark", drawn: Drawn, linked: Linked): Span[] {
  const value = scheme === "light" ? token.light : token.dark;
  return [
    ...(token.colour ? [{ kind: "swatch", text: drawn(token), scheme } as const] : []),
    ...(value === undefined ? [{ kind: "text", text: "same" } as const] : valueSpans(value, linked)),
  ];
}

function descriptionCell(token: Token): Span[] {
  const motion: Span[] = token.reducedMotion === undefined ? [] : [{ kind: "bold", text: `${token.reducedMotion} under reduced motion.` }];
  if (token.comment === "") return motion.length === 0 ? [{ kind: "text", text: "—" }] : motion;
  return [...spansOf(token.comment), ...(motion.length === 0 ? [] : [{ kind: "text", text: " " } as const, ...motion])];
}

function groupsOf(groups: readonly TokenGroup[], drawn: Drawn, linked: Linked): ReferenceTable["groups"] {
  return groups.map((group) => ({
    ...(group.name === "" ? {} : { title: group.name }),
    ...(group.note.length === 0 ? {} : { note: group.note.map(spansOf) }),
    rows: group.tokens.map((token) => ({
      anchor: tokenAnchor(token.name),
      cells: [[{ kind: "code", text: token.name }], valueCell(token, "light", drawn, linked), valueCell(token, "dark", drawn, linked), descriptionCell(token)],
    })),
  }));
}

const COLUMNS = ["Token", "Light", "Dark", "Description"];

/** Core's tokens as the Theming page's table, grouped as the stylesheet
    groups them. */
export function tokenTable(groups: readonly TokenGroup[]): ReferenceTable {
  return {
    title: "Tokens",
    anchor: "tokens",
    lead: spansOf(
      "Every token the components draw with, grouped as the stylesheet groups them. A swatch is drawn from the token itself, light in the light column and dark in the dark one; \"same\" means one value for both themes.",
    ),
    columns: COLUMNS,
    groups: groupsOf(
      groups,
      (token) => `var(${token.name})`,
      () => true,
    ),
  };
}

/** The charts' tokens as a section of their own below core's (02). A
    reference links to core's row where core has that token; a swatch draws
    the value, since only a chart's root declares a `--uc-` token and the page
    is none. */
export function chartsTokenTable(groups: readonly TokenGroup[], core: readonly TokenGroup[]): ReferenceTable {
  const known = new Set(core.flatMap((group) => group.tokens.map((token) => token.name)));
  return {
    title: "@umriss-ui/charts",
    anchor: "charts-tokens",
    lead: spansOf(
      "The charts' own tokens, set on a chart's root. A token whose value names a core token takes that token, so theming core themes the charts; where core is not loaded, or has no such token (`--u-chart-1` to `--u-chart-6`), the literal after it stands.",
    ),
    columns: COLUMNS,
    groups: groupsOf(
      groups,
      (token) => token.light,
      (name) => known.has(name),
    ),
  };
}

/** The tokens of a stylesheet that have no row on a page - counted on the
    stylesheet's text, not by the reader, so a token the reader or the table
    lost is found. */
export function missingTokens(css: string, html: string): string[] {
  const declared = new Set([...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--uc?-[\w-]+)\s*:/g)].map((m) => m[1]!));
  return [...declared].filter((name) => !html.includes(`id="${tokenAnchor(name)}"`));
}
