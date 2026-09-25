/* The grid's walk (table-grid-mode 01, ADR-0034): where the **Active cell**
   goes next, over the lines of a table in grid mode. Pure, so the keys can be
   tested without a DOM; the table turns a position into the cell it focuses.

   The walk goes over LINES as the table lays them out: the head row, the body's
   rows, group headers, folded spans and open details, the footer. A line is
   the widths of its cells, counted in columns of the head row - a group
   header's label spans several, a detail spans them all. A position is a line
   and one column of the head row; the cell covering that column is the active
   one. Up and down keep the column, as a text caret keeps its goal across a
   short line: walking down through a group header and on into the rows lands
   in the column the walk came from, not at the header's label.

   It walks every line, not only those rendered: a virtual window renders a
   few dozen of twenty thousand, and the table brings the active cell into it
   (the lesson of the schedule's walk, ADR-0033 - a walk held inside the view
   leaves the keyboard stranded in it). */

import type { PinBlocks } from "./pinning";
import type { Line } from "./grouping";

/* --- Where the columns lie ----------------------------------------------------- */

/** The head row of a table in grid mode, as the walk needs it. */
export interface GridLayout {
  /** How many control columns stand first: the selection's, the expander's. */
  controls: number;
  /** Whether the grouping's span column stands after them. */
  span: boolean;
  /** One entry per data column, in the order they stand - visible ones only,
      the pinned blocks at either end: whether it carries an aggregate. */
  aggregates: readonly boolean[];
  /** Whether the row actions' column stands last. */
  actions: boolean;
  /** The pinned blocks, in cells of the head row. */
  blocks: PinBlocks;
}

/** How many columns the head row has. */
export const columnCount = (layout: GridLayout): number =>
  layout.controls + (layout.span ? 1 : 0) + layout.aggregates.length + (layout.actions ? 1 : 0);

/** How the cells of a group header or a folded span divide the data columns
    (ADR-0029): the leading run without an aggregate (`lead`) carries the label
    or the count; with a start block the label and the count cover only its
    pinned columns, so that they stick with them. `GroupLine` renders from it,
    and the walk reads the same arithmetic - the two cannot drift apart. */
export function groupLineLayout(layout: GridLayout): { lead: number; labelColumns: number; countColumns: number } {
  const { controls, span, aggregates, actions, blocks } = layout;
  const n = aggregates.length;
  const firstAggregate = aggregates.indexOf(true);
  /* The leading run stops before the end block: a cell over it would stick
     nowhere. */
  const endColumns = blocks.end > 0 ? blocks.end - (actions ? 1 : 0) : 0;
  /* Without a span the label needs one column at least: over none it was a
     cell of `colSpan` 0, which counts as one, and every aggregate after it
     stood a column too far right. Where the first column carries an aggregate
     the label takes its place in the header, and the sum stands in the
     footer. */
  const lead = Math.max(span || n === 0 ? 0 : 1, Math.min(firstAggregate === -1 ? n : firstAggregate, n - endColumns));
  const before = controls + (span ? 1 : 0);
  const startColumns = blocks.start > 0 ? blocks.start - before : 0;
  return {
    lead,
    labelColumns: blocks.start > 0 ? Math.min(lead, startColumns) : lead,
    countColumns: startColumns > 0 ? Math.min(lead, startColumns) : lead,
  };
}

/** A line's kind, as far as its cells go: a cell per column (head, row,
    footer), one cell over all (a detail, the empty body), or a group line. */
export type LineShape = "cells" | "whole" | "header" | "folded";

/** The widths of a line's cells, left to right, in columns of the head row.
    They add up to the column count. */
export function lineCells(shape: LineShape, layout: GridLayout): number[] {
  const count = columnCount(layout);
  if (shape === "cells") return Array.from({ length: count }, () => 1);
  if (shape === "whole") return [count];
  const { lead, labelColumns, countColumns } = groupLineLayout(layout);
  const controls = Array.from({ length: layout.controls }, () => 1);
  const rest = Array.from({ length: layout.aggregates.length - lead + (layout.actions ? 1 : 0) }, () => 1);
  const filler = (covered: number) => (lead - covered > 0 ? [lead - covered] : []);
  if (shape === "header") return [...controls, (layout.span ? 1 : 0) + labelColumns, ...filler(labelColumns), ...rest];
  /* A folded span: its value in the span column, "3 entries" over the run. */
  return [...controls, 1, ...(countColumns > 0 ? [countColumns] : []), ...filler(countColumns), ...rest];
}

/* --- The lines ------------------------------------------------------------------ */

/** One line of the grid. */
export interface GridLine<Z = unknown> {
  /** Identifies the line across renders - what the Active cell holds on to
      while rows are sorted, filtered or scrolled out of a virtual window:
      `head`, `foot`, `empty`, `row:<key>`, `detail:<key>`, `header:<path>`,
      `folded:<path>`. */
  key: string;
  /** The widths of its cells, in columns of the head row. */
  cells: readonly number[];
  /** Where it stands in the body the table windows - the rows, or the lines
      when grouped; -1 for a line outside it (head, foot, empty). A detail
      stands where its row does. */
  at: number;
  /** The row of a row line or of a detail. */
  row?: Z;
}

