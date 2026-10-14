import { describe, expect, it } from "vitest";
import { pack } from "../src/pack";

const at = (spans: ReadonlyArray<[number, number]>, columns = 12) =>
  pack(spans.map(([c, r]) => ({ columns: c, rows: r })), columns).map((p) => [p.column, p.row]);

describe("pack", () => {
  it("puts widgets side by side while they fit", () => {
    expect(at([[4, 2], [4, 2], [4, 2]])).toEqual([[0, 0], [4, 0], [8, 0]]);
  });

  it("starts the next row when a widget does not fit", () => {
    expect(at([[8, 2], [6, 2]])).toEqual([[0, 0], [0, 2]]);
  });

  it("takes all columns for a widget wider than the grid", () => {
    const [p] = pack([{ columns: 20, rows: 1 }], 12);
    expect([p!.column, p!.columns]).toEqual([0, 12]);
  });

  it("places a widget beside a tall one, under the short ones", () => {
    expect(at([[4, 4], [4, 2], [4, 2], [4, 2]])).toEqual([[0, 0], [4, 0], [8, 0], [4, 2]]);
  });

  it("never goes back before the widget placed last", () => {
    expect(at([[8, 2], [6, 2], [2, 1]])).toEqual([[0, 0], [0, 2], [6, 2]]);
  });

  it("leaves room free that a later, smaller widget could have used", () => {
    expect(at([[8, 1], [6, 1], [4, 1]])).toEqual([[0, 0], [0, 1], [6, 1]]);
  });

  it("packs a one-column list one under the other", () => {
    expect(at([[3, 2], [4, 3]], 1)).toEqual([[0, 0], [0, 2]]);
  });
});
