/* Matrix geometry (ADR-0002 in two dimensions).
   How large a cell is when its position comes out of two ordinary numeric axes,
   and which cell lies under the pointer. Half a cell out of place does not show up
   on a canvas. */

import { describe, expect, it } from "vitest";
import { measureSpacing, cellSize, cellIndex } from "../src/cells";

function f(...values: number[]): Float64Array {
  return Float64Array.from(values);
}

/* A matrix runs row by row: three columns, two rows, index 0..5. */
const columns = f(0, 1, 2, 0, 1, 2);
const rows = f(0, 0, 0, 1, 1, 1);

describe("measureSpacing - smallest distance between two different values", () => {
  it("finds the distance in a channel running row by row", () => {
    // Unlike with bars the values here are not ascending: the column channel
    // jumps back at the end of a row. Comparing only neighbours would yield -2
    // here and therefore no distance at all.
    expect(measureSpacing(columns, 6)).toBe(1);
    expect(measureSpacing(rows, 6)).toBe(1);
  });

  it("finds the distance in an arbitrary order too", () => {
    expect(measureSpacing(f(20, 0, 10), 3)).toBe(10);
    expect(measureSpacing(f(3, -1, 7, 1), 4)).toBe(2);
  });

  it("takes the smallest gap at an uneven distribution", () => {
    expect(measureSpacing(f(20, 0, 6, 5, 1), 5)).toBe(1);
  });

  it("reports 0 where no distance is measurable", () => {
    // A single row, a single column, no data at all.
    expect(measureSpacing(f(4, 4, 4), 3)).toBe(0);
    expect(measureSpacing(f(9), 1)).toBe(0);
    expect(measureSpacing(f(), 0)).toBe(0);
  });

  it("passes over gaps", () => {
    // NaN is the gap, and a gap has no distance to anything.
    expect(measureSpacing(f(0, NaN, 5), 3)).toBe(5);
    expect(measureSpacing(f(NaN, NaN), 2)).toBe(0);
  });

  it("reads only the first n values", () => {
    const field = f(0, 10, 1);
    expect(measureSpacing(field, 2)).toBe(10);
    expect(measureSpacing(field, 3)).toBe(1);
  });
});

describe("cellSize - the replacement where no distance is measurable", () => {
  it("takes the measured distance where there is one", () => {
    expect(cellSize(2, 100)).toBe(2);
  });

  it("otherwise takes the span of the domain", () => {
    // ADR-0002's reasoning, one dimension further on: a single row gets a visible
    // cell instead of one of height zero - just as a single data point gets a
    // visible bar.
    expect(cellSize(0, 100)).toBe(100);
  });
});

describe("cellIndex - which cell lies under the pointer", () => {
  it("hits at the midpoint of a cell", () => {
    // A cell is centred on its midpoint, not hung from it.
    expect(cellIndex(columns, rows, 6, 0, 0, 1, 1)).toBe(0);
    expect(cellIndex(columns, rows, 6, 1, 1, 1, 1)).toBe(4);
    expect(cellIndex(columns, rows, 6, 2, 1, 1, 1)).toBe(5);
  });

  it("hits everywhere inside the cell", () => {
    expect(cellIndex(columns, rows, 6, 1.4, 0.4, 1, 1)).toBe(1);
    expect(cellIndex(columns, rows, 6, 0.6, -0.4, 1, 1)).toBe(1);
  });

  it("counts an edge to the cell that begins there", () => {
    // The same boundary rule as in the state band: otherwise the edge would
    // belong to both neighbours.
    expect(cellIndex(columns, rows, 6, 0.5, 0, 1, 1)).toBe(1);
    expect(cellIndex(columns, rows, 6, 1.5, 0, 1, 1)).toBe(2);
    expect(cellIndex(columns, rows, 6, 0, 0.5, 1, 1)).toBe(3);
  });

  it("reports nothing a step beyond the outer edge", () => {
    expect(cellIndex(columns, rows, 6, 2.5, 0, 1, 1)).toBe(-1);
    expect(cellIndex(columns, rows, 6, 3, 0, 1, 1)).toBe(-1);
    expect(cellIndex(columns, rows, 6, 1, 1.5, 1, 1)).toBe(-1);
    expect(cellIndex(columns, rows, 6, -0.5001, 0, 1, 1)).toBe(-1);
  });

  it("demands a hit in both dimensions", () => {
    // Above the right column, but beside every row.
    expect(cellIndex(columns, rows, 6, 1, 5, 1, 1)).toBe(-1);
    // Above the right row, but beside every column.
    expect(cellIndex(columns, rows, 6, 9, 1, 1, 1)).toBe(-1);
  });

  it("reports nothing outside the grid", () => {
    expect(cellIndex(columns, rows, 6, -10, -10, 1, 1)).toBe(-1);
    expect(cellIndex(new Float64Array(0), new Float64Array(0), 0, 0, 0, 1, 1)).toBe(-1);
  });

  it("scales the search area with the cell edge", () => {
    // With a single row the cell height is the domain span (cellSize), and then
    // the cell reaches correspondingly far.
    const height = cellSize(measureSpacing(f(0, 0, 0), 3), 10);
    expect(height).toBe(10);
    expect(cellIndex(f(0, 1, 2), f(0, 0, 0), 3, 1, 4, 1, height)).toBe(1);
    expect(cellIndex(f(0, 1, 2), f(0, 0, 0), 3, 1, 5, 1, height)).toBe(-1);
  });

  it("never hits a gap", () => {
    // The gap is NaN in the value channel: the cell lies in the grid, but nothing
    // is known about it. Whoever tests the channel does not report it - and its
    // neighbours stay untouched.
    const values = f(1, NaN, 3, 4, 5, 6);
    const i = cellIndex(columns, rows, 6, 1, 0, 1, 1);
    expect(i).toBe(1);
    expect(Number.isNaN(values[i] as number)).toBe(true);
    expect(cellIndex(columns, rows, 6, 0, 0, 1, 1)).toBe(0);
    expect(cellIndex(columns, rows, 6, 2, 0, 1, 1)).toBe(2);
    // A position that is itself NaN lies nowhere.
    expect(cellIndex(f(0, NaN), f(0, 0), 2, NaN, 0, 1, 1)).toBe(-1);
    expect(cellIndex(f(0, NaN), f(0, 0), 2, 5, 0, 1, 1)).toBe(-1);
  });
});
