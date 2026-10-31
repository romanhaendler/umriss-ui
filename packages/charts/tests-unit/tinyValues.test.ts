import { describe, expect, it } from "vitest";
import { formatTick, formatValue } from "../src/format";

describe("values near 1e-9", () => {
  it("ticks of a nano step are told apart", () => {
    const labels = [0, 1e-9, 2e-9, 3e-9].map((v) => formatTick(v, 1e-9, "en"));
    expect(new Set(labels).size).toBe(4);
    expect(labels[1]).toBe("1E-9");
  });
  it("a tooltip value under a thousandth is not zero", () => {
    expect(formatValue(4.2e-9, "en")).toBe("4.2E-9");
    expect(formatValue(0, "en")).toBe("0");
    expect(formatValue(1234.5678, "en")).toBe("1,234.568");
  });
  it("ordinary steps keep their places", () => {
    expect(formatTick(0.5, 0.5, "en")).toBe("0.5");
    expect(formatTick(0.000001, 0.000001, "en")).toBe("0.000001");
  });
});
