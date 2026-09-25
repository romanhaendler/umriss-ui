/* Every element the table puts into the tab order shows the focus in a style
   of its own (ADR-0021) - read from the source, so that nothing escapes because it
   is only rendered while a drag is in flight. The same reading as core's guard
   (`scripts/styles/focus.ts`).

   The schedule put nothing into the tab order until lane groups arrived
   (schedule-lane-groups 08): its grips are for the pointer and hidden from
   assistive technology. The chevron that folds a group is a real button, and
   the plot has been a tab stop since schedule-a11y. */

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

  it("puts the fold controls and the plot into the tab order", () => {
    /* The chevron of a lane group's header is here because a fold a screen
       reader cannot reach is a view a screen reader cannot leave; the plot,
       since schedule-a11y, as the one tab stop whose keys walk the subtasks
       (ADR-0030). The grips stay the pointer's. */
    expect(elements.map((element) => element.key)).toEqual(["Schedule.tsx button .chevron", "Schedule.tsx div .plot"]);
  });

  it("give every element in the tab order a focus style of its own", () => {
    expect(elements.filter((element) => !hasFocusStyle(element.classes, STYLESHEETS)).map((e) => e.key)).toEqual([]);
  });
});
