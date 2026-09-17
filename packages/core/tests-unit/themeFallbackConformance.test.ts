/* FALLBACK_THEME is checked, not believed (library-audit 05).

   `@umriss-ui/charts` falls back over `var(--u-..., literal)` onto this
   package's tokens, and for the drawing loop, which knows no CSS variables,
   once more onto `FALLBACK_THEME` in theme.ts. The same colour therefore stands
   three times: in the token, as a literal in charts.css, and in theme.ts.
   Nothing held the three together.

   The direction is that of limitConformance.test.ts: this package reads the
   other, the other reads nothing from here (R-1.2). It is read as text, the way
   contrast.test.ts reads the stylesheet.

   The comparison is against the light theme: charts has no dark code of its own
   (R-1.8), its fallback is the light state. */

import TOKENS from "../src/styles/tokens.css?raw";
import CHARTS_CSS from "../../charts/src/styles/charts.css?raw";
import { describe, expect, it } from "vitest";
import { FALLBACK_THEME } from "../../charts/src/theme";

type Field =
  | "colorAxis"
  | "colorGrid"
  | "colorText"
  | "colorBg"
  | "colorWarning"
  | "colorAlarm"
  | "colorOk";

/** Field in theme.ts, variable in charts.css, token in tokens.css. */
const PAIRS: readonly (readonly [Field, string, string])[] = [
  ["colorAxis", "--uc-color-axis", "--u-edge-color-strong"],
  ["colorGrid", "--uc-color-grid", "--u-hairline"],
  ["colorText", "--uc-color-text", "--u-color-text-muted"],
  ["colorBg", "--uc-color-bg", "--u-color-surface"],
  ["colorWarning", "--uc-color-warning", "--u-color-warning"],
  ["colorAlarm", "--uc-color-alarm", "--u-color-danger"],
  ["colorOk", "--uc-color-ok", "--u-color-success"],
];

/* Named deviations between token and fallback, with a reason. An entry here has
   to deviate for real - otherwise it is stale, and says so. */
const EXCEPTIONS: Partial<Record<Field, string>> = {
  /* The token measures about 3.4:1 on white and does not reach the 4.5:1 for
     text; the charts fallback measures 4.8:1. The charts demo loads none of
     this package's tokens (R-1.2) and draws its axis labels with the literal -
     aligning it would move every charts baseline and make the contrast worse in
     doing so. contrast.test.ts deliberately holds the token only at the bound
     for large text, and `tone-contrast` excepts it expressly ("whoever touches
     it turns it into a ticket of its own"). This check does not decide which
     colour is right; it records that the two are different, and why. */
  colorText: "muted text: the token misses 4.5:1, the fallback does not",
};

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");
const same = (value: string) => value.toLowerCase().replace(/\s+/g, "");

/** The light half of `light-dark(<light>, <dark>)`, or the value itself. */
function lightOf(value: string): string {
  if (!value.startsWith("light-dark(")) return value;
  let depth = 0;
  for (let i = "light-dark(".length; i < value.length; i++) {
    if (value[i] === "(") depth++;
    if (value[i] === ")") depth--;
    if (value[i] === "," && depth === 0) return value.slice("light-dark(".length, i).trim();
  }
  return value;
}

/** The light theme out of the `:root {` block (ADR-0021: one block, both themes). */
function lightTheme(): Map<string, string> {
  const css = withoutComments(TOKENS);
  const start = css.indexOf(":root {");
  const body = css.slice(start + ":root {".length, css.indexOf("}", start));
  const values = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    values.set(name as string, lightOf((value as string).trim()));
  }
  return values;
}

/** Token and literal out of `--uc-x: var(--u-y, literal);`. */
function chain(variable: string): { token: string; literal: string } | null {
  const css = withoutComments(CHARTS_CSS);
  const pattern = new RegExp(`${variable}\\s*:\\s*var\\(\\s*(--[\\w-]+)\\s*,\\s*([^;]+)\\)\\s*;`);
  const match = pattern.exec(css);
  return match ? { token: match[1] as string, literal: (match[2] as string).trim() } : null;
}

describe("The charts fallback against the tokens", () => {
  const LIGHT = lightTheme();

  it.each(PAIRS)("%s: charts.css falls back over the expected token", (_field, variable, token) => {
    expect(chain(variable)?.token).toBe(token);
  });

  it.each(PAIRS)("%s: the literal in charts.css is the one in theme.ts", (field, variable) => {
    expect(same(chain(variable)?.literal ?? "")).toBe(same(FALLBACK_THEME[field]));
  });

  it.each(PAIRS)("%s: theme.ts is the light token", (field, _variable, token) => {
    const value = LIGHT.get(token);
    expect(value, `${token} is not in tokens.css`).toBeDefined();
    if (EXCEPTIONS[field] !== undefined) {
      expect(same(FALLBACK_THEME[field]), `Exception ${field} is stale`).not.toBe(same(value!));
      return;
    }
    expect(same(FALLBACK_THEME[field])).toBe(same(value!));
  });
});
