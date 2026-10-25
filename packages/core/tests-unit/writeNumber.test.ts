import { describe, expect, it } from "vitest";
import { DEFAULT_FORMATS, writeNumber } from "../src";
import type { Formats } from "../src";

const replaced: Formats = {
  ...DEFAULT_FORMATS,
  number: (n, d) => `number(${n},${d})`,
  percent: (n) => `percent(${n})`,
  count: (n) => `count(${n})`,
};

describe("writeNumber", () => {
  it("sends the two names to percent and count", () => {
    expect(writeNumber(replaced, 0.5, "percent")).toBe("percent(0.5)");
    expect(writeNumber(replaced, 3, "count")).toBe("count(3)");
  });
  it("sends decimals and no format to number", () => {
    expect(writeNumber(replaced, 1.5, { decimals: 2 })).toBe("number(1.5,2)");
    expect(writeNumber(replaced, 1.5)).toBe("number(1.5,undefined)");
  });
  it("writes with the default set", () => {
    expect(writeNumber(DEFAULT_FORMATS, 0.74, "percent")).toBe(DEFAULT_FORMATS.percent(0.74));
    expect(writeNumber(DEFAULT_FORMATS, 1, { decimals: 2 })).toBe("1.00");
  });
});
