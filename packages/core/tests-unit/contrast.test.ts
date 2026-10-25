/* Contrast of the token pairs the design really uses (WCAG 2.1).

   The colour values are read at runtime out of src/styles/tokens.css, not held
   as literals in the test: that way the test falls at the moment a token
   changes, and not only once somebody remembers to follow it up.

   The expected values come from the standard - 4.5:1 for normal text (1.4.3),
   3:1 for large type and non-text contrasts (1.4.11) - and not from the way
   they are computed or from today's measurement. Where a pair does not reach
   4.5:1 today, that stands as a named exception with its measurement and its
   reason at the pair itself; the bound of the remaining pairs is untouched by
   it. */

/* The stylesheet comes in as text, not over the file system: Vite resolves
   `?raw` itself, the value is a string, and so the test needs neither
   @types/node nor any path arithmetic relative to import.meta.url. If
   tokens.css changes, this import changes with it. */
import STYLESHEET from "../src/styles/tokens.css?raw";
import ALERT_CSS from "../src/components/Alert/Alert.module.css?raw";
import TAG_CSS from "../src/components/Tag/Tag.module.css?raw";
import README from "../README.md?raw";
import CHARTS_CSS from "../../charts/src/styles/charts.css?raw";
import { describe, expect, it } from "vitest";

/* ---------------------------------------------------------------
   Token values out of the stylesheet
   --------------------------------------------------------------- */

type Theme = ReadonlyMap<string, string>;

/* The hex values of one theme out of the `:root` block. A token with two values
   stands there as `light-dark(<light>, <dark>)` (ADR-0021); one with a single
   value is the same in both themes. No CSS parser: the block contains no nested
   braces, so "up to the next closing brace" is enough. Everything that is not a
   hex value (shadows, measures, color-mix) drops out here - contrast is defined
   only over opaque colours. */
function readTheme(which: "light" | "dark", from = 0): Map<string, string> {
  const values = new Map<string, string>();
  const start = STYLESHEET.indexOf(":root {", from) + ":root {".length;
  const body = STYLESHEET.slice(start, STYLESHEET.indexOf("}", start));
  const HEX = "#[0-9a-fA-F]{3,8}";
  for (const line of body.matchAll(new RegExp(`(--[\\w-]+)\\s*:\\s*(?:(${HEX})|light-dark\\(\\s*(${HEX})\\s*,\\s*(${HEX})\\s*\\))\\s*;`, "g"))) {
    const value = line[2] ?? (which === "light" ? line[3] : line[4]);
    values.set(line[1]!, value!.toLowerCase());
  }
  return values;
}

const LIGHT: Theme = readTheme("light");
const DARK: Theme = readTheme("dark");

/* The block a reader who asks for more contrast gets (prefers-contrast: more),
   read on its own and laid over the theme it belongs to. */
const MORE_START = STYLESHEET.indexOf("@media (prefers-contrast: more)");
if (MORE_START < 0) throw new Error("No @media (prefers-contrast: more) block in tokens.css");
const MORE: readonly (readonly [ThemeName, Theme])[] = [
  ["light", new Map([...LIGHT, ...readTheme("light", MORE_START)])],
  ["dark", new Map([...DARK, ...readTheme("dark", MORE_START)])],
];

const THEMES = [
  ["light", LIGHT],
  ["dark", DARK],
] as const;

type ThemeName = (typeof THEMES)[number][0];

function colour(theme: Theme, token: string): string {
  const value = theme.get(token);
  if (value === undefined) throw new Error(`Token ${token} does not stand in tokens.css`);
  return value;
}

/* ---------------------------------------------------------------
   The WCAG arithmetic: relative luminance and contrast ratio
   --------------------------------------------------------------- */

