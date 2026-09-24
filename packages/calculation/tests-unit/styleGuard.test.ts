/* The stylesheets of @umriss-ui/calculation read tokens instead of copying them out -
   the same rules as `packages/core/tests-unit/stylesheets.test.ts`, which there
   reads only the modules of @umriss-ui/core. What is read is the text.

   Colours, type, motion, radii and shadows are not checked here: the
   vocabulary check in that same file reads the stylesheets of every package
   (visuelle-wertigkeit 01). */

import { describe, expect, it } from "vitest";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

const STYLES = import.meta.glob("../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entries = () => Object.entries(STYLES).map(([path, text]) => [path.replace("../src/", ""), text] as const);

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

describe("Stylesheets of @umriss-ui/calculation (ADR-0021)", () => {
  it("begin with the layer order and keep every rule inside a layer of the library", () => {
    const offenders = entries().flatMap(([file, text]) => [
      ...(text.includes(LAYER_ORDER) ? [] : [`${file}: no layer order statement`]),
      ...offendersIn(text).map((offender) => `${file}: ${offender}`),
    ]);
    expect(offenders).toEqual([]);
  });
});

describe("Stylesheets of @umriss-ui/calculation", () => {
  it("find any stylesheets at all", () => {
    expect(entries().length).toBeGreaterThan(0);
  });

  it("declare no variable that is named like a token", () => {
    const found = entries().flatMap(([file, css]) =>
      [...withoutComments(css).matchAll(/(?:^|[;{\s])(--u-[\w-]+)\s*:/g)].map((t) => `${file}: ${t[1]}`),
    );
    expect(found).toEqual([]);
  });

  it("do not copy out the hover edge", () => {
    const found = entries()
      .filter(([, css]) => /color-mix\(in srgb, var\(--u-color-text\) 30%, transparent\)/.test(css))
      .map(([file]) => file);
    expect(found).toEqual([]);
  });
});
