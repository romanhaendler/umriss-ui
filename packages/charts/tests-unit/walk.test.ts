/* charts-a11y 02: the keyboard's walk over materialised series, as a pure
   function (ADR-0030). Positions are x values; a gap is none; the walk stays
   inside the visible domain. */

import { describe, expect, it } from "vitest";
import { hasCell, nearestPosition, rowEnd, stepCell, stepPosition, type WalkSeries } from "../src/walk";

const s = (x: number[], y: number[], w: number[] | null = null): WalkSeries => ({
  x: Float64Array.from(x),
  y: Float64Array.from(y),
  w: w === null ? null : Float64Array.from(w),
  length: x.length,
});

const a = s([0, 10, 20, 30, 40], [1, 2, Number.NaN, 4, 5]);
const b = s([5, 20, 45], [7, 8, 9]);
const all: [number, number] = [0, 50];

describe("stepPosition", () => {
  it("goes to the next x across the series", () => {
    expect(stepPosition([a, b], 0, "next", all)).toBe(5);
    expect(stepPosition([a, b], 5, "next", all)).toBe(10);
  });

  it("skips a gap in one series but keeps the x another series has", () => {
    expect(stepPosition([a], 10, "next", all)).toBe(30);
    expect(stepPosition([a, b], 10, "next", all)).toBe(20);
  });

  it("goes back", () => {
    expect(stepPosition([a, b], 30, "previous", all)).toBe(20);
    expect(stepPosition([a], 30, "previous", all)).toBe(10);
  });

  it("stays at the ends", () => {
    expect(stepPosition([a, b], 45, "next", all)).toBe(45);
    expect(stepPosition([a, b], 0, "previous", all)).toBe(0);
  });

  it("finds the first and the last inside the visible domain", () => {
    expect(stepPosition([a, b], null, "first", [8, 42])).toBe(10);
    expect(stepPosition([a, b], null, "last", [8, 42])).toBe(40);
  });

  it("does not leave the visible domain", () => {
    expect(stepPosition([a, b], 40, "next", [8, 42])).toBe(40);
  });

  it("pages by a tenth of the visible domain", () => {
    // A tenth of 50 is 5: from 10 the first position at or past 15 is 20.
    expect(stepPosition([a, b], 10, "pageNext", all)).toBe(20);
    expect(stepPosition([a, b], 40, "pagePrevious", all)).toBe(30);
  });

  it("starts at the first or last from nowhere", () => {
    expect(stepPosition([a, b], null, "next", all)).toBe(0);
    expect(stepPosition([a, b], null, "previous", all)).toBe(45);
  });

  it("has nothing to walk without a point", () => {
    expect(stepPosition([s([0, 1], [Number.NaN, Number.NaN])], null, "last", all)).toBeNull();
  });

  it("counts a cell only where it has a value", () => {
    const cells = s([0, 1, 2], [0, 0, 0], [3, Number.NaN, 4]);
    expect(stepPosition([cells], 0, "next", all)).toBe(2);
  });
});

describe("nearestPosition", () => {
  it("snaps a value that left the domain to the nearest position inside it", () => {
    expect(nearestPosition([a, b], 5, [18, 42])).toBe(20);
    expect(nearestPosition([a, b], 44, [18, 42])).toBe(40);
  });

  it("keeps a position that is still visible", () => {
    expect(nearestPosition([a, b], 30, all)).toBe(30);
  });
});

describe("stepCell", () => {
  // Two columns of three rows; the cell at x 1, y 1 has no value.
  const m = s([0, 0, 0, 1, 1, 1], [0, 1, 2, 0, 1, 2], [5, 6, 7, 8, Number.NaN, 9]);

  it("moves along a row", () => {
    expect(stepCell(m, { x: 0, y: 0 }, "right")).toEqual({ x: 1, y: 0 });
    expect(stepCell(m, { x: 1, y: 2 }, "left")).toEqual({ x: 0, y: 2 });
  });

  it("moves along a column and skips a cell without a value", () => {
    expect(stepCell(m, { x: 0, y: 0 }, "up")).toEqual({ x: 0, y: 1 });
    expect(stepCell(m, { x: 1, y: 0 }, "up")).toEqual({ x: 1, y: 2 });
    expect(stepCell(m, { x: 0, y: 2 }, "down")).toEqual({ x: 0, y: 1 });
  });

  it("stays at an edge", () => {
    expect(stepCell(m, { x: 1, y: 0 }, "right")).toEqual({ x: 1, y: 0 });
    expect(stepCell(m, { x: 0, y: 0 }, "down")).toEqual({ x: 0, y: 0 });
  });

  it("stays where its row has no further value", () => {
    // Row 1 has a value only at x 0; right from there stays.
    expect(stepCell(m, { x: 0, y: 1 }, "right")).toEqual({ x: 0, y: 1 });
  });
});

describe("A band's walk", () => {
  // Reports every minute; the state changes at 2 and at 5, and 3 is a hole.
  const band: WalkSeries = { ...s([0, 1, 2, 3, 4, 5], [0, 0, 1, Number.NaN, 1, 2]), changesOnly: true };

  it("goes from state change to state change", () => {
    expect(stepPosition([band], 0, "next", all)).toBe(2);
    expect(stepPosition([band], 2, "next", all)).toBe(4);
    expect(stepPosition([band], 4, "next", all)).toBe(5);
  });
});

describe("rowEnd", () => {
  const m = s([0, 0, 1, 1, 2, 2], [0, 1, 0, 1, 0, 1], [5, Number.NaN, 8, 9, 7, 3]);

  it("knows a cell only where it has a value", () => {
    expect(hasCell(m, { x: 1, y: 1 })).toBe(true);
    expect(hasCell(m, { x: 0, y: 1 })).toBe(false);
  });

  it("finds the first and last cell of a row with a value", () => {
    expect(rowEnd(m, { x: 1, y: 0 }, "start")).toEqual({ x: 0, y: 0 });
    expect(rowEnd(m, { x: 1, y: 1 }, "start")).toEqual({ x: 1, y: 1 });
    expect(rowEnd(m, { x: 1, y: 1 }, "end")).toEqual({ x: 2, y: 1 });
  });
});
