/* The browser floors of the packages, derived from what their `src` uses.

   Each row names constructs (as `scan` spells them), the first Chrome, Firefox
   and Safari that ship them without a prefix or a flag (`null`: none does yet),
   and the page of MDN's browser-compat-data (@mdn/browser-compat-data 8.1.10,
   read on 2026-11-23) the versions were taken from. A row with `raises: false`
   is a refinement: the component works without it in an older browser (a
   feature test guards it, or the rule only polishes), so it does not set the
   floor. The floor of a browser is the highest of its column over the rows with
   `raises: true` that the source uses. */

export interface Feature {
  names: string[];
  raises: boolean;
  chrome: number | null;
  firefox: number | null;
  safari: number | null;
  source: string;
}

const MDN = "https://developer.mozilla.org/docs/Web/";

export const FEATURES: Feature[] = [
  { names: ["light-dark()"], raises: true, chrome: 123, firefox: 120, safari: 17.5, source: `${MDN}CSS/Reference/Values/color_value/light-dark` },
  { names: [":has"], raises: true, chrome: 105, firefox: 121, safari: 15.4, source: `${MDN}CSS/Reference/Selectors/:has` },
  { names: ["round()"], raises: true, chrome: 125, firefox: 118, safari: 15.4, source: `${MDN}CSS/Reference/Values/round` },
  { names: ["color-mix()"], raises: true, chrome: 111, firefox: 113, safari: 16.2, source: `${MDN}CSS/Reference/Values/color_value/color-mix` },
  { names: ["@layer"], raises: true, chrome: 99, firefox: 97, safari: 15.4, source: `${MDN}CSS/Reference/At-rules/@layer` },
  { names: ["@container", "prop:container", "prop:container-type", "unit:cqi"], raises: true, chrome: 105, firefox: 110, safari: 16, source: `${MDN}CSS/Reference/At-rules/@container` },
  { names: ["unit:dvh"], raises: true, chrome: 108, firefox: 101, safari: 15.4, source: `${MDN}CSS/Reference/Values/length#dynamic_viewport_units` },
  { names: ["unit:lh"], raises: true, chrome: 109, firefox: 120, safari: 16.4, source: `${MDN}CSS/Reference/Values/length#lh` },
  { names: ["prop:contain-intrinsic-inline-size"], raises: true, chrome: 95, firefox: 107, safari: 17, source: `${MDN}CSS/Reference/Properties/contain-intrinsic-inline-size` },
  { names: ["prop:mask-image"], raises: true, chrome: 120, firefox: 53, safari: 15.4, source: `${MDN}CSS/Reference/Properties/mask-image` },
  { names: ["inert"], raises: true, chrome: 102, firefox: 112, safari: 15.5, source: `${MDN}HTML/Reference/Global_attributes/inert` },
  { names: ["@property", "prop:syntax", "prop:inherits", "prop:initial-value"], raises: false, chrome: 85, firefox: 128, safari: 16.4, source: `${MDN}CSS/Reference/At-rules/@property` },
  { names: ["@starting-style"], raises: false, chrome: 117, firefox: 129, safari: 17.5, source: `${MDN}CSS/Reference/At-rules/@starting-style` },
  { names: [":dir"], raises: false, chrome: 120, firefox: 49, safari: 16.4, source: `${MDN}CSS/Reference/Selectors/:dir` },
  { names: ["prop:text-wrap"], raises: false, chrome: 114, firefox: 121, safari: 17.5, source: `${MDN}CSS/Reference/Properties/text-wrap-style#balance` },
  { names: ["prop:corner-shape"], raises: false, chrome: 139, firefox: null, safari: 27.3, source: `${MDN}CSS/Reference/Properties/corner-shape` },
  { names: ["prop:reading-flow"], raises: false, chrome: 137, firefox: null, safari: null, source: `${MDN}CSS/Reference/Properties/reading-flow` },
  { names: ["prop:scrollbar-width"], raises: false, chrome: 121, firefox: 64, safari: 18.2, source: `${MDN}CSS/Reference/Properties/scrollbar-width` },
  { names: ["prop:overflow-clip-margin"], raises: false, chrome: 90, firefox: 102, safari: null, source: `${MDN}CSS/Reference/Properties/overflow-clip-margin` },
  { names: ["prop:forced-color-adjust"], raises: false, chrome: 89, firefox: 113, safari: null, source: `${MDN}CSS/Reference/Properties/forced-color-adjust` },
  { names: ["prop:print-color-adjust"], raises: false, chrome: 136, firefox: 97, safari: 15.4, source: `${MDN}CSS/Reference/Properties/print-color-adjust` },
  { names: ["prop:line-clamp"], raises: false, chrome: null, firefox: null, safari: null, source: `${MDN}CSS/Reference/Properties/line-clamp` },
  { names: ["prop:backdrop-filter"], raises: false, chrome: 76, firefox: 103, safari: 18, source: `${MDN}CSS/Reference/Properties/backdrop-filter` },
  { names: ["prop:user-select"], raises: false, chrome: 54, firefox: 69, safari: 27.3, source: `${MDN}CSS/Reference/Properties/user-select` },
  { names: ["popover", "showPopover"], raises: false, chrome: 114, firefox: 125, safari: 17, source: `${MDN}API/HTMLElement/popover` },
  { names: ["checkVisibility"], raises: false, chrome: 105, firefox: 106, safari: 17.4, source: `${MDN}API/Element/checkVisibility` },
  { names: ["EyeDropper"], raises: false, chrome: 95, firefox: null, safari: null, source: `${MDN}API/EyeDropper` },
];

