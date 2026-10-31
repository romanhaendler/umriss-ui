/* What a sheet of paper gets of the charts: print is laid out only in a real
   print, so this reads the stylesheet; the sheets themselves were looked at
   in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/styles/charts.css?raw";

const PRINT = CSS.slice(CSS.lastIndexOf("@media print"));

describe("Print", () => {
  it("leaves the show-all button and the tooltip off the sheet", () => {
    expect(PRINT).toMatch(/\.uc-show-all,\s*\.uc-tooltip\s*\{\s*display:\s*none/);
  });
});
