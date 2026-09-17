/* Every element the table puts into the tab order shows the focus in a style
   of its own (ADR-0021) - read from the source, so that nothing escapes because it
   is only rendered while a drag is in flight. The same reading as core's guard
   (`scripts/styles/focus.ts`).

   The schedule puts nothing into the tab order today - its grips are for the
   pointer and hidden from assistive technology - so the guard holds the
   promise for the day something is added. */

import { describe, expect, it } from "vitest";
import { focusableElements, hasFocusStyle } from "../../../scripts/styles/focus.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;
const STYLESHEETS = Object.values(
  import.meta.glob("../src/**/*.module.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>,
).join("\n");

describe("Focus styles of @umriss-ui/schedule (ADR-0021)", () => {
  const elements = Object.entries(SOURCES).flatMap(([path, source]) =>
    focusableElements(path.replace("../src/", ""), source),
  );

  it("put nothing into the tab order yet", () => {
    expect(elements).toEqual([]);
  });

  it("give every element in the tab order a focus style of its own", () => {
    expect(elements.filter((element) => !hasFocusStyle(element.classes, STYLESHEETS)).map((e) => e.key)).toEqual([]);
  });
});
