/* What a sheet of paper gets of the alarms: print is laid out only in a real
   print, so this reads the stylesheet; the sheets themselves were looked at
   in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/AlarmList.module.css?raw";

const PRINT = CSS.slice(CSS.lastIndexOf("@media print"));

describe("Print", () => {
  it("leaves the bar's buttons off the sheet", () => {
    expect(PRINT).toMatch(/\.bar button\s*\{\s*display:\s*none/);
  });
});
