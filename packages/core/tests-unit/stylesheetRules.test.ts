/* The two rules every stylesheet of the library obeys (ADR-0021), tested as
   functions: what lies outside a layer, what selects beyond the library's own
   elements, and which rules the build gives `box-sizing: border-box`.

   The rules themselves stand in `scripts/styles/` because three packages, their
   demo builds and the dist check share them. */

import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { ownBox, ownCorners } from "../../../scripts/styles/ownBox.ts";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

const layered = (body: string) => `${LAYER_ORDER}\n@layer umriss.components {\n${body}\n}`;

describe("offendersIn", () => {
  it("accepts a layered stylesheet of class rules", () => {
    expect(offendersIn(layered(".a { color: red; }\n.a:hover > .b::before { content: ''; }"))).toEqual([]);
  });

  it("names a rule outside a layer", () => {
    expect(offendersIn(`${LAYER_ORDER}\n.a { color: red; }`)).toEqual([".a: outside a layer"]);
  });

  it("names a layer that is not the library's", () => {
    expect(offendersIn("@layer app { .a { color: red; } }")).toEqual(["@layer app: not a layer of the library"]);
  });

  it.each(["html", "body", "*", "*::before", "::selection", ":focus-visible", "input", "[data-x]", "*::-webkit-scrollbar"])(
    "names %s, which selects beyond the library's own elements",
    (selector) => {
      expect(offendersIn(layered(`${selector} { color: red; }`))).toEqual([`${selector}: selects beyond the library's own elements`]);
    },
  );

  it("checks every selector of a list on its own", () => {
    expect(offendersIn(layered(".a, body { margin: 0; }"))).toEqual(["body: selects beyond the library's own elements"]);
  });

  it("allows :root with custom properties only", () => {
    const tokens = `${LAYER_ORDER}\n@layer umriss.tokens {\n:root { --u-x: 1px; }\n@media (prefers-reduced-motion: reduce) { :root { --u-y: 0ms; } }\n}`;
    expect(offendersIn(tokens)).toEqual([]);
    expect(offendersIn(`${LAYER_ORDER}\n@layer umriss.tokens { :root { --u-x: 1px; color-scheme: light; } }`)).toEqual([
      ":root: declares color-scheme, not only custom properties",
    ]);
  });

  it("does not read the steps of a keyframes block as selectors", () => {
    expect(offendersIn(layered("@keyframes spin { from { rotate: 0deg; } 50% { rotate: 180deg; } to { rotate: 360deg; } }"))).toEqual([]);
  });
});

const run = (css: string) => postcss([ownBox()]).process(css, { from: undefined }).css;

/** The selectors the step gave a rule of their own. */
const boxed = (css: string) =>
  [...run(css).matchAll(/([^{}]+)\{ box-sizing: border-box; \}/g)].map((m) => m[1]!.trim());

describe("ownBox", () => {
  it("gives every class of the stylesheet a rule of its own", () => {
    expect(boxed(".a { color: red; }")).toEqual([".a"]);
    expect(boxed(".a:hover > .b::before { color: red; }")).toEqual([".a", ".b"]);
  });

  it("reaches a class that only ever stands in a compound selector", () => {
    expect(boxed('.verdict[data-verdict="warning"] .value { color: red; }')).toEqual([".verdict", ".value"]);
  });

  it("gives an own element named by type its full selector, never a bare type", () => {
    expect(boxed(".field input { color: red; }")).toEqual([".field", ".field input"]);
  });

  it.each([".a > *", ".a *", ".a > *::after", ".a :focus-visible"])("never gives %s's subject a box - it is the caller's", (selector) => {
    expect(boxed(`${selector} { color: red; }`)).toEqual([".a"]);
  });

  it.each([":root", "html", "body", "*", "[data-x]"])("leaves %s alone", (selector) => {
    expect(run(`${selector} { color: red; }`)).not.toContain("box-sizing");
  });

  it("does not read a class inside brackets as one of the stylesheet's", () => {
    expect(boxed(".a:not(.b) { color: red; }")).toEqual([".a"]);
  });

  it("respects a box-sizing the stylesheet declares for a class", () => {
    expect(boxed(".a { box-sizing: content-box; }\n.a > .b { color: red; }")).toEqual([".b"]);
  });

  it("gives each class one rule, at the head of its layer, before every rule of the stylesheet", () => {
    const out = run("@layer umriss.components {\n  .a { color: red; }\n  @media (hover: none) { .a .b { margin: 0; } }\n}");
    expect(out.match(/box-sizing/g)).toHaveLength(2);
    expect(out.indexOf("box-sizing")).toBeLessThan(out.indexOf("color: red"));
    expect(out.indexOf(".b { box-sizing")).toBeLessThan(out.indexOf("@media"));
  });

  it("does not touch the steps of a keyframes block", () => {
    expect(run("@keyframes spin { from { rotate: 0deg; } }")).not.toContain("box-sizing");
  });
});

const corners = (css: string) => postcss([ownCorners()]).process(css, { from: undefined }).css;

describe("ownCorners", () => {
  it("gives an own element with a radius squircle corners, right after the radius", () => {
    expect(corners(".a { border-radius: 4px; color: red; }")).toBe(".a { border-radius: 4px; corner-shape: squircle; color: red; }");
  });

  it("counts the longhands of the radius", () => {
    expect(corners(".a { border-top-left-radius: 4px; }")).toContain("corner-shape: squircle");
  });

  it("leaves a rule without a radius, a caller's element and a declared corner shape alone", () => {
    expect(corners(".a { color: red; }")).not.toContain("corner-shape");
    expect(corners(".a > * { border-radius: 4px; }")).not.toContain("corner-shape");
    expect(corners(".a { border-radius: 4px; corner-shape: round; }").match(/corner-shape/g)).toHaveLength(1);
  });
});
