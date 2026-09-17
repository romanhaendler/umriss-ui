/* Every element a component of @umriss-ui/core puts into the tab order shows
   the focus in a style of its own (ADR-0021) - read from the source, so that a
   panel which is closed while the browser check tabs through the demo is
   covered as well. The reading stands in `scripts/styles/focus.ts`. */

import { describe, expect, it } from "vitest";
import { focusableElements, hasFocusStyle } from "../../../scripts/styles/focus.ts";

const SOURCES = import.meta.glob("../src/components/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const STYLES = import.meta.glob("../src/components/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Focusable elements whose focus the reading cannot see, each with its reason. */
const SHOWN_ELSEWHERE: Readonly<Record<string, string>> = {
  "Input/Input.tsx input":
    "The element takes its classes from a variable; `.input:focus-visible` rings it, and inside the clearable wrapper `.wrapper:focus-within` does.",
  "Select/Select.tsx select":
    "The element takes its classes from a variable; `.select:focus-visible` rings it.",
};

const folderOf = (path: string) => path.slice(0, path.lastIndexOf("/"));

describe("Focus styles of the components (ADR-0021)", () => {
  const elements = Object.entries(SOURCES).flatMap(([path, source]) => {
    const file = path.replace("../src/components/", "");
    const stylesheets = Object.entries(STYLES)
      .filter(([cssPath]) => folderOf(cssPath) === folderOf(path))
      .map(([, css]) => css)
      .join("\n");
    return focusableElements(file, source).map((element) => ({ ...element, stylesheets }));
  });

  it("find focusable elements at all", () => {
    expect(elements.length).toBeGreaterThan(20);
  });

  it("give every element in the tab order a focus style of its own", () => {
    const without = elements
      .filter((element) => !hasFocusStyle(element.classes, element.stylesheets))
      .map((element) => element.key)
      .filter((key) => !(key in SHOWN_ELSEWHERE));
    expect(without).toEqual([]);
  });

  it("still needs every exception it names", () => {
    const keys = new Set(elements.map((element) => element.key));
    expect(Object.keys(SHOWN_ELSEWHERE).filter((key) => !keys.has(key))).toEqual([]);
  });
});
