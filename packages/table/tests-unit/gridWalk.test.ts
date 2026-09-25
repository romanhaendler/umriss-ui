/* The grid's walk as a pure module (table-grid-mode 01): the lines of a table
   in grid mode with their cells, and where a key takes the Active cell over
   them. Literals throughout - a table small enough to read. */

import { describe, expect, it } from "vitest";
import { cellAt, columnCount, gridLines, groupLineLayout, lineCells, nextCell, placeOf, stepGrid } from "../src/model/gridWalk";
import type { GridLayout, GridLine, GridPosition } from "../src/model/gridWalk";
import type { Line, RowGroup } from "../src/model/grouping";

interface Order {
  id: string;
}
const A: Order = { id: "a" };
const B: Order = { id: "b" };
const C: Order = { id: "c" };

const NO_BLOCKS = { start: 0, end: 0, count: 0 };

/* Selection, expander, three data columns (the last with a sum), actions. */
const FLAT: GridLayout = { controls: 2, span: false, aggregates: [false, false, true], actions: true, blocks: NO_BLOCKS };

const group = (path: string, rows: Order[], level = 0, groups: RowGroup<Order>[] = []): RowGroup<Order> => ({
  path,
  value: path,
  level,
  rows,
  groups,
  aggregates: {},
});

const keys = (lines: readonly GridLine[]) => lines.map((l) => l.key);
const at = (line: number, column: number): GridPosition => ({ line, column });

