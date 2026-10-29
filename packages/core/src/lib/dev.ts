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

const onceKey = (pkg: string, reason: string): string => `${pkg}\n${reason}`;

/** Whether `warnOnce` has already spoken for this package and reason. */
export function hasWarned(pkg: string, reason: string): boolean {
  return warned.has(onceKey(pkg, reason));
}

/** One development console warning per package and reason; silent in production. The prefix names the package. */
export function warnOnce(pkg: string, reason: string, message: string): void {
  const key = onceKey(pkg, reason);
  if (!isDev() || warned.has(key)) return;
  warned.add(key);
  console.warn(`${pkg}: ${message}`);
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce("@umriss-ui/core", `deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);

let watchingLowered = false;
let loweredBuild = false;

/* Whether a readable stylesheet carries Lightning CSS's lowered `light-dark()` (a rule naming its light switch).
   Once found it stays found. A sheet whose `cssRules` throws is cross-origin and unreadable. */
function isLoweredBuild(): boolean {
  if (loweredBuild) return true;
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      loweredBuild = Array.from(sheet.cssRules).some((rule) => rule.cssText.includes("var(--lightningcss-light"));
    } catch {
      continue;
    }
    if (loweredBuild) return true;
  }
  return false;
}

/* Whether the root's Lightning dark switch is off: its value is then empty, the declaration is invalid at
   computed-value time, and the probe stays transparent. A CSS rule that made the page dark switches it on. */
function darkSwitchOff(): boolean {
  const probe = document.createElement("div");
  probe.style.display = "none";
  probe.style.backgroundColor = "var(--lightningcss-dark, canvastext)";
  document.documentElement.appendChild(probe);
  const colour = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return colour === "rgba(0, 0, 0, 0)" || colour === "transparent";
}

/** Warns once, in development, when a build lowered `light-dark()` and the page is dark but the dark switch is
    off: the mode was set from JavaScript, which a lowered token cannot follow. An unlowered build never warns.
    Checks now and again whenever the root's attributes change (a mode switched on later), and stops watching
    after the warning. Call it in an effect, so that the stylesheets have loaded. */
export function warnLoweredLightDark(): void {
  if (watchingLowered || !isDev() || typeof document === "undefined") return;
  watchingLowered = true;
  const observer = new MutationObserver(check);
  function check(): void {
    const scheme = getComputedStyle(document.documentElement).colorScheme;
    if (!/\bdark\b/.test(scheme) || /\blight\b/.test(scheme)) return;
    if (!isLoweredBuild() || !darkSwitchOff()) return;
    observer.disconnect();
    warnOnce(
      "@umriss-ui/core",
      "lowered-light-dark",
      'this build lowered light-dark(), so the dark mode set from JavaScript leaves the components light. Declare it in CSS, e.g. [data-theme="dark"] { color-scheme: dark; }, or raise the CSS target to the browser floor (Vite build.cssTarget ["chrome123", "firefox120", "safari17.5"]; Next browserslist "chrome >= 123", "firefox >= 120", "safari >= 17.5"). See Styles in the README.',
    );
  }
  observer.observe(document.documentElement, { attributes: true });
  check();
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
