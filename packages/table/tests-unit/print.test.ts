/* What a sheet of paper gets of a table: the rows, and nothing that answers a
   pointer or holds a row in place while it scrolls. Print is laid out only in
   a real print, so this reads the stylesheet; the sheets themselves were looked
   at in Chromium's PDF output. */

import { describe, expect, it } from "vitest";
import CSS from "../src/Table.module.css?raw";

const start = CSS.lastIndexOf("@media print");
const PRINT = CSS.slice(start);

describe("Print", () => {
  it.each([".toolbar", ".pagination", ".control", ".actionsCell", ".grip", ".filterButton"])("leaves %s off the sheet", (selector) => {
    const list = PRINT.slice(0, PRINT.indexOf("display: none;"));
    expect(list).toContain(`${selector},`);
  });

  it("puts sticky and pinned cells back into the flow", () => {
    expect(PRINT).toMatch(/\.sticky \.th,[\s\S]*\.pinned,[\s\S]*position:\s*static/);
  });

  it("repeats the head on every sheet and gives a head button up so that its label is painted there", () => {
    expect(PRINT).toMatch(/\.table thead\s*\{\s*display:\s*table-header-group/);
    expect(PRINT).toMatch(/\.sortButton\s*\{\s*display:\s*contents/);
  });

  it("prints the rows without a scroll box", () => {
    expect(CSS).toMatch(/@media print\s*\{\s*\.scroll\s*\{[^}]*overflow:\s*visible/);
  });
});
