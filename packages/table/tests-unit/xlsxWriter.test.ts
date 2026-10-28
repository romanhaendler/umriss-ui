import { describe, expect, it } from "vitest";
import { crc32 as zlibCrc32 } from "node:zlib";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { xlsx } from "../src/xlsx";
import { crc32, zip } from "../src/xlsx/zip";
import { sheetName } from "../src/xlsx/parts";
import type { ExportSheet } from "../src/types";

/* A reader of stored ZIPs, through the central directory only. */
function unzip(bytes: Uint8Array) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  expect(v.getUint32(end, true)).toBe(0x06054b50);
  const count = v.getUint16(end + 10, true);
  let at = v.getUint32(end + 16, true);
  const dec = new TextDecoder();
  const parts: { name: string; text: string; crc: number; offset: number }[] = [];
  for (let i = 0; i < count; i++) {
    expect(v.getUint32(at, true)).toBe(0x02014b50);
    expect(v.getUint16(at + 8, true) & 0x0800).toBe(0x0800);
    expect(v.getUint16(at + 10, true)).toBe(0);
    const crc = v.getUint32(at + 16, true);
    const size = v.getUint32(at + 20, true);
    const nameLen = v.getUint16(at + 28, true);
    const offset = v.getUint32(at + 42, true);
    const name = dec.decode(bytes.subarray(at + 46, at + 46 + nameLen));
    expect(v.getUint32(offset, true)).toBe(0x04034b50);
    const start = offset + 30 + v.getUint16(offset + 26, true) + v.getUint16(offset + 28, true);
    parts.push({ name, text: dec.decode(bytes.subarray(start, start + size)), crc, offset });
    at += 46 + nameLen;
  }
  return parts;
}

const sheet: ExportSheet = {
  columns: [{ label: "Name", width: 140 }, { label: "Amount" }, { label: "Done" }, { label: "Day" }, { label: "Moment" }, { label: "Old" }],
  rows: [
    ["Tom & <Jerry> \"Ö\"", 12.5, true, new Date(2024, 2, 15), new Date(2024, 2, 15, 13, 45), new Date(1800, 0, 1)],
    ["=1+1", Infinity, false, new Date(2024, 2, 16), new Date(2024, 2, 15), undefined],
  ],
};
const doc = (xml: string) => new DOMParser().parseFromString(xml, "application/xml");
const cellMap = (xml: string) => {
  const d = doc(xml);
  expect(d.getElementsByTagName("parsererror").length).toBe(0);
  return new Map([...d.getElementsByTagName("c")].map((c) => [c.getAttribute("r")!, c]));
};
const sheetOf = (s: ExportSheet) => unzip(xlsx.write(s, { formats: {} as never, wording: DEFAULT_WORDING }))[5]!.text;

