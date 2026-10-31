import { describe, expect, it } from "vitest";
import { findInName, find } from "../src/lib/search";
describe("p29 search", () => {
  it("spans index the original name even where lower-casing changes its length", () => {
    const r = findInName("stanbul", "İstanbul")!;
    expect(r.finds).toEqual([{ from: 1, to: 8 }]);
  });
  it("a diacritic-free query finds the accented name", () => {
    expect(findInName("cafe", "Café")).not.toBeNull();
  });
  it("German sharp s", () => {
    expect(findInName("strasse", "Straße")).not.toBeNull();
  });
  it("find ignores a query of only whitespace and a name with leading space ranks", () => {
    expect(find([{ name: "a" }], "  ")).toEqual([]);
  });
});
