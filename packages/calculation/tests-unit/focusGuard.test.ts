/* Every element the calculation puts into the tab order shows the focus in a
   style of its own (ADR-0021) - read from the source, the same reading as
   core's guard (`scripts/styles/focus.ts`). */

import { describe, expect, it } from "vitest";
import { focusableElements, hasFocusStyle } from "../../../scripts/styles/focus.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const STYLESHEETS = Object.values(
  import.meta.glob("../src/**/*.module.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
).join("\n");

describe("Focus styles of @umriss-ui/calculation (ADR-0021)", () => {
  const elements = Object.entries(SOURCES).flatMap(([path, source]) =>
    focusableElements(path.replace("../src/", ""), source),
  );

  it("puts only the disclosure buttons into the tab order", () => {
    expect(elements.map((element) => element.key)).toEqual(["Calculation.tsx button .disclosure"]);
  });

  it("give every element in the tab order a focus style of its own", () => {
    expect(elements.filter((element) => !hasFocusStyle(element.classes, STYLESHEETS)).map((e) => e.key)).toEqual([]);
  });
});
