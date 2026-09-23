/* The stylesheet of @umriss-ui/charts against ADR-0021: it begins with the
   layer order, every rule lies inside a layer of the library, and no selector
   reaches beyond the chart's own `uc-` elements. The same rules as the guards of
   core and table (`scripts/styles/rules.ts`). */

import { describe, expect, it } from "vitest";
import CHARTS_CSS from "../src/styles/charts.css?raw";
import { LAYER_ORDER, offendersIn } from "../../../scripts/styles/rules.ts";

describe("The stylesheet of @umriss-ui/charts (ADR-0021)", () => {
  it("begins with the layer order", () => {
    expect(CHARTS_CSS).toContain(LAYER_ORDER);
  });

  it("keeps every rule inside a layer of the library and selects only its own elements", () => {
    expect(offendersIn(CHARTS_CSS)).toEqual([]);
  });

  it("couples to core only in a --uc-* declaration (R-1.6)", () => {
    const css = CHARTS_CSS.replace(/\/\*[\s\S]*?\*\//g, "");
    const loose = css
      .split(";")
      .filter((d) => d.includes("var(--u-") && !/^\s*--uc-[\w-]+\s*:/.test(d.split("{").pop() ?? ""));
    expect(loose).toEqual([]);
  });
});
