import { describe, expect, it } from "vitest";
import { safeFileName } from "../src/export";

describe("safeFileName", () => {
  it("keeps an ordinary name", () => expect(safeFileName("report 2026.csv", "t.csv")).toBe("report 2026.csv"));
  it("removes path separators", () => {
    expect(safeFileName("../../etc/passwd", "t.csv")).toBe("_.._etc_passwd");
    expect(safeFileName("../../etc/passwd", "t.csv")).not.toMatch(/[\\/]/);
    expect(safeFileName("a\\b.csv", "t.csv")).toBe("a_b.csv");
  });
  it("removes control characters and Windows-reserved ones", () => {
    expect(safeFileName("a\u0000b\nc.csv", "t.csv")).toBe("a_b_c.csv");
    expect(safeFileName('a:b*c?"d<e>f|g.csv', "t.csv")).toBe("a_b_c__d_e_f_g.csv");
  });
  it("falls back for empty, dot-only and device names", () => {
    for (const name of ["", "...", "  ", "CON", "nul.csv", "COM1.txt", "lpt9"]) expect(safeFileName(name, "t.csv")).toBe("t.csv");
  });
});