describe("the XLSX writer", () => {
  it("computes CRC-32", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });

  it("writes six parts in order, with matching CRCs and offsets, each well-formed", () => {
    const parts = unzip(xlsx.write(sheet, { formats: {} as never, wording: DEFAULT_WORDING }));
    expect(parts.map((p) => p.name)).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/workbook.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/worksheets/sheet1.xml",
    ]);
    expect(parts[0]!.offset).toBe(0);
    for (const p of parts) {
      expect(p.crc).toBe(zlibCrc32(new TextEncoder().encode(p.text)));
      expect(doc(p.text).getElementsByTagName("parsererror").length).toBe(0);
    }
    expect(parts[2]!.text).toContain('name="Table"');
    expect(xlsx.extension).toBe("xlsx");
  });

  it("reads back typed cells, dates under a fixed time zone, and widths", () => {
    const xml = sheetOf(sheet);
    const cells = cellMap(xml);
    expect(cells.get("A1")!.textContent).toBe("Name");
    expect(cells.get("A2")!.getAttribute("t")).toBe("inlineStr");
    expect(cells.get("A2")!.textContent).toBe('Tom & <Jerry> "Ö"');
    expect(cells.get("A3")!.textContent).toBe("=1+1");
    expect(cells.get("A3")!.getAttribute("t")).toBe("inlineStr");
    expect(cells.get("B2")!.getAttribute("t")).toBeNull();
    expect(cells.get("B2")!.textContent).toBe("12.5");
    expect(cells.has("B3")).toBe(false);
    expect(cells.get("C2")!.getAttribute("t")).toBe("b");
    expect(cells.get("C2")!.textContent).toBe("1");
    expect(cells.get("C3")!.textContent).toBe("0");
    /* Column D: all at midnight, date style; 2024-03-15 is day 45366. */
    expect(cells.get("D2")!.textContent).toBe("45366");
    expect(cells.get("D2")!.getAttribute("s")).toBe("1");
    expect(cells.get("D3")!.textContent).toBe("45367");
    /* Column E: a time in it, date-time style; 13:45 is 0.5729166... of a day. */
    expect(cells.get("E3")!.textContent).toBe("45366");
    expect(cells.get("E3")!.getAttribute("s")).toBe("2");
    expect(Number(cells.get("E2")!.textContent)).toBeCloseTo(45366.5729166667, 9);
    /* Before 1900-03-01: ISO text, not a serial. */
    expect(cells.get("F2")!.getAttribute("t")).toBe("inlineStr");
    expect(cells.get("F2")!.textContent).toBe(new Date(1800, 0, 1).toISOString());
    expect(cells.has("F3")).toBe(false);
    /* 140 px / 7 + 1. */
    const cols = doc(xml).getElementsByTagName("col");
    expect(cols.length).toBe(1);
    expect(cols[0]!.getAttribute("width")).toBe("21");
    expect(cols[0]!.getAttribute("min")).toBe("1");
  });

  it("drops forbidden characters, cuts long text, names the sheet within Excel's rules", () => {
    const cells = cellMap(sheetOf({ columns: [{ label: "a\u0001b" }], rows: [["x".repeat(40000)]] }));
    expect(cells.get("A1")!.textContent).toBe("ab");
    expect(cells.get("A2")!.textContent!.length).toBe(32767);
    expect(sheetName("a[b]:c*d?e/f\\g")).toBe("abcdefg");
    expect(sheetName("x".repeat(40))).toHaveLength(31);
    expect(sheetName("[]")).toBe("Sheet1");
  });

  it("throws a RangeError naming the limit", () => {
    expect(() => sheetOf({ columns: [{ label: "a" }], rows: new Array(1048576).fill([]) })).toThrow(RangeError);
    expect(() => sheetOf({ columns: [{ label: "a" }], rows: new Array(1048576).fill([]) })).toThrow(/1,048,576 rows/);
    expect(() => sheetOf({ columns: Array.from({ length: 16385 }, () => ({ label: "a" })), rows: [] })).toThrow(/16,384 columns/);
    expect(() => zip(Array.from({ length: 65536 }, (_, i) => ({ name: String(i), text: "" })))).toThrow(RangeError);
  });

  it("imports the table at run time nowhere", () => {
    const files = import.meta.glob("../src/xlsx/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
    for (const [f, src] of Object.entries(files)) {
      for (const line of src.split("\n")) {
        if (/^\s*(import|export)\b.*\bfrom\b/.test(line) && !/^\s*import type\b/.test(line) && !/from "\.\/[a-z]+"/.test(line)) {
          throw new Error(`${f}: ${line}`);
        }
      }
    }
  });

  it("keeps hostile text as text and the XML valid", () => {
    const hostile = 'a<b>&"\']]>c';
    const cells = cellMap(
      sheetOf({
        columns: [{ label: hostile }],
        rows: [["=1+1"], ["@SUM(1)"], [hostile], ["x\u0000\u0008\u000b\u001fy\tz\nw"], ["lone\ud800high \udc00low"], ["pair \u{1F600}"]],
      }),
    );
    expect(cells.get("A1")!.textContent).toBe(hostile);
    for (const ref of ["A2", "A3"]) {
      expect(cells.get(ref)!.getAttribute("t")).toBe("inlineStr");
      expect(cells.get(ref)!.getElementsByTagName("f").length).toBe(0);
    }
    expect(cells.get("A2")!.textContent).toBe("=1+1");
    expect(cells.get("A3")!.textContent).toBe("@SUM(1)");
    expect(cells.get("A4")!.textContent).toBe(hostile);
    expect(cells.get("A5")!.textContent).toBe("xy\tz\nw");
    expect(cells.get("A6")!.textContent).toBe("lonehigh low");
    expect(cells.get("A7")!.textContent).toBe("pair \u{1F600}");
  });

  it("falls back to the default sheet name for forbidden characters only, and keeps the workbook valid", () => {
    expect(sheetName("[]:*?/\\")).toBe("Sheet1");
    const wording = { ...DEFAULT_WORDING, exportSheetName: '<&">\u0000\u0001' };
    const parts = unzip(xlsx.write(sheet, { formats: {} as never, wording }));
    const workbook = parts[2]!.text;
    expect(doc(workbook).getElementsByTagName("parsererror").length).toBe(0);
    expect(doc(workbook).getElementsByTagName("sheet")[0]!.getAttribute("name")).toBe('<&">');
    const only = unzip(xlsx.write(sheet, { formats: {} as never, wording: { ...DEFAULT_WORDING, exportSheetName: "[]\\/" } }));
    expect(doc(only[2]!.text).getElementsByTagName("sheet")[0]!.getAttribute("name")).toBe("Sheet1");
  });

  it("does not cut a surrogate pair at the 31st character", () => {
    expect(sheetName(`${"x".repeat(30)}\u{1F600}`)).toBe("x".repeat(30));
  });

  it("drops U+FFFE and U+FFFF", () => {
    expect(sheetName("Report\uFFFF\uFFFE")).toBe("Report");
  });
});
