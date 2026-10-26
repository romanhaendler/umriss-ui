import { describe, expect, it } from "vitest";
import { barEdges, edgeValues } from "../src/colourBar";

const plain = (v: number): string => String(v);

describe("The edges of a colour bar", () => {
  it("lie at min + k * span / steps, for three, seven and nine stops over a given range", () => {
    expect(edgeValues(3, 0, 3)).toEqual([0, 1, 2, 3]);
    expect(edgeValues(7, 0, 7)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(edgeValues(9, -1, 1).map((v) => +v.toFixed(3))).toEqual([-1, -0.778, -0.556, -0.333, -0.111, 0.111, 0.333, 0.556, 0.778, 1]);
  });

  it("lie over the data's range as well, since the caller hands that range in", () => {
    expect(edgeValues(3, 10, 40)).toEqual([10, 20, 30, 40]);
  });

  it("are all written where short values fit", () => {
    expect(barEdges(3, 0, 3, plain).map((e) => e.text)).toEqual(["0", "1", "2", "3"]);
  });

  it("keeps both ends and drops inner edges that would touch", () => {
    const texts = barEdges(9, -1, 1, (v) => v.toFixed(3)).map((e) => e.text);
    expect(texts[0]).toBe("-1.000");
    expect(texts[texts.length - 1]).toBe("1.000");
    expect(texts.length).toBeLessThan(10);
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps only the ends where nothing else fits", () => {
    expect(barEdges(9, 0, 9, (v) => `${v} thousand`).map((e) => e.at)).toEqual([0, 1]);
  });
});
