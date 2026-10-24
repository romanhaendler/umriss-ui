/* The stylesheets of a package read tokens instead of copying them out - the
   same rules as `packages/core/tests-unit/stylesheets.test.ts`, which there
   reads only the modules of @umriss-ui/core. What is read is the text.

   Colours, type, motion, radii and shadows are not checked here: the
   vocabulary check in that same file reads the stylesheets of every package.
   The caller hands in its own sources (a glob is relative to the file that
   writes it). */

import { describe, expect, it } from "vitest";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** `styles`: the `*.module.css` texts by path ("../src/..."); there have to be more than `moreThan`. */
export function styleGuard(pkg: string, styles: Record<string, string>, moreThan: number): void {
  const entries = () => Object.entries(styles).map(([path, text]) => [path.replace("../src/", ""), text] as const);

  describe(`Stylesheets of ${pkg} (ADR-0021)`, () => {
    it("begin with the layer order and keep every rule inside a layer of the library", () => {
      const offenders = entries().flatMap(([file, text]) => [
        ...(text.includes(LAYER_ORDER) ? [] : [`${file}: no layer order statement`]),
        ...offendersIn(text).map((offender) => `${file}: ${offender}`),
      ]);
      expect(offenders).toEqual([]);
    });
  });

  describe(`Stylesheets of ${pkg}`, () => {
    it("find any stylesheets at all", () => {
      expect(entries().length).toBeGreaterThan(moreThan);
    });

    it("declare no variable that is named like a token", () => {
      const found = entries().flatMap(([file, css]) =>
        [...withoutComments(css).matchAll(/(?:^|[;{\s])(--u-[\w-]+)\s*:/g)].map((t) => `${file}: ${t[1]}`),
      );
      expect(found).toEqual([]);
    });

    it("declare and read only tokens and their own package's private custom properties", () => {
      const short = pkg.replace("@umriss-ui/", "");
      const found = entries().flatMap(([file, css]) =>
        [...withoutComments(css).matchAll(/(?:^|[;{\s(])(--[\w-]+)/g)]
          .map((t) => t[1]!)
          .filter((name) => !/^--uc?-/.test(name) && !name.startsWith(`--_${short}-`))
          .map((name) => `${file}: ${name}`),
      );
      expect([...new Set(found)]).toEqual([]);
    });

    it("do not copy out the hover edge", () => {
      const found = entries()
        .filter(([, css]) => /color-mix\(in srgb, var\(--u-color-text\) 30%, transparent\)/.test(css))
        .map(([file]) => file);
      expect(found).toEqual([]);
    });
  });
}
