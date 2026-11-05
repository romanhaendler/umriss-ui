import { describe, expect, it } from "vitest";
import { typeaheadIndex } from "../src/lib/typeahead";

const labels = ["Pump 1", "Pump 2", "Pipe"];

describe("typeaheadIndex", () => {
  it("moves on when the same letter is typed again", () => {
    expect(typeaheadIndex(labels, 0, "p")).toBe(1);
    expect(typeaheadIndex(labels, 0, "pp")).toBe(1);
    expect(typeaheadIndex(labels, 1, "ppp")).toBe(2);
  });
  it("narrows from the current entry with different letters", () => {
    expect(typeaheadIndex(labels, 1, "pu")).toBe(1);
    expect(typeaheadIndex(labels, 0, "pi")).toBe(2);
  });
  it("is -1 without a match or text", () => {
    expect(typeaheadIndex(labels, 0, "z")).toBe(-1);
    expect(typeaheadIndex(labels, 0, "")).toBe(-1);
  });
});
