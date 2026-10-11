/* The glyphs of a package keep core's specification - one stroke width at one
   nominal size (`packages/core/docs/glyphs.md`). The rules stand once, in
   `scripts/glyphs.ts`. For a package without exceptions; table keeps its own. */

import { expect, it } from "vitest";
import { glyphOffenders } from "../../../scripts/glyphs.ts";

export function glyphGuard(pkg: string, sources: Record<string, string>): void {
  it(`every glyph of ${pkg} keeps one stroke width at the nominal size, in currentColor, without fill, hidden`, () => {
    expect(glyphOffenders(sources, {})).toEqual([]);
  });
}