/* Constructs older than Chrome 107, Firefox 104 and Safari 16 (Vite's default
   targets), or written with their prefix: found in the source, they need no row. */
const BASELINE = new Set([
  "@media", "@keyframes", "@supports",
  "var()", "calc()", "min()", "max()", "env()", "rgba()", "scale()", "rotate()", "translate()", "translateX()", "translateY()", "skewX()", "linear-gradient()", "minmax()", "repeat()", "inset()", "polygon()", "circle()", "blur()", "steps()", "cubic-bezier()", "fit-content()",
  ":not", ":hover", ":focus-visible", ":disabled", ":active", ":checked", ":first-child", ":last-child", ":focus", ":root", ":focus-within", ":is", ":indeterminate", ":empty", ":nth-child", ":only-child", ":global", "::after", "::before", "::backdrop", "::placeholder",
  ...(
    "composes align-content align-items align-self all animation animation-delay animation-duration animation-name appearance aspect-ratio background background-color background-image background-position background-repeat background-size block-size border border-block-width border-bottom border-bottom-color border-bottom-left-radius border-bottom-right-radius border-collapse border-color border-end-end-radius border-end-start-radius border-inline-end-width border-inline-start border-inline-start-width border-left border-radius border-right border-start-end-radius border-start-start-radius border-top border-top-color border-top-left-radius border-top-right-radius border-top-style bottom box-shadow box-sizing break-inside clip-path color color-scheme column-gap contain content cursor display fill flex flex-basis flex-direction flex-flow flex-grow flex-wrap font font-family font-feature-settings font-size font-style font-variant-numeric font-weight gap grid-area grid-auto-flow grid-auto-rows grid-column grid-row grid-template-columns grid-template-rows height inline-size inset inset-block inset-block-start inset-inline inset-inline-end inset-inline-start justify-content justify-self left letter-spacing line-height list-style margin margin-block margin-bottom margin-inline margin-inline-end margin-inline-start margin-left margin-right margin-top max-height max-inline-size max-width min-height min-inline-size min-width object-fit opacity order outline outline-color outline-offset outline-width overflow overflow-wrap overflow-x overflow-y overscroll-behavior padding padding-block padding-block-end padding-bottom padding-inline padding-inline-start padding-left padding-right padding-top place-items pointer-events position right rotate row-gap scale stop-color stroke-dasharray stroke-dashoffset text-align text-decoration text-decoration-line text-decoration-style text-decoration-thickness text-overflow text-transform text-underline-offset top touch-action transform transform-origin transition transition-duration translate vertical-align visibility white-space width writing-mode z-index -webkit-box-orient -webkit-line-clamp -webkit-touch-callout"
  )
    .split(" ")
    .map((p) => `prop:${p}`),
]);

