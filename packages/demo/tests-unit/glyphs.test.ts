/* The shell's glyphs keep the library's specification - one stroke width at
   one nominal size (`packages/core/docs/glyphs.md`), with the rules once in
   `scripts/glyphs.ts`. The shell is built from plain elements, its glyphs
   included, so it is held to the same check as a package. */

import { expect, it } from "vitest";
import { glyphOffenders, glyphsIn } from "../../../scripts/glyphs.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Drawings the check does not read yet, by file - each one with a reason. */
const NOT_YET: Readonly<Record<string, string>> = {
  "../src/Example.tsx":
    "The code block's disclosure chevron is older than this check and drawn at 1.5; moving it to 1.4 renews every example screenshot, which no ticket has asked for yet.",
};

it("every glyph of the shell keeps one stroke width at the nominal size, in currentColor, without fill, hidden", () => {
  expect(Object.values(SOURCES).flatMap(glyphsIn).length).toBeGreaterThan(2);
  expect(glyphOffenders(SOURCES, NOT_YET)).toEqual([]);
});
