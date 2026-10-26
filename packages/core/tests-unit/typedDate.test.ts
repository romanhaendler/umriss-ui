/* The reading of a typed date: a pure function of the text and the formats in use. */

import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS } from "../src/lib/language/formats";
import { GERMAN_FORMATS } from "../src/lib/language/de";
import { readTypedDate, sampleDate } from "../src/components/DatePicker/typed";

const TODAY = new Date(2026, 9, 26);
const monthFirst = { ...DEFAULT_FORMATS, date: (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}` };
const read = (text: string, formats = DEFAULT_FORMATS) => readTypedDate(text, formats, TODAY);
const ymd = (d: Date | null) => d && [d.getFullYear(), d.getMonth() + 1, d.getDate()];

describe("readTypedDate", () => {
  it("reads day, month, year in the English and German formats", () => {
    expect(ymd(read("17/03/1985"))).toEqual([1985, 3, 17]);
    expect(ymd(read("17.03.1985", GERMAN_FORMATS))).toEqual([1985, 3, 17]);
    expect(ymd(read("1 3 1985"))).toEqual([1985, 3, 1]);
  });

  it("reads month first where the formats write it first", () => {
    expect(ymd(read("03/17/1985", monthFirst))).toEqual([1985, 3, 17]);
    expect(ymd(read("031785", monthFirst))).toEqual([1985, 3, 17]);
  });

  it("reads a four-digit first part as ISO, whatever the order", () => {
    expect(ymd(read("1985-03-17"))).toEqual([1985, 3, 17]);
    expect(ymd(read("1985/03/17", monthFirst))).toEqual([1985, 3, 17]);
  });

  it("splits digits alone by the order", () => {
    expect(ymd(read("17031985"))).toEqual([1985, 3, 17]);
    expect(ymd(read("170385"))).toEqual([1985, 3, 17]);
    expect(ymd(read("03171985", monthFirst))).toEqual([1985, 3, 17]);
  });

  it("takes the two-digit year nearest to today, a tie to the past", () => {
    expect(read("17/03/85")?.getFullYear()).toBe(1985);
    expect(read("17/03/30")?.getFullYear()).toBe(2030);
    expect(read("17/03/75")?.getFullYear()).toBe(2075); // 49 ahead, 51 behind
    expect(read("17/03/76")?.getFullYear()).toBe(1976); // 50 and 50: the past
    expect(read("17/03/77")?.getFullYear()).toBe(1977);
  });

  it("is no date for a day that does not exist, or too few parts", () => {
    expect(read("31/02/2026")).toBeNull();
    expect(read("29/02/2025")).toBeNull();
    expect(ymd(read("29/02/2024"))).toEqual([2024, 2, 29]);
    expect(read("17/03")).toBeNull();
    expect(read("1703")).toBeNull();
    expect(read("")).toBeNull();
    expect(read("a/b/c")).toBeNull();
    expect(read("0/3/1985")).toBeNull();
    expect(read("17/13/1985")).toBeNull();
  });

  it("returns local midnight", () => {
    expect(read("17/03/1985")?.getTime()).toBe(new Date(1985, 2, 17).getTime());
  });
});

describe("sampleDate", () => {
  it("is written in the formats in use", () => {
    expect(sampleDate(DEFAULT_FORMATS)).toBe("25/12/2031");
    expect(sampleDate(GERMAN_FORMATS)).toBe("25.12.2031");
  });
});