/* The browser APIs and attributes of the TypeScript sources that postdate the
   baseline; any other API is taken as older. */
const NEWER_API =
  /\b(inert|popover|showPopover|hidePopover|togglePopover|checkVisibility|EyeDropper|structuredClone|toSorted|toReversed|toSpliced|findLast|findLastIndex|fromAsync|withResolvers|startViewTransition|getAnimations|scrollend|anchorName|positionAnchor|Segmenter|Temporal)\b|(?:Object|Map)\.groupBy/g;

/** The constructs a stylesheet and a TypeScript source use, spelled as `FEATURES` names them. */
export function scan(css: string, ts: string): Set<string> {
  const found = new Set<string>();
  const style = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/"[^"\n]*"|'[^'\n]*'/g, '""')
    .replace(/url\([^)]*\)/g, "");
  for (const m of style.matchAll(/@[a-z][\w-]*/g)) found.add(m[0]);
  for (const m of style.matchAll(/(?<![:\w-])([a-z][\w-]*)\(/g)) found.add(`${m[1]}()`);
  for (const m of style.matchAll(/(?<!:):{1,2}([a-z][\w-]*)/g)) found.add(`${m[0]}`);
  for (const m of style.matchAll(/^[ \t]*(-?[a-z][a-z-]*)[ \t]*:(?:[ \t][^{\n]*)?$/gm)) found.add(`prop:${m[1]}`);
  for (const m of style.matchAll(/\d(dvh|svh|lvh|dvw|dvi|dvb|lh|rlh|cqi|cqb|cqw|cqh|vi|vb)\b/g)) found.add(`unit:${m[1]}`);
  const code = ts.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(?<!:)\/\/.*$/gm, "");
  for (const m of code.matchAll(NEWER_API)) found.add(m[1] ?? m[0]);
  return found;
}

/** The constructs found that neither the baseline nor a row accounts for. */
export function unknown(found: Set<string>, features: Feature[] = FEATURES): string[] {
  const known = new Set(features.flatMap((f) => f.names));
  return [...found].filter((n) => !BASELINE.has(n) && !known.has(n)).sort();
}

export type Floors = { chrome: number; firefox: number; safari: number };

/** The highest first version of each browser over the rows the source uses that raise it. */
export function floors(found: Set<string>, features: Feature[] = FEATURES): Floors {
  const out: Floors = { chrome: 0, firefox: 0, safari: 0 };
  for (const f of features) {
    if (!f.raises || !f.names.some((n) => found.has(n))) continue;
    for (const b of ["chrome", "firefox", "safari"] as const) out[b] = Math.max(out[b], f[b] ?? Infinity);
  }
  return out;
}

/** Every browser version a text names that is not the floor, as "Chrome 123": spelled "Chrome 125", `chrome125` or `"chrome >= 125"`. */
export function otherFloors(text: string, floor: Floors): string[] {
  const out: string[] = [];
  for (const b of ["chrome", "firefox", "safari"] as const) {
    for (const m of text.matchAll(new RegExp(`\\b${b}(?: ?>=)? ?(\\d+(?:\\.\\d+)?)`, "gi"))) if (Number(m[1]) !== floor[b]) out.push(`${b} ${m[1]}`);
  }
  return out;
}

/** Whether a text names any browser version. */
export const statesFloor = (text: string): boolean => /\b(chrome|firefox|safari)(?: ?>=)? ?\d/i.test(text);
