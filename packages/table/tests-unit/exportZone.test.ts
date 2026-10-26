import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS, DEFAULT_WORDING, zoneFields } from "@umriss-ui/core";
import { xlsx } from "../src/xlsx";
import { csv } from "../src/export";
import { sheetXml } from "../src/xlsx/sheet";
import type { ExportSheet } from "../src/types";

const zone = "America/New_York";
const wallClock = (d: Date) => zoneFields(d, zone);
const formats = { ...DEFAULT_FORMATS, timeZone: zone };
const instant = new Date("2026-03-17T03:30:00Z");
const midnights = [new Date("2026-03-16T04:00:00Z"), new Date("2026-03-17T04:00:00Z")];
const serial = (y: number, m: number, d: number, h = 0, min = 0) => (Date.UTC(y, m, d, h, min) - Date.UTC(1899, 11, 30)) / 86400000;

const sheet: ExportSheet = { columns: [{ label: "At" }, { label: "Day" }], rows: [[instant, midnights[0]], [instant, midnights[1]]] };

describe("the exports in the table's zone", () => {
  it("counts the XLSX serial from the zone's wall clock and takes its midnight for a day", () => {
    const xml = sheetXml(sheet, wallClock);
    expect(xml).toContain(`<c r="A2" s="2"><v>${serial(2026, 2, 16, 23, 30)}</v></c>`);
    expect(xml).toContain(`<c r="B2" s="1"><v>${serial(2026, 2, 16)}</v></c>`);
  });

  it("is handed the zone by the entry", () => {
    expect(() => xlsx.write(sheet, { formats, wording: DEFAULT_WORDING, wallClock })).not.toThrow();
  });

  it("keeps the CSV's instants ISO and writes a column of zone midnights as the zone's day", () => {
    const text = csv.write(sheet, { formats, wording: DEFAULT_WORDING });
    expect(text).toContain("2026-03-17T03:30:00.000Z,2026-03-16");
  });
});
