/* Development mode by the rule in `@umriss-ui/core`'s `lib/dev.ts`. In production the invariants are silent. */

declare const process: { env: Record<string, string | undefined> };

function detectDev(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

export const DEV: boolean = detectDev();

/** Throws a comprehensible error in DEV, does nothing in PROD. */
export function invariant(condition: unknown, message: string): void {
  if (DEV && !condition) {
    throw new Error(`@umriss-ui/charts: ${message}`);
  }
}

/** A single DEV console warning per key. */
const warned = new Set<string>();
export function warnOnce(key: string, message: string): void {
  if (!DEV || warned.has(key)) return;
  warned.add(key);
  console.warn(`@umriss-ui/charts: ${message}`);
}

const differs = (a: unknown, b: unknown): boolean => {
  if (a instanceof Date && b instanceof Date) return !Object.is(a.getTime(), b.getTime());
  const plain = (v: unknown) => (typeof v !== "object" || v === null) && typeof v !== "function";
  return plain(a) && plain(b) && !Object.is(a, b);
};

/** DEV: an accessor held because its source text equals the new one's is stale when it reads a value from
    outside its row that has changed. Calls both on the first 1,000 rows and warns once per series name on
    the first difference; primitives compare by `Object.is`, Dates by time, anything else is not compared.
    Never changes which function is held. */
export function probeStale(name: string | undefined, held: unknown, next: unknown, rows: unknown, order?: number): void {
  if (!DEV || held === next || typeof held !== "function" || typeof next !== "function" || !Array.isArray(rows)) return;
  const key = `stale:${name ?? order ?? ""}`;
  if (warned.has(key)) return;
  try {
    for (let i = 0; i < Math.min(rows.length, 1000); i++) {
      if (!differs(held(rows[i], i), next(rows[i], i))) continue;
      warnOnce(
        key,
        `${name === undefined ? "A series without a name" : `Series "${name}"`}: its function reads a value from outside the row, and that value has changed - ` +
          `a function with the same source text is kept, so the old course stays. Carry the value in the rows, or give the series a \`key\` that changes with it.`,
      );
      return;
    }
  } catch {
    // An accessor that throws on a row is the caller's to find; the probe says nothing.
  }
}

/** The one wording of a renamed name that still works. */
export const warnDeprecated = (old: string, replacement: string): void =>
  warnOnce(`deprecated:${old}`, `${old} is deprecated and goes in the next minor release; use ${replacement}.`);

const NO_ROWS: readonly never[] = [];

/** Rows as umriss reads them: an array, or none. `undefined` and `null` are rows still loading and say nothing;
    anything else that is not an array warns once per `place`, naming what arrived. */
export function asRows<Z>(value: readonly Z[] | null | undefined, place: string): readonly Z[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return NO_ROWS;
  if (DEV) {
    const typed = ArrayBuffer.isView(value) ? (value as object).constructor.name : null;
    const arrived = typed ?? (typeof value === "object" ? `an object with the keys ${Object.keys(value).slice(0, 3).join(", ")}` : `a ${typeof value}`);
    warnOnce(
      `rows:${place}:${arrived}`,
      `${place} got ${arrived}, which is not an array; it is read as no rows. umriss reads one object per row - \`Array.from\` makes rows of an Arrow table or a typed array.`,
    );
  }
  return NO_ROWS;
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
  if (!DEV || scanned || typeof document === "undefined") return;
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
