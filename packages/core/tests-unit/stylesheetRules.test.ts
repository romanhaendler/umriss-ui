/* The two rules every stylesheet of the library obeys (ADR-0021), tested as
   functions: what lies outside a layer, what selects beyond the library's own
   elements, and which rules the build gives `box-sizing: border-box`.

   The rules themselves stand in `scripts/styles/` because three packages, their
   demo builds and the dist check share them. */

import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { ownBox } from "../../../scripts/styles/ownBox.ts";
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

describe("ownBox", () => {
  it.each([".a", ".a:hover", ".a::before", ".a input", ".a > .b", ".a[data-open]"])("gives %s border-box", (selector) => {
    expect(run(`${selector} { color: red; }`)).toContain("box-sizing: border-box");
  });

  it.each([".a > *", ".a *", ".a > *::after", ".a :focus-visible", ":root", "html", "body", "*"])(
    "leaves %s alone - it is not an own element",
    (selector) => {
      expect(run(`${selector} { color: red; }`)).not.toContain("box-sizing");
    },
  );

  it("gives only the own selectors of a mixed list border-box, without touching the rule", () => {
    const out = run(".a > *, .b { color: red; }");
    expect(out).toContain(".b { box-sizing: border-box; }");
    expect(out).toContain(".a > *, .b { color: red; }");
  });

  it("respects a box-sizing the stylesheet declares for that selector anywhere", () => {
    const out = run(".a { box-sizing: content-box; }\n.a { color: red; }");
    expect(out.match(/box-sizing/g)).toHaveLength(1);
  });

  it("gives a selector border-box once, however many rules it has", () => {
    expect(run(".a { color: red; }\n.a { margin: 0; }").match(/box-sizing/g)).toHaveLength(1);
  });

  it("does not touch the steps of a keyframes block", () => {
    expect(run("@keyframes spin { from { rotate: 0deg; } }")).not.toContain("box-sizing");
  });
});