describe("the cells of a line", () => {
  it("are one per column in the head, a row and the footer", () => {
    expect(columnCount(FLAT)).toBe(6);
    expect(lineCells("cells", FLAT)).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it("are one over all columns in a detail", () => {
    expect(lineCells("whole", FLAT)).toEqual([6]);
  });

  it("give a group header's label the leading run without an aggregate", () => {
    /* controls, the label over the two plain columns, the sum, the actions */
    expect(lineCells("header", FLAT)).toEqual([1, 1, 2, 1, 1]);
  });

  it("give a group header's label the span column as well, and a folded span its count over the run", () => {
    const spanned: GridLayout = { ...FLAT, span: true };
    expect(lineCells("header", spanned)).toEqual([1, 1, 3, 1, 1]);
    expect(lineCells("folded", spanned)).toEqual([1, 1, 1, 2, 1, 1]);
  });

  it("stop the label at a start block's edge, so that it sticks with its pinned columns", () => {
    /* The first data column pinned: the block holds the controls and it. */
    const pinned: GridLayout = { ...FLAT, blocks: { start: 3, end: 0, count: 6 } };
    expect(groupLineLayout(pinned)).toEqual({ lead: 2, labelColumns: 1, countColumns: 1 });
    expect(lineCells("header", pinned)).toEqual([1, 1, 1, 1, 1, 1]);
  });

  it("stop the leading run before an end block", () => {
    /* No aggregate at all, the last data column and the actions pinned to the end. */
    const pinned: GridLayout = { ...FLAT, aggregates: [false, false, false], blocks: { start: 0, end: 2, count: 6 } };
    expect(groupLineLayout(pinned).lead).toBe(2);
    expect(lineCells("header", pinned)).toEqual([1, 1, 2, 1, 1]);
  });

  it("add up to the column count in every shape", () => {
    for (const layout of [FLAT, { ...FLAT, span: true }, { ...FLAT, blocks: { start: 3, end: 1, count: 6 } }]) {
      for (const shape of ["cells", "whole", "header", "folded"] as const) {
        if (shape === "folded" && !layout.span) continue;
        expect(lineCells(shape, layout).reduce((a, b) => a + b)).toBe(columnCount(layout));
      }
    }
  });
});

describe("the lines of the grid", () => {
  it("are the head, the rows with their open details and the footer", () => {
    const lines = gridLines({ layout: FLAT, body: { rows: [A, B, C] }, rowKey: (r) => r.id, expanded: new Set(["b"]), foot: true });
    expect(keys(lines)).toEqual(["head", "row:a", "row:b", "detail:b", "row:c", "foot"]);
    /* A detail stands where its row does in the window. */
    expect(lines.map((l) => l.at)).toEqual([-1, 0, 1, 1, 2, -1]);
    expect(lines[3]!.cells).toEqual([6]);
    expect(lines[3]!.row).toBe(B);
  });

  it("follow a grouping: headers, rows, folded spans", () => {
    const north = group('["n"]', [A, B], 0);
    const south = group('["s"]', [C], 0, [group('["s","x"]', [C], 1)]);
    const body: Line<Order>[] = [
      { kind: "header", group: north, parents: [], continued: false },
      { kind: "row", row: A, parents: [north], span: undefined, first: false, continued: false },
      { kind: "row", row: B, parents: [north], span: undefined, first: false, continued: false },
      { kind: "header", group: south, parents: [], continued: false },
      { kind: "folded", group: south.groups[0]!, parents: [south] },
    ];
    const layout: GridLayout = { ...FLAT, span: true };
    const lines = gridLines({ layout, body: { lines: body }, rowKey: (r) => r.id, expanded: new Set(), foot: false });
    expect(keys(lines)).toEqual(["head", 'header:["n"]', "row:a", "row:b", 'header:["s"]', 'folded:["s","x"]']);
    expect(lines[1]!.cells).toEqual([1, 1, 3, 1, 1]);
    expect(lines[5]!.cells).toEqual([1, 1, 1, 2, 1, 1]);
    expect(lines.map((l) => l.at)).toEqual([-1, 0, 1, 2, 3, 4]);
  });

  it("are the head and the empty cell where the body has no row", () => {
    const lines = gridLines({ layout: FLAT, body: { rows: [] }, rowKey: (r: Order) => r.id, expanded: new Set(), foot: false });
    expect(keys(lines)).toEqual(["head", "empty"]);
  });
});

describe("where a key takes the Active cell", () => {
  /* head, a header over columns 2-3, a row, a detail, a row */
  const LINES: GridLine[] = [
    { key: "head", cells: [1, 1, 1, 1, 1, 1], at: -1 },
    { key: "header", cells: [1, 1, 2, 1, 1], at: 0 },
    { key: "row:a", cells: [1, 1, 1, 1, 1, 1], at: 1 },
    { key: "detail:a", cells: [6], at: 1 },
    { key: "row:b", cells: [1, 1, 1, 1, 1, 1], at: 2 },
  ];

  it("moves one cell to the right and the left, and stays at the edge", () => {
    expect(stepGrid(LINES, at(2, 2), "right", 1)).toEqual(at(2, 3));
    expect(stepGrid(LINES, at(2, 2), "left", 1)).toEqual(at(2, 1));
    expect(stepGrid(LINES, at(2, 5), "right", 1)).toEqual(at(2, 5));
    expect(stepGrid(LINES, at(2, 0), "left", 1)).toEqual(at(2, 0));
  });

  it("steps over a spanning cell as one", () => {
    /* Column 3 lies in the label cell 2-3: right goes to 4, left to 1. */
    expect(stepGrid(LINES, at(1, 3), "right", 1)).toEqual(at(1, 4));
    expect(stepGrid(LINES, at(1, 3), "left", 1)).toEqual(at(1, 1));
    expect(cellAt(LINES[1]!.cells, 3)).toEqual({ index: 2, start: 2 });
  });

  it("keeps its column through a spanning line, as a caret keeps its goal", () => {
    const down = stepGrid(LINES, at(0, 3), "down", 1);
    expect(down).toEqual(at(1, 3));
    expect(stepGrid(LINES, down, "down", 1)).toEqual(at(2, 3));
    /* Through the detail and back out in the same column. */
    expect(stepGrid(LINES, at(3, 3), "down", 1)).toEqual(at(4, 3));
  });

  it("stays at the first and the last line", () => {
    expect(stepGrid(LINES, at(0, 1), "up", 1)).toEqual(at(0, 1));
    expect(stepGrid(LINES, at(4, 1), "down", 1)).toEqual(at(4, 1));
  });

  it("goes to the start and the end of its line with Home and End", () => {
    expect(stepGrid(LINES, at(2, 3), "lineStart", 1)).toEqual(at(2, 0));
    expect(stepGrid(LINES, at(2, 3), "lineEnd", 1)).toEqual(at(2, 5));
    expect(stepGrid(LINES, at(3, 0), "lineEnd", 1)).toEqual(at(3, 0));
  });

  it("goes to the table's first and last cell with Ctrl+Home and Ctrl+End", () => {
    expect(stepGrid(LINES, at(2, 3), "first", 1)).toEqual(at(0, 0));
    expect(stepGrid(LINES, at(2, 3), "last", 1)).toEqual(at(4, 5));
  });

  it("jumps by the lines in view with PageUp and PageDown, and stops at the ends", () => {
    expect(stepGrid(LINES, at(0, 2), "pageDown", 3)).toEqual(at(3, 2));
    expect(stepGrid(LINES, at(3, 2), "pageDown", 3)).toEqual(at(4, 2));
    expect(stepGrid(LINES, at(4, 2), "pageUp", 3)).toEqual(at(1, 2));
    expect(stepGrid(LINES, at(1, 2), "pageUp", 3)).toEqual(at(0, 2));
  });

  it("finds the next cell that edits in reading order, across lines, and none past the last", () => {
    const edits = (p: GridPosition) => LINES[p.line]!.key.startsWith("row:") && (p.column === 2 || p.column === 4);
    expect(nextCell(LINES, at(2, 2), false, edits)).toEqual(at(2, 4));
    expect(nextCell(LINES, at(2, 4), false, edits)).toEqual(at(4, 2));
    expect(nextCell(LINES, at(4, 2), true, edits)).toEqual(at(2, 4));
    expect(nextCell(LINES, at(4, 4), false, edits)).toBeNull();
  });
});

describe("where the Active cell stands after a change", () => {
  it("follows its line by its key when rows are sorted", () => {
    expect(placeOf(["head", "row:b", "row:a"], "row:a", 1)).toBe(2);
  });

  it("stands at the line now at its index when its row is gone", () => {
    expect(placeOf(["head", "row:b", "row:c"], "row:a", 1)).toBe(1);
    expect(placeOf(["head"], "row:a", 3)).toBe(0);
  });

  it("stands at the column now at its index when its column is hidden", () => {
    /* select, tag, [station hidden], value */
    expect(placeOf(["#select", "tag", "value"], "station", 2)).toBe(2);
    expect(placeOf(["#select", "tag"], "station", 2)).toBe(1);
  });

  it("follows its column into a pinned block", () => {
    /* value pinned to the start: it stands first after the controls. */
    expect(placeOf(["#select", "value", "tag", "station"], "value", 3)).toBe(1);
  });
});
