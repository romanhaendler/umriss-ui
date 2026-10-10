/* The build folds the copies of `#own-styles` (control-sizes 06). What it has
   to hold is the one thing that keeps every picture: of a rule that stands
   several times, the LAST copy stays where it stood, and nothing else moves. */

import { describe, expect, it } from "vitest";
import { foldOwnCopies } from "../../../scripts/styles/ownStyles.ts";

const squeeze = (css: string) => css.replace(/\s+/g, " ").trim();

describe("foldOwnCopies", () => {
  it("keeps the last copy of an own rule, so a component's rule before it still loses", () => {
    const own = "._field_1krlf_91._field_1krlf_91 { font-size: 16px; }";
    const css = `@layer umriss.components { ${own} ._sm_ab12c_3 ._input_ab12c_9 { font-size: 11px; } ${own} ._item_cd34e_5 { color: red; } }`;
    expect(squeeze(foldOwnCopies(css))).toBe(
      squeeze(`@layer umriss.components { ._sm_ab12c_3 ._input_ab12c_9 { font-size: 11px; } ${own} ._item_cd34e_5 { color: red; } }`),
    );
  });

  it("folds within a layer and a media query only, and leaves other rules alone", () => {
    const own = "._ring_1krlf_40:focus-visible { outline: 2px solid; }";
    const twice = "._row_ab12c_3 { color: red; }";
    const css = `@layer umriss.base { ${own} } @layer umriss.components { ${own} @media (pointer: coarse) { ${own} } ${twice} ${twice} }`;
    expect(squeeze(foldOwnCopies(css))).toBe(squeeze(css));
  });
});