export interface GridInput<Z> {
  layout: GridLayout;
  /** The body: its lines when grouped, its rows otherwise - all of them, not
      only the window a virtual table renders. */
  body: { lines: readonly Line<Z>[] } | { rows: readonly Z[] };
  rowKey: (row: Z) => string;
  /** The rows whose detail stands open. */
  expanded: ReadonlySet<string>;
  /** Whether a footer row stands. */
  foot: boolean;
}

/** Every line of a table in grid mode, top to bottom. An empty body is one
    line: the cell that says so. */
export function gridLines<Z>({ layout, body, rowKey, expanded, foot }: GridInput<Z>): GridLine<Z>[] {
  const cells = lineCells("cells", layout);
  const whole = lineCells("whole", layout);
  const out: GridLine<Z>[] = [{ key: "head", cells, at: -1 }];
  const row = (r: Z, at: number) => {
    const key = rowKey(r);
    out.push({ key: `row:${key}`, cells, at, row: r });
    if (expanded.has(key)) out.push({ key: `detail:${key}`, cells: whole, at, row: r });
  };
  if ("rows" in body) body.rows.forEach(row);
  else
    body.lines.forEach((line, at) => {
      if (line.kind === "row") row(line.row, at);
      else out.push({ key: `${line.kind}:${line.group.path}`, cells: lineCells(line.kind, layout), at });
    });
  if (out.length === 1) out.push({ key: "empty", cells: whole, at: -1 });
  if (foot) out.push({ key: "foot", cells, at: -1 });
  return out;
}

/* --- The walk ------------------------------------------------------------------- */

/** Where the grid stands: a line, and a column of the head row. */
export interface GridPosition {
  line: number;
  column: number;
}

/** The cell of a line covering a column: its index, and the column it begins at. */
export function cellAt(cells: readonly number[], column: number): { index: number; start: number } {
  let start = 0;
  for (let index = 0; index < cells.length; index++) {
    const end = start + cells[index]!;
    if (column < end || index === cells.length - 1) return { index, start };
    start = end;
  }
  return { index: 0, start: 0 };
}

const startOf = (cells: readonly number[], index: number): number => cells.slice(0, index).reduce((a, b) => a + b, 0);

export type GridMove = "left" | "right" | "up" | "down" | "lineStart" | "lineEnd" | "first" | "last" | "pageUp" | "pageDown";

/** Where a key takes the Active cell. At an edge it stays. `page` is how many
    lines PageUp and PageDown jump - the lines the scroll area shows. */
export function stepGrid(lines: readonly GridLine[], at: GridPosition, move: GridMove, page: number): GridPosition {
  const last = lines.length - 1;
  const line = lines[at.line];
  if (!line) return at;
  const { index } = cellAt(line.cells, at.column);
  const lineAt = (to: number) => ({ line: Math.max(0, Math.min(last, to)), column: at.column });
  switch (move) {
    case "left":
      return index > 0 ? { line: at.line, column: startOf(line.cells, index - 1) } : at;
    case "right":
      return index < line.cells.length - 1 ? { line: at.line, column: startOf(line.cells, index + 1) } : at;
    case "up":
      return lineAt(at.line - 1);
    case "down":
      return lineAt(at.line + 1);
    case "pageUp":
      return lineAt(at.line - Math.max(1, page));
    case "pageDown":
      return lineAt(at.line + Math.max(1, page));
    case "lineStart":
      return { line: at.line, column: 0 };
    case "lineEnd":
      return { line: at.line, column: startOf(line.cells, line.cells.length - 1) };
    case "first":
      return { line: 0, column: 0 };
    case "last":
      return { line: last, column: startOf(lines[last]!.cells, lines[last]!.cells.length - 1) };
  }
}

/** The next cell in reading order after `at` - before it, `backwards` - that
    `accept` takes; null where none does. Tab in an editor moves on this way,
    to the next cell that edits. */
export function nextCell(
  lines: readonly GridLine[],
  at: GridPosition,
  backwards: boolean,
  accept: (position: GridPosition) => boolean,
): GridPosition | null {
  const cells: GridPosition[] = lines.flatMap((line, i) => line.cells.map((_, c) => ({ line: i, column: startOf(line.cells, c) })));
  const here = cells.findIndex((p) => p.line === at.line && p.column === cellAt(lines[at.line]!.cells, at.column).start);
  const order = backwards ? cells.slice(0, Math.max(0, here)).reverse() : cells.slice(here + 1);
  return order.find(accept) ?? null;
}

/** Where the Active cell's line or column stands now, found by its key. Where
    the key is gone - its row filtered away, its group folded, its column
    hidden - it is the one now at the index it stood at, so that the tab stop
    stays where the reader left it. A pinned column is found in its block. */
export function placeOf(keys: readonly string[], key: string, index: number): number {
  const found = keys.indexOf(key);
  return found >= 0 ? found : Math.max(0, Math.min(keys.length - 1, index));
}