function channels(hex: string): [number, number, number] {
  const digits = hex.replace("#", "");
  const full = digits.length === 3 ? digits.replace(/./g, (d) => d + d) : digits;
  if (!/^[0-9a-f]{6}$/.test(full)) throw new Error(`Not an opaque hex value: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

/* Undoing the gamma of the sRGB channel after WCAG 2.1 (definition "relative
   luminance"). The kink at 0.03928 belongs to the standard, not to an
   optimisation. */
const linear = (channel: number): number =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

function luminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/* (lighter + 0.05) / (darker + 0.05). The addend keeps the ratio finite and
   models the scattering of the screen. */
function contrast(fg: string, bg: string): number {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* A colour at an opacity over an opaque ground, as the browser mixes it:
   channel by channel in sRGB, ground + (colour - ground) * opacity. */
function mix(fg: string, bg: string, opacity: number): string {
  const f = channels(fg);
  const b = channels(bg);
  return (
    "#" +
    f
      .map((c, i) => Math.round((b[i]! + (c - b[i]!) * opacity) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

/* ---------------------------------------------------------------
   The pairs that are checked
   --------------------------------------------------------------- */

const BODY_TEXT = 4.5; // WCAG AA, normal text
const LARGE_TEXT = 3; // WCAG AA, large type and non-text

type Pair = {
  readonly name: string;
  readonly fg: string;
  readonly bg: string;
  /* A bound per theme, because an exception almost never holds in both. */
  readonly minimum: Readonly<Record<ThemeName, number>>;
};

const PAIRS: readonly Pair[] = [
  {
    name: "Body text on the surface",
    fg: "--u-color-text",
    bg: "--u-color-surface",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },
  {
    name: "Secondary text on the surface",
    fg: "--u-color-text-secondary",
    bg: "--u-color-surface",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* Exception, deliberately recorded rather than quietly left out: the muted
     text reaches 4.5:1 in neither theme and on neither of the two grounds -
     measured light 3.41:1 on the surface and 3.10:1 on the sunken surface, dark
     4.07:1 and 3.74:1. It carries labels, units and helper texts, never body
     text, and is therefore held here against the weaker bound of 3:1. Before
     the bound sinks for all pairs, it had better sink visibly here for these
     four. Whoever promotes the token to body text must first darken it (light)
     or lighten it (dark) and strike this exception. */
  {
    name: "Muted text on the surface",
    fg: "--u-color-text-muted",
    bg: "--u-color-surface",
    minimum: { light: LARGE_TEXT, dark: LARGE_TEXT },
  },
  {
    name: "Muted text on the sunken surface",
    fg: "--u-color-text-muted",
    bg: "--u-color-surface-sunken",
    minimum: { light: LARGE_TEXT, dark: LARGE_TEXT },
  },

  /* The tones as type (tone-contrast): each on its own pale surface and on both
     grounds it lands on, in both themes, at the full bound - including where it
     passes today, because a tone that only gets through by accident is not a
     system. Danger reads a text token of its own, as the accent does: the
     surface value measured only 4.40:1 on the dark subtle danger surface. */
  ...([
    ["--u-color-success", "--u-color-success-subtle"],
    ["--u-color-success", "--u-color-surface"],
    ["--u-color-success", "--u-color-bg"],
    ["--u-color-warning", "--u-color-warning-subtle"],
    ["--u-color-warning", "--u-color-surface"],
    ["--u-color-warning", "--u-color-bg"],
    ["--u-color-danger-text", "--u-color-danger-subtle"],
    ["--u-color-danger-text", "--u-color-surface"],
    ["--u-color-danger-text", "--u-color-bg"],
  ] as const).map(([fg, bg]) => ({
    name: `${fg} as text on ${bg}`,
    fg,
    bg,
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  })),

  /* The pressed surfaces of the interaction-state canon (visuelle-wertigkeit
     04), each under the type that stands on it while it is pressed. An optical
     upgrade must not cost legibility: the full bound, in both themes. */
  ...([
    ["--u-color-text", "--u-color-surface-pressed"],
    ["--u-color-text-secondary", "--u-color-surface-pressed"],
    ["--u-color-accent-text", "--u-color-accent-subtle-pressed"],
    ["--u-color-danger-text", "--u-color-danger-subtle-pressed"],
  ] as const).map(([fg, bg]) => ({
    name: `${fg} as text on ${bg}`,
    fg,
    bg,
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  })),

  /* Exception, light: 4.45:1 measured - five hundredths under the bound. The
     case is defused, because on the subtle accent surface the components set
     not --u-color-accent but the --u-color-accent-text provided for it (badge,
     tag, alert); --u-color-accent itself appears there only as a surface or an
     edge, for which 3:1 is the right bound. Carried here all the same, because
     the ticket names the pair and a disappearance from the list would destroy
     the information. Dark reaches 4.55:1 and stays at 4.5:1. */
  {
    name: "Accent on the subtle accent surface",
    fg: "--u-color-accent",
    bg: "--u-color-accent-subtle",
    minimum: { light: LARGE_TEXT, dark: BODY_TEXT },
  },

  /* The primary button reverses polarity in the dark theme; both directions
     have to hold, which is why the pair stands here and not only once. */
  {
    name: "Foreground of the primary button on its ground",
    fg: "--u-color-primary-fg",
    bg: "--u-color-primary-bg",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* The danger button's type (library-audit 07). It stood as `#ffffff` in the
     stylesheet and thereby past every check - in the dark theme white on the
     lighter danger surface measures 3.68:1. Now a token like
     `--u-color-on-accent`, and in the dark theme it reverses polarity as that
     one does. Hover lies lighter than the surface and is thus the better case. */
  {
    name: "Type on the danger surface",
    fg: "--u-color-on-danger",
    bg: "--u-color-danger",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* The type on a filled accent surface: a checkbox tick, a selected day, the
     dashboard's mode label (11 px). It reverses polarity in the dark theme. */
  {
    name: "Type on the accent surface",
    fg: "--u-color-on-accent",
    bg: "--u-color-accent",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* ---------------------------------------------------------------
     The translucent material (ADR-0012)

     WHAT THESE THREE PAIRS CHECK and what they do not. They hold the type
     against --u-color-material-fallback, that is against the OPAQUE colour
     under the material - what a browser without `backdrop-filter` actually
     paints. That is a real case, and the worst one that can be computed.

     They do NOT check --u-color-material itself. That is not a gap somebody
     forgot to close, but one that cannot be closed: the value carries alpha,
     and what ends up behind the type depends on what the user happened to have
     on screen. A ratio nobody can compute is not one anybody can promise.

     The promise is carried instead by the alpha floor in the token itself: it is
     high enough that legibility never depends on the translucency. Why it was
     decided that way stands in
     docs/adr/0012-a-translucent-material-needs-a-floor.md. Whoever misses a
     check of the translucent value here should read on there and not invent one
     here.
     --------------------------------------------------------------- */
  {
    name: "Body text on the material's fallback surface",
    fg: "--u-color-text",
    bg: "--u-color-material-fallback",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },
  {
    name: "Secondary text on the material's fallback surface",
    fg: "--u-color-text-secondary",
    bg: "--u-color-material-fallback",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },
  /* The matched characters of a find are drawn in the accent - that is text and
     not decoration, so the full bound applies. */
  {
    name: "Accent text on the material's fallback surface",
    fg: "--u-color-accent-text",
    bg: "--u-color-material-fallback",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* The accent carries links and active states and lies sometimes on the page
     ground, sometimes on a card. Both grounds are checked, because the lighter
     of the two is the harder one. */
  {
    name: "Accent on the page ground",
    fg: "--u-color-accent",
    bg: "--u-color-bg",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },
  {
    name: "Accent on the surface",
    fg: "--u-color-accent",
    bg: "--u-color-surface",
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  },

  /* The words of the labels (badge, tag, alert, the MultiSelect chip and
     counter) on the surface of their tone, at the full bound. The tones with a
     text token of their own are listed above; these are the neutral, the accent
     at rest and the alert's body text on every toned surface. */
  ...([
    ["--u-color-text-secondary", "--u-color-surface-sunken"],
    ["--u-color-accent-text", "--u-color-accent-subtle"],
    ["--u-color-text-secondary", "--u-color-accent-subtle"],
    ["--u-color-text-secondary", "--u-color-success-subtle"],
    ["--u-color-text-secondary", "--u-color-warning-subtle"],
    ["--u-color-text-secondary", "--u-color-danger-subtle"],
    ["--u-color-text", "--u-color-surface-sunken"],
  ] as const).map(([fg, bg]) => ({
    name: `${fg} as label text on ${bg}`,
    fg,
    bg,
    minimum: { light: BODY_TEXT, dark: BODY_TEXT },
  })),
];

/* ---------------------------------------------------------------
   The resting keys of the labels (1.4.11, 3:1)

   A key is a user-interface component and its glyph is what shows that it is
   there, so the glyph holds 3:1 against the surface it rests on in its resting
   state - the opacity it has before hover or focus. The opacity is read out of
   the component's stylesheet, so the test falls the moment somebody lowers it.

   Outside the bound, on purpose: the badge's dot is decorative (the word beside
   it carries the tone; measured 3.00 to 4.52), and a disabled tag is an
   inactive component, exempt from 1.4.3 and 1.4.11.
   --------------------------------------------------------------- */

/* The opacity a rule gives its key at rest: the first `opacity` declaration in
   the rule of that selector. Throws when it is not there rather than checking a
   default. */
function restingOpacity(css: string, selector: string): number {
  const rule = new RegExp(`\\n\\s*${selector.replace(".", "\\.")}\\s*\\{([^}]*)\\}`).exec(css);
  const value = rule && /opacity:\s*([0-9.]+)\s*;/.exec(rule[1]!);
  if (!value) throw new Error(`No resting opacity found for ${selector}`);
  return Number(value[1]);
}

type Key = {
  readonly name: string;
  readonly opacity: number;
  /* The glyph colour token and the surface it rests on, per tone. */
  readonly tones: readonly (readonly [fg: string, bg: string])[];
};

const KEYS: readonly Key[] = [
  {
    name: "Tag remove key",
    opacity: restingOpacity(TAG_CSS, ".remove"),
    tones: [
      ["--u-color-text-secondary", "--u-color-surface-sunken"],
      ["--u-color-accent-text", "--u-color-accent-subtle"],
      ["--u-color-success", "--u-color-success-subtle"],
      ["--u-color-warning", "--u-color-warning-subtle"],
      ["--u-color-danger-text", "--u-color-danger-subtle"],
    ],
  },
  {
    /* The close key is a child of the alert itself, not of its title or text,
       so it inherits the body text colour of the library's text context. */
    name: "Alert close key",
    opacity: restingOpacity(ALERT_CSS, ".close"),
    tones: [
      "--u-color-surface-sunken",
      "--u-color-accent-subtle",
      "--u-color-success-subtle",
      "--u-color-warning-subtle",
      "--u-color-danger-subtle",
    ].map((bg) => ["--u-color-text", bg] as const),
  },
];

/* ---------------------------------------------------------------
   Tests
   --------------------------------------------------------------- */

/* The arithmetic itself held against the standard, not against itself: black on
   white is 21:1 by definition, equal colours are 1:1. */
describe("contrast – the arithmetic", () => {
  it("yields the maximum of 21:1 for black on white", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });

  it("yields 1:1 for two equal colours", () => {
    expect(contrast("#0e7d72", "#0e7d72")).toBeCloseTo(1, 10);
  });

  it("is independent of the order", () => {
    expect(contrast("#171717", "#ffffff")).toBeCloseTo(contrast("#ffffff", "#171717"), 10);
  });

  it("reads the short form like the long one", () => {
    expect(luminance("#fff")).toBeCloseTo(luminance("#ffffff"), 10);
  });

  it("rejects a value that is not an opaque colour", () => {
    expect(() => luminance("rgba(23, 23, 23, 0.08)")).toThrow();
  });
});

describe("contrast – mixing a colour over its ground", () => {
  it("gives the colour itself at full opacity", () => {
    expect(mix("#0e7d72", "#ffffff", 1)).toBe("#0e7d72");
  });

  it("gives the ground at zero opacity", () => {
    expect(mix("#0e7d72", "#ffffff", 0)).toBe("#ffffff");
  });

  it("gives the middle at half opacity", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});

/* Without this bound a broken selector could mean that both runs quietly check
   the same light values and everything stays green. */
describe("Token source", () => {
  it("reads both themes out of tokens.css", () => {
    expect(LIGHT.size).toBeGreaterThan(10);
    expect(DARK.size).toBeGreaterThanOrEqual(LIGHT.size);
  });

  it("overrides the grounds and the type in the dark theme", () => {
    for (const token of ["--u-color-bg", "--u-color-surface", "--u-color-text"]) {
      expect(colour(DARK, token)).not.toBe(colour(LIGHT, token));
    }
  });

  it("resolves every token a pair names", () => {
    // If a token is missing, it should stand out clearly once here and not
    // scattered over every single pair test.
    for (const [, theme] of THEMES) {
      for (const pair of PAIRS) {
        expect(() => colour(theme, pair.fg)).not.toThrow();
        expect(() => colour(theme, pair.bg)).not.toThrow();
      }
    }
  });
});

for (const [themeName, theme] of THEMES) {
  describe(`Contrast in the "${themeName}" theme`, () => {
    for (const pair of PAIRS) {
      const minimum = pair.minimum[themeName];
      it(`${pair.name} reaches ${minimum}:1`, () => {
        const ratio = contrast(colour(theme, pair.fg), colour(theme, pair.bg));
        expect(ratio).toBeGreaterThanOrEqual(minimum);
      });
    }
  });
}

for (const [themeName, theme] of THEMES) {
  describe(`Resting keys in the "${themeName}" theme`, () => {
    for (const key of KEYS) {
      for (const [fg, bg] of key.tones) {
        it(`${key.name}: ${fg} on ${bg} reaches ${LARGE_TEXT}:1`, () => {
          const ground = colour(theme, bg);
          const glyph = mix(colour(theme, fg), ground, key.opacity);
          expect(contrast(glyph, ground)).toBeGreaterThanOrEqual(LARGE_TEXT);
        });
      }
    }
  });
}

/* ---------------------------------------------------------------
   Increased contrast (prefers-contrast: more)

   The quiet text pairs of the list above reach 7:1 under the block, in both
   themes (1.4.6). The edges, the hairlines and the hover edge reach 3:1 on the
   grounds they lie on (1.4.11).
   --------------------------------------------------------------- */

const QUIET_TEXT = ["--u-color-text-secondary", "--u-color-text-muted"] as const;
/* The grounds the quiet text stands on: the page, the surfaces and their pressed
   steps, the material's fallback, and the subtle tones that carry labels. */
const QUIET_GROUNDS = [
  "--u-color-bg",
  "--u-color-surface",
  "--u-color-surface-sunken",
  "--u-color-surface-pressed",
  "--u-color-material-fallback",
  "--u-color-accent-subtle",
  "--u-color-accent-subtle-pressed",
  "--u-color-success-subtle",
  "--u-color-warning-subtle",
  "--u-color-danger-subtle",
  "--u-color-danger-subtle-pressed",
] as const;
const EDGES = ["--u-edge-color", "--u-edge-color-strong", "--u-hairline", "--u-hairline-strong", "--u-color-edge-hover"] as const;
const EDGE_GROUNDS = ["--u-color-bg", "--u-color-surface", "--u-color-surface-sunken"] as const;
const MORE_TEXT = 7; // WCAG AAA, normal text (1.4.6)

for (const [themeName, theme] of MORE) {
  describe(`Increased contrast in the "${themeName}" theme`, () => {
    for (const fg of QUIET_TEXT) {
      for (const ground of QUIET_GROUNDS) {
        it(`${fg} on ${ground} reaches ${MORE_TEXT}:1`, () => {
          expect(contrast(colour(theme, fg), colour(theme, ground))).toBeGreaterThanOrEqual(MORE_TEXT);
        });
      }
    }
    for (const edge of EDGES) {
      for (const ground of EDGE_GROUNDS) {
        it(`${edge} on ${ground} reaches ${LARGE_TEXT}:1`, () => {
          expect(contrast(colour(theme, edge), colour(theme, ground))).toBeGreaterThanOrEqual(LARGE_TEXT);
        });
      }
    }
  });
}

/* ---------------------------------------------------------------
   The brand file of core's README

   The fenced block `css brand.css` is held to the stylesheets: it names only
   tokens that exist, it is complete, every colour has two values, and its
   colours pass the pairs above laid over the stylesheet's own.
   --------------------------------------------------------------- */

function readBrand(readme: string): Map<string, string> {
  const block = /```css brand\.css\n([\s\S]*?)\n```/.exec(readme);
  if (!block) throw new Error("No block `css brand.css` in core's README");
  const declarations = new Map<string, string>();
  for (const d of block[1]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) declarations.set(d[1]!, d[2]!.trim());
  return declarations;
}

const TWO_VALUES = /^light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)$/;

/* Every problem of a brand file, by token. */
function brandProblems(readme: string): string[] {
  const brand = readBrand(readme);
  const problems: string[] = [];
  const declared = (token: string) => new RegExp(`${token}\\s*:`).test(STYLESHEET);
  const chartsRead = [...CHARTS_CSS.matchAll(/var\((--u-chart-\d+)/g)].map((m) => m[1]!);
  const accent = [...STYLESHEET.matchAll(/(--u-color-(?:accent[\w-]*|on-accent))\s*:/g)].map((m) => m[1]!);

  for (const token of brand.keys()) {
    if (!declared(token) && !chartsRead.includes(token)) problems.push(`${token} is declared nowhere`);
  }
  for (const token of new Set([...accent, ...chartsRead])) {
    if (!brand.has(token)) problems.push(`${token} is missing`);
  }
  for (const [token, value] of brand) {
    if (token !== "--u-font-sans" && !TWO_VALUES.test(value)) problems.push(`${token} has no light and dark value`);
  }
  for (const [name, base] of THEMES) {
    const laid = new Map(base);
    for (const [token, value] of brand) {
      const two = TWO_VALUES.exec(value);
      if (two) laid.set(token, two[name === "light" ? 1 : 2]!.toLowerCase());
    }
    for (const pair of PAIRS) {
      if (!brand.has(pair.fg) && !brand.has(pair.bg)) continue;
      const ratio = contrast(colour(laid, pair.fg), colour(laid, pair.bg));
      if (ratio < pair.minimum[name]) {
        const set = brand.has(pair.fg) ? pair.fg : pair.bg;
        problems.push(`${set}: ${pair.name} is ${ratio.toFixed(2)}:1 in ${name}, under ${pair.minimum[name]}:1`);
      }
    }
  }
  return problems;
}

describe("The brand file of the README", () => {
  it("passes", () => {
    expect(brandProblems(README)).toEqual([]);
  });

  it("names a misspelt token", () => {
    expect(brandProblems(README.replace("--u-color-accent-hover:", "--u-color-acent-hover:"))).toEqual(
      expect.arrayContaining(["--u-color-acent-hover is declared nowhere", "--u-color-accent-hover is missing"]),
    );
  });

  it("names an accent token that was removed", () => {
    expect(brandProblems(README.replace(/ *--u-color-accent-subtle-pressed:.*\n/, ""))).toEqual([
      "--u-color-accent-subtle-pressed is missing",
    ]);
  });

  it("names a colour with one value only", () => {
    expect(brandProblems(README.replace("light-dark(#db2777, #f472b6)", "#db2777"))).toEqual([
      "--u-chart-2 has no light and dark value",
    ]);
  });

  it("names a dark on-accent that is white", () => {
    expect(brandProblems(README.replace("light-dark(#ffffff, #1e1b4b)", "light-dark(#ffffff, #ffffff)"))).toEqual([
      expect.stringContaining("--u-color-on-accent: Type on the accent surface is 2.98:1 in dark"),
    ]);
  });
});
