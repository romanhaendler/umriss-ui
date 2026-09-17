/* The components read tokens instead of copying them out (library-audit 07).

   The colour discipline of the stylesheets was almost complete - three literals
   in 4,650 lines - and each of the three was a defect: the modal's scrim dimmed
   the dark theme with the light value, and the danger button's text was exactly
   the pair the accessibility check tolerates. Durations stood twice, once in the
   stylesheet and once as a number in the code, and had drifted ten milliseconds
   apart.

   The text is read the way contrast.test.ts reads `tokens.css`. The rules are
   deliberately narrow: they check what this ticket repaired, so that it does not
   come back. Checking the full vocabulary for motion, type and curves is what
   `visuelle-wertigkeit` 01 wants; this is not that test. */

import { describe, expect, it } from "vitest";

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

/** Raw durations that may stay, as "file: value" - each with its reason. */
const ALLOWED_DURATIONS: Readonly<Record<string, string>> = {
  "Checkbox/Checkbox.module.css: 320ms":
    "The tick is drawn, slowly enough to watch; under reduced motion the transition falls away.",
  "Checkbox/Checkbox.module.css: 60ms": "The delay of that same tick.",
  "Spinner/Spinner.module.css: 700ms":
    "A steady process, not a motion between two states; the vocabulary for that is visuelle-wertigkeit 02.",
  "Skeleton/Skeleton.module.css: 1.6s": "The same case as the spinner.",
  "Button/Button.module.css: 80ms":
    "The press point - shorter than any token. It has a block for reduced motion; it gets a name with visuelle-wertigkeit 02.",
};

describe("Stylesheets of the components", () => {
  it("find any stylesheets at all", () => {
    expect(entries().length).toBeGreaterThan(30);
  });

  it("write no colour value by hand", () => {
    const finds = entries().flatMap(([file, css]) =>
      [...withoutComments(css).matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g)].map((m) => `${file}: ${m[0]}`),
    );
    expect(finds).toEqual([]);
  });

  it("write no duration by hand, other than the named ones", () => {
    const finds = entries().flatMap(([file, css]) =>
      [...withoutReducedMotion(withoutComments(css)).matchAll(/(?<![\w.-])\d*\.?\d+m?s\b/g)]
        .map((m) => `${file}: ${m[0]}`)
        .filter((find) => !(find in ALLOWED_DURATIONS)),
    );
    expect(finds).toEqual([]);
  });

  it("still carries every allowed duration, and each one with a reason", () => {
    for (const [find, reason] of Object.entries(ALLOWED_DURATIONS)) {
      const [file, value] = find.split(": ") as [string, string];
      expect(withoutComments(STYLES[`../src/components/${file}`] ?? ""), `${find} is out of date`).toContain(value);
      expect(reason.length).toBeGreaterThan(20);
    }
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
