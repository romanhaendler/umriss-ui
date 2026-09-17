/* Every element the table puts into the tab order shows the focus in a style
   of its own (ADR-0021) - read from the source, so that the filter panel, the
   column menu and the row actions are covered while they are closed. The same
   reading as core's guard (`scripts/styles/focus.ts`); the table's parts share
   their stylesheets across files, so each source is read against all of them. */

import { describe, expect, it } from "vitest";
import { focusableElements, hasFocusStyle } from "../../../scripts/styles/focus.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const STYLESHEETS = Object.values(
  import.meta.glob("../src/**/*.module.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
).join("\n");

describe("Focus styles of @umriss-ui/table (ADR-0021)", () => {
  const elements = Object.entries(SOURCES).flatMap(([path, source]) =>
    focusableElements(path.replace("../src/", ""), source),
  );

  it("find focusable elements at all", () => {
    expect(elements.length).toBeGreaterThan(5);
  });

  it("give every element in the tab order a focus style of its own", () => {
    expect(elements.filter((element) => !hasFocusStyle(element.classes, STYLESHEETS)).map((e) => e.key)).toEqual([]);
  });
});
