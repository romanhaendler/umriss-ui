import { describe, expect, it } from "vitest";
import { formatsFor } from "../src/lib/language";
import { readTypedDate } from "../src/components/DatePicker/typed";
import { dayShown } from "../src/components/DatePicker/zoned";
import { resolveLocalTime } from "../src/components/DatePicker/time";
import { startOfWeek, monthGrid } from "../src/components/DatePicker/grid";

const days = [new Date(2024, 1, 29), new Date(2026, 0, 1), new Date(2026, 11, 31), new Date(2000, 1, 29), new Date(2026, 2, 29), new Date(1999, 9, 5), new Date(2101, 5, 7)];
describe("p29 typed date round trip", () => {
  for (const loc of ["en-GB", "en-US", "de", "fr", "fr-CH", "de-CH", "sv", "ja", "hu", "lt", "ko", "pl", "nl", "es", "zh-CN", "fa", "ar-EG"]) {
    for (const tz of [undefined, "Pacific/Auckland", "America/Los_Angeles"]) {
      it(`${loc} ${tz}`, () => {
        const f = formatsFor(loc, tz);
        for (const d of days) {
          const text = f.date(dayShown(d, tz));
          const back = readTypedDate(text, f, new Date(2026, 5, 1));
          expect(back?.getTime(), `${text}`).toBe(d.getTime());
        }
      });
    }
  }
  it("weekStart of every grid starts on that weekday", () => {
    for (const loc of ["en-US", "ar-EG", "de", "fa"]) {
      const f = formatsFor(loc);
      const g = monthGrid(new Date(2026, 9, 15), f.weekStart);
      expect(g[0]!.getDay(), loc).toBe(f.weekStart % 7);
    }
  });
  it("spring-forward gap flagged in Berlin", () => {
    expect(resolveLocalTime(2026, 2, 29, 2, 30, 0, "Europe/Berlin").kind).toBe("missing");
    expect(resolveLocalTime(2026, 9, 25, 2, 30, 0, "Europe/Berlin").kind).toBe("ambiguous");
  });
  it("lord howe 30 minute DST", () => {
    expect(resolveLocalTime(2026, 9, 4, 2, 15, 0, "Australia/Lord_Howe").kind).toBe("missing");
    expect(resolveLocalTime(2026, 3, 5, 1, 45, 0, "Australia/Lord_Howe").kind).toBe("ambiguous");
  });
});
