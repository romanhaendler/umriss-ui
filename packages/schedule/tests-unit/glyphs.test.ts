/* The glyphs of @umriss-ui/schedule keep core's specification - one stroke
   width at one nominal size (`packages/core/docs/glyphs.md`). The rules stand
   once, in `scripts/glyphs.ts`; a glyph core's set already has is imported from
   its public entry instead of being drawn here again. */

import { expect, it } from "vitest";
import { glyphOffenders } from "../../../scripts/glyphs.ts";

const SOURCES = import.meta.glob("../src/**/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

it("every glyph of @umriss-ui/schedule keeps one stroke width at the nominal size, in currentColor, without fill, hidden", () => {
  expect(glyphOffenders(SOURCES, {})).toEqual([]);
});
