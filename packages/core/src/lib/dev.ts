/* Development mode: `process.env.NODE_ENV` is not "production". The expression
   is written literally so that a bundler replaces it (Vite does in a dev
   server, webpack and Next in a build) and Node and Jest read it as it is. Where
   neither happens there is no `process`, the read throws, and the answer is
   production. */

declare const process: { env: Record<string, string | undefined> };

export function isDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

const warned = new Set<string>();

/** One development console warning per reason; silent in production. */
export function warnOnce(reason: string, message: string): void {
  if (!isDev() || warned.has(reason)) return;
  warned.add(reason);
  console.warn(`@umriss-ui/core: ${message}`);
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce(`deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);

let checkedLowered = false;

/** Warns once, in development, when a build lowered `light-dark()` and the page is dark but the tokens still
    resolve to their light values: the mode was set from JavaScript, which a lowered token cannot follow. A
    lowered token reads as its light half in the root's computed value (an unlowered one as the whole
    `light-dark(…)`, and one the application's CSS flipped as the dark half). Call it in an effect, so that the
    stylesheets have loaded. */
export function warnLoweredLightDark(): void {
  if (checkedLowered || !isDev() || typeof document === "undefined") return;
  checkedLowered = true;
  const style = getComputedStyle(document.documentElement);
  const dark = /\bdark\b/.test(style.colorScheme) && !/\blight\b/.test(style.colorScheme);
  if (dark && style.getPropertyValue("--u-color-bg").trim().toLowerCase() === "#fafafa") {
    warnOnce(
      "lowered-light-dark",
      'this build lowered light-dark(), so the dark mode set from JavaScript leaves the components light. Declare it in CSS, e.g. [data-theme="dark"] { color-scheme: dark; }, or raise the CSS target to the browser floor (Vite build.cssTarget ["chrome123", "firefox120", "safari17.5"]; Next browserslist "chrome >= 123", "firefox >= 120", "safari >= 17.5"). See Styles in the README.',
    );
  }
}

let scanned = false;

/* Whether a rule sits in an `umriss.*` layer: the library's own rules, which keep reading an old token on purpose. */
const inOwnLayer = (rule: CSSRule): boolean => /^@layer\s+umriss\b/.test(rule.cssText);

/* The rules outside the umriss layers, nested ones (media, supports, other layers) included. A sheet whose
   `cssRules` throws is cross-origin and unreadable. */
function* leafRules(rules: CSSRuleList): Generator<CSSRule> {
  for (const rule of Array.from(rules)) {
    if (inOwnLayer(rule)) continue;
    const nested = (rule as CSSGroupingRule).cssRules;
    if (nested && nested.length > 0) yield* leafRules(nested);
    else yield rule;
  }
}

/** Warns, once per page and only in development, for each old token (`--u-old` -> `--u-new`) that a stylesheet
    outside the umriss layers declares or reads in `var()`. Call it in an effect, so that the application's
    stylesheets have loaded. */
export function warnDeprecatedTokens(tokens: Record<string, string>): void {
  if (!isDev() || scanned || typeof document === "undefined") return;
  scanned = true;
  const text: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of leafRules(rules)) text.push(rule.cssText);
  }
  const css = text.join("\n");
  for (const [old, replacement] of Object.entries(tokens)) {
    if (new RegExp(`${old}(?![\\w-])`).test(css)) warnDeprecated(old, replacement);
  }
}
