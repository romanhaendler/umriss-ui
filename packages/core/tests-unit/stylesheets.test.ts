/* The components read tokens instead of copying them out (library-audit 07).

   The colour discipline of the stylesheets was almost complete - three literals
   in 4,650 lines - and each of the three was a defect: the modal's scrim dimmed
   the dark theme with the light value, and the danger button's text was exactly
   the pair the accessibility check tolerates. Durations stood twice, once in the
   stylesheet and once as a number in the code, and had drifted ten milliseconds
   apart.

   The text is read the way contrast.test.ts reads `tokens.css`.

   The second half is the vocabulary check of `visuelle-wertigkeit` 01, and it
   reads the stylesheets of every package that ships one - core, table,
   schedule, calculation and the charts. It answers one question per site: is
   there a raw value here where a token should stand? For colours, font sizes,
   line heights, durations, timing curves, radii and shadows. It says nothing
   about spacing, paddings, widths or heights, and it must not learn to: the
   asymmetric `7px 5px` of the list fields is an optical correction, not a
   debt (CONTEXT.md, **Vocabulary**). */

import { describe, expect, it } from "vitest";
import TOKENS from "../src/styles/tokens.css?raw";
import OWN from "../../../scripts/styles/own.module.css?raw";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

const STYLES = import.meta.glob("../src/components/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entries = () =>
  Object.entries(STYLES).map(([path, text]) => [path.replace("../src/components/", ""), text] as const);

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** The text without the `prefers-reduced-motion` blocks: a duration may stand
    there, because there it is switched off. */
function withoutReducedMotion(css: string): string {
  let rest = css;
  for (let start = rest.search(/@media\s*\(prefers-reduced-motion:\s*reduce\)/); start !== -1; ) {
    let depth = 0;
    let end = rest.indexOf("{", start);
    for (; end < rest.length; end++) {
      if (rest[end] === "{") depth++;
      if (rest[end] === "}" && --depth === 0) break;
    }
    rest = rest.slice(0, start) + rest.slice(end + 1);
    start = rest.search(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  }
  return rest;
}

describe("Stylesheets of the library (ADR-0021)", () => {
  it("begin with the layer order and keep every rule inside a layer of the library", () => {
    const offenders = [...entries(), ["tokens.css", TOKENS] as const, ["own.module.css", OWN] as const].flatMap(([file, text]) => [
      ...(text.includes(LAYER_ORDER) ? [] : [`${file}: no layer order statement`]),
      ...offendersIn(text).map((offender) => `${file}: ${offender}`),
    ]);
    expect(offenders).toEqual([]);
  });
});

describe("Stylesheets of the components", () => {
  it("find any stylesheets at all", () => {
    expect(entries().length).toBeGreaterThan(30);
  });

  /* A variable only one module knows is called `--_…`, as in the modal. Under
     `--u-` it looks like a token, and whoever searches for it in tokens.css
     finds nothing. */
  it("declare no variable that is named like a token", () => {
    const finds = entries().flatMap(([file, css]) =>
      [...withoutComments(css).matchAll(/(?:^|[;{\s])(--u-[\w-]+)\s*:/g)].map((m) => `${file}: ${m[1]}`),
    );
    expect(finds).toEqual([]);
  });

  it("do not copy out the hover edge", () => {
    const finds = entries()
      .filter(([, css]) => /color-mix\(in srgb, var\(--u-color-text\) 30%, transparent\)/.test(css))
      .map(([file]) => file);
    expect(finds).toEqual([]);
  });

  it("show the textarea's focus ring only on visible focus, like every field beside it", () => {
    const css = withoutComments(STYLES["../src/components/Textarea/Textarea.module.css"] ?? "");
    expect(css).not.toMatch(/:focus(?![-\w])/);
  });
});

/* ---------------- The vocabulary (visuelle-wertigkeit 01) ---------------- */

const LIBRARY = import.meta.glob(
  [
    "../src/components/**/*.module.css",
    "../../table/src/**/*.module.css",
    "../../schedule/src/**/*.module.css",
    "../../calculation/src/**/*.module.css",
    "../../charts/src/styles/charts.css",
  ],
  { query: "?raw", import: "default", eager: true },
) as Record<string, string>;

/** "core/Button/Button.module.css", "table/Table.module.css", ... */
const nameOf = (path: string) =>
  path.replace("../src/components/", "core/").replace(/^\.\.\/\.\.\/(\w+)\/src\//, "$1/");

/** The value with every `var(...)` taken out, fallbacks included: what is
    left is what the site wrote by hand. */
function withoutVars(value: string): string {
  let rest = value;
  for (let start = rest.indexOf("var("); start !== -1; start = rest.indexOf("var(")) {
    let depth = 0;
    let end = start + 3;
    for (; end < rest.length; end++) {
      if (rest[end] === "(") depth++;
      if (rest[end] === ")" && --depth === 0) break;
    }
    rest = rest.slice(0, start) + " " + rest.slice(end + 1);
  }
  return rest;
}

const numbers = (value: string) => [...value.matchAll(/(?<![\w.#-])-?\d*\.?\d+/g)].map((m) => Number.parseFloat(m[0]));

interface Rule {
  /** The properties the rule reads. */
  property: RegExp;
  /** Whether the value, with its tokens taken out, still holds a raw one. */
  raw: (bare: string, value: string) => boolean;
}

/* A shadow is a token when it has depth. An edge or a line - offset and spread
   only, no blur - is drawn geometry in a token colour, like a width; the
   colour rule already holds its colour. */
const hasBlur = (bare: string) => bare.split(",").some((layer) => (numbers(layer)[2] ?? 0) !== 0);

const RULES = {
  colour: { property: /./, raw: (_bare, value) => /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/.test(value) },
  "font size": { property: /^font(-size)?$/, raw: (bare) => numbers(bare).length > 0 },
  "line height": { property: /^line-height$/, raw: (bare) => numbers(bare).length > 0 },
  radius: { property: /radius$/, raw: (bare) => numbers(bare).some((n) => n !== 0) },
  shadow: { property: /^(box|text)-shadow$/, raw: hasBlur },
  duration: { property: /./, raw: (bare) => /(?<![\w.-])\d*\.?\d+m?s\b/.test(bare) },
  curve: {
    property: /^(transition|animation)(-timing-function)?$/,
    raw: (bare) => /(?<![\w-])(?:ease(?:-in-out|-in|-out)?|linear|step-start|step-end|cubic-bezier|steps)(?![\w-])/.test(bare),
  },
} satisfies Record<string, Rule>;

type Kind = keyof typeof RULES;

/** Every declaration of a stylesheet as [property, value]. A block for
    `prefers-reduced-motion` is left out: what stands there is switched off. */
function declarations(css: string): Array<[string, string]> {
  return [...withoutReducedMotion(withoutComments(css)).matchAll(/([\w-]+)\s*:\s*([^;{}]+?)\s*(?=[;}])/g)].map((m) => [
    m[1] as string,
    (m[2] as string).replace(/\s+/g, " "),
  ]);
}

/** Each raw value of one kind as "file: property: value" - the work list. A
    `--uc-*` declaration is not a site but the charts' own token layer: the
    charts depend on nothing, so their values fall back onto a literal there
    (R-1.6). */
function finds(kind: Kind): string[] {
  const rule: Rule = RULES[kind];
  return Object.entries(LIBRARY).flatMap(([path, css]) =>
    declarations(css)
      .filter(([property]) => !property.startsWith("--uc-"))
      .filter(([property, value]) => rule.property.test(property) && rule.raw(withoutVars(value), value))
      .map(([property, value]) => `${nameOf(path)}: ${property}: ${value}`),
  );
}

/** Raw values that may stay, each with its reason. Taking one on is allowed;
    softening a rule to make one pass is not. */
const EXCEPTIONS: Readonly<Record<string, string>> = {
  "core/NumberInput/NumberInput.module.css: font-size: 0.71875rem":
    "Mono figures in the small field, a step below --u-text-mono. Two sites in the library and no recurring role; pulled onto a neighbouring size they would move by half a pixel.",
  "core/DataViz/DataViz.module.css: font-size: 0.71875rem": "The meter's figure - the second of the two sites above, with the same reason.",
  "table/VerdictColumn.module.css: font-size: 0.7em":
    "A proportion, not a size: the verdict glyph stands at 70 % of whatever size its cell has, and follows the cell when the table is set smaller.",
  "table/VerdictColumn.module.css: font-size: 0.9em": "The excess beside the value, likewise a proportion of the cell's size.",
  "core/Stat/Stat.module.css: line-height: 1.1":
    "The stat's large figure is one number at --u-text-2xl, not a line of text; the one site that needs a leading this tight.",
};

describe("The vocabulary of the stylesheets (visuelle-wertigkeit 01)", () => {
  it("reads the stylesheets of every package that has them", () => {
    const packages = new Set(Object.keys(LIBRARY).map((path) => nameOf(path).split("/")[0]));
    expect([...packages].sort()).toEqual(["calculation", "charts", "core", "schedule", "table"]);
  });

  const check = (kind: Kind) => () => {
    expect([...new Set(finds(kind))].filter((find) => !(find in EXCEPTIONS))).toEqual([]);
  };

  it("writes no colour by hand", check("colour"));
  it("writes no font size by hand", check("font size"));
  it("writes no line height by hand", check("line height"));
  it("writes no radius by hand", check("radius"));
  it("writes no shadow with depth by hand", check("shadow"));
  it("writes no duration by hand", check("duration"));
  it("writes no timing curve by hand", check("curve"));

  it("still meets every exception, and each one carries a reason", () => {
    const all = new Set((Object.keys(RULES) as Kind[]).flatMap(finds));
    for (const [find, reason] of Object.entries(EXCEPTIONS)) {
      expect(all.has(find), `${find} is out of date`).toBe(true);
      expect(reason.length).toBeGreaterThan(20);
    }
  });

  it("references only tokens that exist", () => {
    const declared = new Set([...TOKENS.matchAll(/(--u-[\w-]+)\s*:/g)].map((m) => m[1]));
    const missing = Object.entries(LIBRARY).flatMap(([path, css]) =>
      [...withoutComments(css).matchAll(/var\((--u-[\w-]+)\)/g)]
        .filter((m) => !declared.has(m[1]))
        .map((m) => `${nameOf(path)}: ${m[1]}`),
    );
    expect(missing).toEqual([]);
  });

  /* Reduced motion drops the path, never the state (visuelle-wertigkeit 02). A
     focus style that arrived by an animation would vanish with it: where a
     rule answers to focus, it shows the focus by itself. */
  it("lets no focus style hang on an animation", () => {
    const hanging = Object.entries(LIBRARY).flatMap(([path, css]) =>
      [...withoutComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter((m) => /:focus/.test(m[1] as string) && /(?:^|[;\s])animation(?:-name)?\s*:(?!\s*none)/.test(m[2] as string))
        .map((m) => `${nameOf(path)}: ${(m[1] as string).trim()}`),
    );
    expect(hanging).toEqual([]);
  });

  /* The check is only worth its name if it fires. */
  it("recognises a raw value of each kind, and not a spacing", () => {
    const raw = (kind: Kind, property: string, value: string) => RULES[kind].property.test(property) && RULES[kind].raw(withoutVars(value), value);
    expect(raw("colour", "color", "#ffffff")).toBe(true);
    expect(raw("font size", "font-size", "0.75rem")).toBe(true);
    expect(raw("font size", "font-size", "var(--u-text-sm)")).toBe(false);
    expect(raw("line height", "line-height", "1")).toBe(true);
    expect(raw("radius", "border-radius", "var(--u-radius-sm) 0 0 var(--u-radius-sm)")).toBe(false);
    expect(raw("radius", "border-radius", "1px")).toBe(true);
    expect(raw("shadow", "box-shadow", "0 0 0 1px var(--u-color-accent)")).toBe(false);
    expect(raw("shadow", "box-shadow", "0 4px 8px var(--u-edge-color)")).toBe(true);
    expect(raw("duration", "transition", "opacity 80ms var(--u-ease-out)")).toBe(true);
    expect(raw("curve", "animation", "modalOut var(--u-duration-exit) ease-in forwards")).toBe(true);
    expect(raw("curve", "transition", "transform var(--u-duration-fast) var(--u-ease-out)")).toBe(false);
    for (const kind of Object.keys(RULES) as Kind[]) {
      for (const property of ["padding", "margin", "width", "height", "gap", "inset"]) {
        if (kind === "colour" || kind === "duration") continue;
        expect(raw(kind, property, "7px 5px"), `${kind} reads ${property}`).toBe(false);
      }
    }
  });
});

/* ---------------- The interaction-state canon (visuelle-wertigkeit 04) ----------------

   The canon settles by what MEANS a state comes about, not how strongly
   (CONTEXT.md, **Interaction-state canon**): hover changes the surface, active
   changes it more strongly, focus is the ring and only the ring, disabled
   reduces opacity and removes every reaction. "How strongly" is not checkable
   and is not checked. Three means are, and they are what a component loses
   first while it is being built:

   - a disabled element reacts to nothing: a hover or press rule that reaches an
     element with a disabled state excludes it;
   - focus is the ring: a rule that answers to the element's own focus paints
     neither its surface nor its type, and what it draws is the ring or nothing;
   - and the ring is never taken away: a hover rule that draws an edge
     excludes the focused element - it outweighs the ring, and a keyboard user
     whose pointer rests on the control would lose the focus from sight;
   - disabled dims, it does not repaint: a rule for the disabled state sets no
     colour and no surface.

   Where a site breaks away for a reason, it stands in the list below with that
   reason, as the vocabulary's exceptions do. */

/** Splits at `separator` where no parenthesis is open. */
function splitTop(text: string, separator: (char: string) => boolean): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (depth === 0 && separator(char)) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

type Declarations = Array<[string, string]>;

/** Every rule of a stylesheet as [selector, declarations], one entry per
    selector of a list. */
function stateRules(css: string): Array<[string, Declarations]> {
  return [...withoutComments(css).matchAll(/([^{};]+)\{([^{}]*)\}/g)].flatMap((m) => {
    const body = [...(m[2] as string).matchAll(/([\w-]+)\s*:\s*([^;]+)/g)].map(
      (d) => [d[1] as string, (d[2] as string).trim()] as [string, string],
    );
    return splitTop(m[1] as string, (c) => c === ",").map((selector) => [selector.replace(/\s+/g, " "), body] as [string, Declarations]);
  });
}

/** The compounds of a selector, from the outermost to the subject. */
const compounds = (selector: string) => splitTop(selector, (c) => /[\s>+~]/.test(c));

/** A compound without its pseudo-classes: the element it names. */
const baseOf = (compound: string) => compound.replace(/::?[\w-]+(?:\((?:[^()]|\([^()]*\))*\))?/g, "");

/** A compound without what stands inside `:not(...)`. */
const withoutNot = (compound: string) => compound.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, "");

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Whether the stylesheet gives the element a disabled state of its own:
    `.x:disabled`, `.x[aria-disabled...]`, or a class `.xDisabled`. */
const hasDisabledState = (css: string, base: string) =>
  base !== "" && new RegExp(`(?<![\\w-])${escapeRegExp(base)}(?::disabled|\\[aria-disabled|Disabled\\b)`).test(withoutComments(css));

const DISABLED_MARKER = /:disabled|\[aria-disabled|Disabled\b|\.disabled\b/;

/** The compounds of a hover or press rule that reach an element with a
    disabled state and do not exclude it. The hovered compound is checked, and
    so is the subject: `.group:hover .key` lights a disabled key as surely as
    `.key:hover` does. */
function unguarded(css: string, selector: string): string[] {
  const parts = compounds(selector);
  const reacting = parts.filter((part) => /:hover|:active/.test(withoutNot(part)));
  if (reacting.length === 0) return [];
  const subject = parts[parts.length - 1] as string;
  return [...new Set([...reacting, subject])].filter(
    (part) => hasDisabledState(css, baseOf(part)) && !/:not\([^()]*(?:disabled|Disabled)/.test(part),
  );
}

const RING = /^(?:none|var\(--u-focus-ring(?:-danger)?\)|var\(--uc-focus-ring\))$/;

/** A rule for the element's own focus that paints more than the ring. */
function focusPaints(selector: string, body: Declarations): boolean {
  const subject = compounds(selector).at(-1) ?? "";
  if (!/:focus/.test(subject.replace(/:(?:not|has)\((?:[^()]|\([^()]*\))*\)/g, ""))) return false;
  return body.some(
    ([property, value]) =>
      /^(?:background(?:-color)?|color)$/.test(property) || (/^(?:box-shadow|outline)$/.test(property) && !RING.test(value)),
  );
}

/** A hover rule that draws an edge over the ring of a focused element. */
function hoverTakesRing(selector: string, body: Declarations): boolean {
  if (!compounds(selector).some((part) => /:hover/.test(withoutNot(part)))) return false;
  if (/:not\(:focus-(?:visible|within)\)/.test(selector)) return false;
  return body.some(([property]) => /^(?:box-shadow|outline)$/.test(property));
}

/** A rule for the disabled state that repaints instead of dimming. */
function disabledRepaints(selector: string, body: Declarations): boolean {
  if (!compounds(selector).some((part) => DISABLED_MARKER.test(withoutNot(part)))) return false;
  return body.some(([property]) => /^(?:background(?:-color)?|color|border-color)$/.test(property));
}

type CanonCheck = "guard" | "focus" | "ring" | "disabled";

/** Sites that break away from the canon, each with its reason. */
const CANON_EXCEPTIONS: Readonly<Record<string, string>> = {
  "core/VisuallyHidden/VisuallyHidden.module.css: .focusable:focus":
    "The skip link: invisible until focused, and focus is what makes it appear as a whole - surface, type and shadow. The ring alone would ring nothing.",
  "core/VisuallyHidden/VisuallyHidden.module.css: .focusable:focus-within": "The same skip link, reached through a focusable child.",
  "core/TreeView/TreeView.module.css: .disabled":
    "The row is not disabled, only its checkbox is: the row stays focusable and navigable, and opacity would fade its focus ring with it. The type is muted instead; the checkbox dims by its own disabled state.",
};

function canonFinds(check: CanonCheck): string[] {
  const breaks = (css: string, selector: string, body: Declarations) =>
    ({
      guard: () => unguarded(css, selector).length > 0,
      focus: () => focusPaints(selector, body),
      ring: () => hoverTakesRing(selector, body),
      disabled: () => disabledRepaints(selector, body),
    })[check]();
  return Object.entries(LIBRARY).flatMap(([path, css]) =>
    stateRules(css)
      .filter(([selector, body]) => breaks(css, selector, body))
      .map(([selector]) => `${nameOf(path)}: ${selector}`),
  );
}

describe("The interaction-state canon (visuelle-wertigkeit 04)", () => {
  const check = (kind: CanonCheck) => () => {
    expect([...new Set(canonFinds(kind))].filter((find) => !(find in CANON_EXCEPTIONS))).toEqual([]);
  };

  it("lets no disabled element react to hover or press", check("guard"));
  it("shows focus by the ring and by nothing else", check("focus"));
  it("never lets a hover take the ring away", check("ring"));
  it("dims a disabled element instead of repainting it", check("disabled"));

  it("still meets every exception, and each one carries a reason", () => {
    const all = new Set((["guard", "focus", "ring", "disabled"] as const).flatMap(canonFinds));
    for (const [find, reason] of Object.entries(CANON_EXCEPTIONS)) {
      expect(all.has(find), `${find} is out of date`).toBe(true);
      expect(reason.length).toBeGreaterThan(20);
    }
  });

  /* The check is only worth its name if it fires. */
  it("recognises each breach, and lets the canon pass", () => {
    const css = ".key:disabled { opacity: 0.5; } .fieldDisabled { opacity: 0.5; }";
    expect(unguarded(css, ".key:hover")).toEqual([".key:hover"]);
    expect(unguarded(css, ".group:hover .key")).toEqual([".key"]);
    expect(unguarded(css, ".key:active:not(:disabled)")).toEqual([]);
    expect(unguarded(css, ".field:hover:not(.fieldDisabled)")).toEqual([]);
    expect(unguarded(css, ".field:hover")).toEqual([".field:hover"]);
    expect(unguarded(css, ".other:hover")).toEqual([]);
    expect(focusPaints(".item:focus-visible", [["background", "var(--u-color-surface-sunken)"]])).toBe(true);
    expect(focusPaints(".item:focus-visible", [["box-shadow", "var(--u-focus-ring)"]])).toBe(false);
    expect(focusPaints(".row:focus-visible", [["outline", "2px solid var(--u-color-accent)"]])).toBe(true);
    expect(focusPaints(".group:focus-within .key", [["opacity", "1"]])).toBe(false);
    expect(hoverTakesRing(".secondary:hover:not(:disabled)", [["box-shadow", "0 0 0 1px var(--u-color-edge-hover)"]])).toBe(true);
    expect(hoverTakesRing(".input:hover:not(:disabled):not(:focus-visible)", [["box-shadow", "none"]])).toBe(false);
    expect(hoverTakesRing(".key:hover", [["background", "var(--u-color-surface-sunken)"]])).toBe(false);
    expect(disabledRepaints(".tab:disabled", [["color", "var(--u-color-text-muted)"]])).toBe(true);
    expect(disabledRepaints(".input:disabled ~ .label", [["color", "var(--u-color-text-muted)"]])).toBe(true);
    expect(disabledRepaints(".tab:disabled", [["opacity", "0.5"]])).toBe(false);
    expect(disabledRepaints(".tab:hover:not(:disabled)", [["color", "var(--u-color-text)"]])).toBe(false);
  });
});
