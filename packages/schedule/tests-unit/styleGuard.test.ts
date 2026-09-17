/* The stylesheets of @umriss-ui/schedule read tokens instead of copying them out -
   the same rules as `packages/core/tests-unit/stylesheets.test.ts`, which there
   reads only the modules of @umriss-ui/core. What is read is the text. */

import { describe, expect, it } from "vitest";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

const STYLES = import.meta.glob("../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entries = () => Object.entries(STYLES).map(([path, text]) => [path.replace("../src/", ""), text] as const);

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

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

/** Raw durations that may stay, as "file: value" - each one with a reason. */
const ALLOWED_DURATIONS: Readonly<Record<string, string>> = {};

describe("Stylesheets of @umriss-ui/schedule (ADR-0021)", () => {
  it("begin with the layer order and keep every rule inside a layer of the library", () => {
    const offenders = entries().flatMap(([file, text]) => [
      ...(text.includes(LAYER_ORDER) ? [] : [`${file}: no layer order statement`]),
      ...offendersIn(text).map((offender) => `${file}: ${offender}`),
    ]);
    expect(offenders).toEqual([]);
  });
});

describe("Stylesheets of @umriss-ui/schedule", () => {
  it("find any stylesheets at all", () => {
    expect(entries().length).toBeGreaterThan(0);
  });

  it("write no colour value by hand", () => {
    const found = entries().flatMap(([file, css]) =>
      [...withoutComments(css).matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(/g)].map((t) => `${file}: ${t[0]}`),
    );
    expect(found).toEqual([]);
  });

  it("write no duration by hand, except the named ones", () => {
    const found = entries().flatMap(([file, css]) =>
      [...withoutReducedMotion(withoutComments(css)).matchAll(/(?<![\w.-])\d*\.?\d+m?s\b/g)]
        .map((t) => `${file}: ${t[0]}`)
        .filter((hit) => !(hit in ALLOWED_DURATIONS)),
    );
    expect(found).toEqual([]);
  });

  it("still carries every allowed duration, and each one with a reason", () => {
    for (const [hit, reason] of Object.entries(ALLOWED_DURATIONS)) {
      const [file, value] = hit.split(": ") as [string, string];
      expect(withoutComments(STYLES[`../src/${file}`] ?? ""), `${hit} is stale`).toContain(value);
      expect(reason.length).toBeGreaterThan(20);
    }
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
