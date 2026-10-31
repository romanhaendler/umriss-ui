/* What a sheet of paper gets of the schedule: print is laid out only in a real
   print, so this reads the stylesheet; the sheets themselves were looked at
   in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/Schedule.module.css?raw";

const PRINT = CSS.slice(CSS.lastIndexOf("@media print"));

describe("Print", () => {
  it.each([".chevron", ".grip", ".tooltip", ".focusRing"])("leaves %s off the sheet", (selector) => {
    expect(PRINT.slice(0, PRINT.indexOf("display: none;"))).toMatch(new RegExp(`${selector.replace(".", "\\.")}[,\\s]`));
  });
});
