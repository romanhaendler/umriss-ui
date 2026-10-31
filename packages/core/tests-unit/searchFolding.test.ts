/* Search folds case and diacritics on both sides; spans index the name as written. */

import { describe, expect, it } from "vitest";
import { filterOptions } from "../src/lib/options";
import { findInName } from "../src/lib/search";

const labels = (search: string, names: string[]) =>
  filterOptions(names.map((label) => ({ value: label, label })), search).map((option) => option.label);

describe("search folding", () => {
  it("finds across case and diacritics, both ways", () => {
    expect(labels("cafe", ["Café", "Tea"])).toEqual(["Café"]);
    expect(labels("strasse", ["Straße", "Weg"])).toEqual(["Straße"]);
    expect(labels("muller", ["Müller", "Meier"])).toEqual(["Müller"]);
    expect(labels("CAFÉ", ["cafe"])).toEqual(["cafe"]);
    expect(labels("straße", ["Strasse"])).toEqual(["Strasse"]);
  });

  it("marks spans in the name as written", () => {
    expect(findInName("istanbul", "İstanbul")?.finds).toEqual([{ from: 0, to: 8 }]);
    expect(findInName("stras", "Straße")?.finds).toEqual([{ from: 0, to: 5 }]);
    expect(findInName("cafe", "Café")?.finds).toEqual([{ from: 0, to: 4 }]);
  });
});
