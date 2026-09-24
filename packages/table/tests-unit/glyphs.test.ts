/* The glyphs of @umriss-ui/table keep core's specification - one stroke width
   at one nominal size (`packages/core/docs/glyphs.md`). The rules stand once,
   in `scripts/glyphs.ts`; a glyph core's set already has is imported from its
   public entry instead of being drawn here again. */

import { describe, expect, it } from "vitest";
import { glyphOffenders, glyphsIn } from "../../../scripts/glyphs.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const sources = Object.fromEntries(Object.entries(SOURCES).map(([path, text]) => [path.replace("../src/", ""), text]));

/** Drawings that are not glyphs, by file - each one with a reason. */
const NOT_GLYPHS: Readonly<Record<string, string>> = {
  "filter.tsx":
    "The funnel fills when its column is filtered - it depicts a state, and a glyph is drawn with the stroke alone.",
};

describe("Glyphs of @umriss-ui/table", () => {
  it("all keep one stroke width at the nominal size, in currentColor, without fill, hidden", () => {
    expect(glyphOffenders(sources, NOT_GLYPHS)).toEqual([]);
  });

  it("name every exception with a reason, and only drawings that still exist", () => {
    for (const [file, reason] of Object.entries(NOT_GLYPHS)) {
      expect(glyphsIn(sources[file] ?? ""), `${file} is stale`).not.toEqual([]);
      expect(reason.length).toBeGreaterThan(20);
    }
  });
});
