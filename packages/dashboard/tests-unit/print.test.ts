/* What a sheet of paper gets of the dashboard: print is laid out only in a real
   print, so this reads the stylesheet; the sheets themselves were looked at
   in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/Dashboard.module.css?raw";

const PRINT = CSS.slice(CSS.lastIndexOf("@media print"));

describe("Print", () => {
  it.each([".bar", ".grip", ".head button"])("leaves %s off the sheet", (selector) => {
    expect(PRINT.slice(0, PRINT.indexOf("display: none;"))).toContain(selector);
  });

  it("does not break a widget across two sheets", () => {
    expect(PRINT).toMatch(/\.item\s*\{\s*break-inside:\s*avoid/);
  });
});
