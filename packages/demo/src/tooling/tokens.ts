/* The token reader: core's stylesheet of tokens, and the charts' stylesheet,
   as the rows of the Theming page's tables (.scratch/theming-and-wording-reference,
   01 and 02).

   A token is a custom property declared on `:root` inside the layer
   `umriss.tokens` - what a module declares for itself is not one. The charts
   declare theirs on the chart's root class, inside `umriss.components`; the
   scope says which rule and which layer to read. The groups
   are the stylesheet's own section comments (`/* ---- Name ---- *\/`), so the
   table is sorted as the file is, and a new token stands in it without
   anybody editing a page.

   Nothing is resolved here: a colour is drawn by the browser on the page
   (`tokenTable.ts`), from the token itself. It runs in Node only - postcss is
   the workspace's CSS parser, the one the stylesheet guards read with. */

import postcss, { type AtRule, type ChildNode, type Comment, type Declaration, type Node, type Rule } from "postcss";

export interface Token {
  name: string;
  /** The value in the light theme - the whole value where it has one only. */
  light: string;
  /** The value in the dark theme; none where the value has no `light-dark()`. */
  dark?: string;
  /** The comment before the declaration and the one after it on its line. */
  comment: string;
  /** Its value under `prefers-reduced-motion: reduce`, where it has one. */
  reducedMotion?: string;
  /** Drawn as a swatch: a colour by its name, its value, or the token it is. */
  colour: boolean;
}

export interface TokenGroup {
  /** The section comment's name; empty for what stands before the first. */
  name: string;
  /** The section comment's text below its name, one entry per paragraph. */
  note: string[];
  tokens: Token[];
}

const SECTION = /^-{3,}\s*(.+?)\s*-{3,}\s*([\s\S]*)$/;

const oneLine = (text: string) => text.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();

/** Every `light-dark(a, b)` in a value replaced by one of its two halves. */
function pick(value: string, half: 0 | 1): string {
  const at = value.indexOf("light-dark(");
  if (at === -1) return value;
  const open = at + "light-dark(".length;
  let depth = 0;
  let comma = -1;
  let end = open;
  for (; end < value.length; end++) {
    const char = value[end];
    if (char === "(") depth++;
    else if (char === ")" && depth-- === 0) break;
    else if (char === "," && depth === 0) comma = end;
  }
  const chosen = half === 0 ? value.slice(open, comma) : value.slice(comma + 1, end);
  return value.slice(0, at) + pick(chosen.trim(), half) + pick(value.slice(end + 1), half);
}

/* ponytail: the named colours a token is likely to hold, not all 148 of CSS -
   extend the list when a token is written as one that is missing. */
const COLOUR_VALUE = /^(#[0-9a-f]{3,8}\b|(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\(|(transparent|currentcolor|black|white)$)/i;

const isSection = (node: ChildNode | undefined): boolean => node?.type === "comment" && SECTION.test(node.text);

/** A comment that stands on the line its previous declaration ends on. */
const trails = (node: ChildNode | undefined): boolean => {
  const before = node?.prev();
  return node?.type === "comment" && before?.type === "decl" && before.source?.end?.line === node.source?.start?.line;
};

function commentOf(declaration: Declaration): string {
  const before: string[] = [];
  for (let node = declaration.prev(); node?.type === "comment" && !isSection(node) && !trails(node); node = node.prev()) {
    before.unshift(node.text);
  }
  const after = declaration.next();
  return oneLine([...before, ...(trails(after) ? [(after as Comment).text] : [])].join(" "));
}

/** Where a stylesheet declares its tokens: core's on `:root` in the tokens
    layer, the charts' on `.uc-root` in the components layer. */
export interface TokenScope {
  layer: string;
  selector: string;
}

const inLayer = (node: ChildNode, layer: string): boolean => {
  for (let parent = node.parent as Node | undefined; parent !== undefined; parent = parent.parent as Node | undefined) {
    if (parent.type === "atrule" && (parent as AtRule).name === "layer") return (parent as AtRule).params === layer;
  }
  return false;
};

/** The tokens of a stylesheet, in its groups and its order. */
export function readTokens(css: string, scope: TokenScope = { layer: "umriss.tokens", selector: ":root" }): TokenGroup[] {
  const groups: TokenGroup[] = [{ name: "", note: [], tokens: [] }];
  const reduced = new Map<string, string>();
  postcss.parse(css).walk((node) => {
    if (!inLayer(node, scope.layer)) return;
    if (isSection(node)) {
      const [, name, body] = SECTION.exec((node as Comment).text)!;
      groups.push({ name: name!, note: body!.split(/\n\s*\n/).map(oneLine).filter((text) => text !== ""), tokens: [] });
      return;
    }
    if (node.type !== "decl" || !node.prop.startsWith("--") || node.parent?.type !== "rule" || (node.parent as Rule).selector !== scope.selector) return;
    const value = oneLine(node.value);
    const media = node.parent.parent;
    if (media?.type === "atrule" && (media as AtRule).name === "media") {
      if ((media as AtRule).params.includes("prefers-reduced-motion")) reduced.set(node.prop, value);
      return;
    }
    const light = pick(value, 0);
    const dark = pick(value, 1);
    const comment = commentOf(node);
    groups.at(-1)!.tokens.push({ name: node.prop, light, ...(dark === light ? {} : { dark }), comment, colour: false });
  });

  const tokens = groups.flatMap((group) => group.tokens);
  const colours = new Set<string>();
  /* A reference to a colour may stand before the colour it names: two rounds
     settle a chain of two, which is as deep as any stylesheet here goes. A
     reference whose fallback is a colour is one too - a charts' series falls
     back onto a core token that does not exist yet. */
  for (let round = 0; round < 2; round++) {
    for (const token of tokens) {
      const [, target, fallback] = /^var\((--[\w-]+)(?:,\s*(.+))?\)$/.exec(token.light) ?? [];
      if (
        token.name.includes("color") ||
        COLOUR_VALUE.test(token.light) ||
        (target !== undefined && colours.has(target)) ||
        (fallback !== undefined && COLOUR_VALUE.test(fallback))
      )
        colours.add(token.name);
    }
  }
  for (const token of tokens) {
    token.colour = colours.has(token.name);
    const motion = reduced.get(token.name);
    if (motion !== undefined) token.reducedMotion = motion;
  }
  /* A section of rules - the charts' Axes, Legend - holds no token. */
  return groups.filter((group) => group.tokens.length > 0);
}
