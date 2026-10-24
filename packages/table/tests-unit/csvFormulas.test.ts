/* Text a spreadsheet would run as a formula is written with a leading
   apostrophe; numbers, booleans and the clipboard text stay as they were. */

import { describe, expect, it } from "vitest";
import { asCsv, asTabbed } from "../src/model/csv";
import type { CsvColumn } from "../src/model/csv";

const one = (value: string | number | boolean, label = "L") => {
  const columns: CsvColumn<unknown>[] = [{ id: "c", label, value: () => value }];
  return asCsv([{}], columns).replace("﻿", "").split("\r\n");
};

describe("CSV formulas", () => {
  it.each(["=1+1", "+SUM(A1)", "-x", "@SUM(1)", "\tx", "\rx"])("neutralises %j", (text) => {
    const data = one(text).slice(1).join("\r\n").replace(/^"|"$/g, "");
    expect(data).toBe(`'${text}`);
  });

  it("neutralises and quotes a formula with quotation marks", () => {
    expect(one('=HYPERLINK("x")')[1]).toBe(`"'=HYPERLINK(""x"")"`);
  });

  it("neutralises a label", () => {
    expect(one("a", "=evil")[0]).toBe("'=evil");
  });

  it("leaves numbers, booleans and plain text alone", () => {
    expect(one(-3)[1]).toBe("-3");
    expect(one(true)[1]).toBe("yes");
    expect(one("2026-10-24")[1]).toBe("2026-10-24");
  });

  it("leaves the clipboard text alone", () => {
    const columns: CsvColumn<unknown>[] = [{ id: "c", label: "L", value: () => "=1+1" }];
    expect(asTabbed([{}], columns)).toBe("L\n=1+1");
  });
});
