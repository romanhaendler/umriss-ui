/* What a sheet of paper gets of the calculation: print is laid out only in a real
   print, so this reads the stylesheet; the sheets themselves were looked at
   in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/Calculation.module.css?raw";

const PRINT = CSS.slice(CSS.lastIndexOf("@media print"));

describe("Print", () => {
  it("opens every derivation and leaves the disclosure off", () => {
    expect(PRINT).toMatch(/\.derivation\[hidden\]\s*\{\s*display:\s*grid/);
    expect(PRINT).toMatch(/\.frame \.disclosure\s*\{\s*display:\s*none/);
  });

  it("prints the frame without a scroll box", () => {
    expect(PRINT).toMatch(/\.frame\s*\{[^}]*overflow:\s*visible/);
  });
});
