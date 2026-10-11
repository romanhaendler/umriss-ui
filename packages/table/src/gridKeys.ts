/* The grid's events on the <table>: the keys, the click, the focus and the
   blur, and the DOM reading they and `GridFocus` share (a cell and its place).
   They walk the Active cell and call the edit paths of `gridEditing.ts`. */

import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { nextCell, stepGrid } from "./model/gridWalk";
import type { GridMove, GridPosition } from "./model/gridWalk";
import { NEW_LINE } from "./gridState";
import type { Active } from "./gridState";
import type { EditingActions, GridInput } from "./gridEditing";

export const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

/** The cells of a line, with the column each begins at. */
export function cellsOf(row: HTMLTableRowElement): { cell: HTMLTableCellElement; start: number; end: number }[] {
  let start = 0;
  return Array.from(row.cells).map((cell) => {
    const entry = { cell, start, end: start + cell.colSpan };
    start = entry.end;
    return entry;
  });
}

type Place = { cell: HTMLTableCellElement; line: string; column: number; end: number };

/** The cell a key or a focus happened in, and its place: its line's key and
    the column it begins at. Null outside this grid - a popover's panel is in
    a portal, and a key there is the panel's. */
function placeOfCell(table: HTMLTableElement, target: EventTarget | null): Place | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest<HTMLTableCellElement>("td, th");
  const row = cell?.parentElement as HTMLTableRowElement | undefined;
  const line = row?.dataset.gridLine;
  if (!cell || !row || line === undefined || row.closest("table") !== table) return null;
  const { start, end } = cellsOf(row).find((c) => c.cell === cell)!;
  return { cell, line, column: start, end };
}

const MOVES: Readonly<Record<string, GridMove>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Home: "lineStart",
  End: "lineEnd",
  PageUp: "pageUp",
  PageDown: "pageDown",
};

/** How many lines PageUp and PageDown jump: as many as the scroll area shows
    - or the window, where the table grows with its rows. */
function pageOf(cell: HTMLElement, table: HTMLTableElement): number {
  const height = cell.parentElement?.getBoundingClientRect().height ?? 0;
  const scroller = table.parentElement;
  const view = Math.min(scroller?.clientHeight || window.innerHeight, window.innerHeight);
  return height > 0 ? Math.max(1, Math.floor(view / height) - 1) : 10;
}

/** The column a key starts from in this cell: the walk's goal where the
    Active cell stands here and the cell spans it, else the cell's first. */
function goalIn(place: Place, active: Active | null): number {
  return active && active.line === place.line && active.columnIndex >= place.column && active.columnIndex < place.end
    ? active.columnIndex
    : place.column;
}

/** The Active cell moves here: focused where it stands, otherwise brought
    into the virtual window and focused once it is rendered. */
function moveTo({ grid, lines, ids, virtual }: GridInput, table: HTMLTableElement, p: GridPosition) {
  const line = lines[p.line];
  if (!line) return;
  /* The column stays the walk's goal, not the start of the cell that covers
     it: down through a spanning label, on down again, the walk is back in
     the column it came from. */
  grid.setState((s) => ({ ...s, widget: false, active: { line: line.key, column: ids[p.column] ?? "", lineIndex: p.line, columnIndex: p.column } }));
  const row = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr[data-grid-line]")).find((r) => r.dataset.gridLine === line.key);
  const cell = row ? cellsOf(row).find((c) => p.column >= c.start && p.column < c.end)?.cell : undefined;
  /* The head sticks, always in view: scrolled into view it sat in the
     scroll padding kept for it, and the body jumped up beneath it. */
  if (cell) cell.focus({ preventScroll: line.key === "head" });
  else {
    grid.focus.want("cell");
    if (virtual && line.at >= 0) virtual.showRow(line.at);
  }
}

/* The handlers stand on the <table>: the element they are heard on is the grid. */
export function onKeyDown(input: GridInput, actions: EditingActions, event: ReactKeyboardEvent<HTMLTableElement>) {
  const { grid, lines, ids, columnById, select } = input;
  const { rowAt, editable, startEdit, save, discard } = actions;
  const keys = lines.map((l) => l.key);
  const editing = grid.state.editing;
  const table = event.currentTarget;
  if (event.defaultPrevented) return;
  const place = placeOfCell(table, event.target);
  if (!place) return;
  const here: GridPosition = { line: keys.indexOf(place.line), column: goalIn(place, grid.state.active) };
  if (here.line < 0) return;

  /* In a Row draft: Enter saves it, Escape discards it, and Tab walks its
     fields as the browser does - a button keeps its Enter. */
  if (editing?.row && editing.line === place.line) {
    if (event.key === "Escape") {
      event.preventDefault();
      discard();
    } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      save();
    }
    return;
  }

  /* In the editor: Enter commits, Escape cancels, Tab commits and moves on
     to the next cell that edits. A button in an editor - the date picker's
     trigger - keeps its Enter. */
  if (editing && editing.line === place.line && editing.column === ids[place.column]) {
    if (event.key === "Escape") {
      event.preventDefault();
      discard();
    } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      save();
    } else if (event.key === "Tab") {
      const next = nextCell(lines, here, event.shiftKey, editable);
      /* Past the last cell that edits, Tab leaves the grid as it would
         anywhere else - once the draft is reported. */
      const done = save();
      if (next || !done) event.preventDefault();
      if (!done) return;
      if (next) startEdit(next);
      else grid.focus.want(null);
    }
    return;
  }

  /* Among the cell's own controls: Escape and F2 go back to the cell. */
  if (event.target !== place.cell) {
    if (event.key === "Escape" || event.key === "F2") {
      event.preventDefault();
      grid.setState((s) => ({ ...s, widget: false }));
      place.cell.focus();
    }
    return;
  }

  if (event.altKey || event.metaKey) return;
  const move = event.ctrlKey ? { Home: "first", End: "last" }[event.key] : MOVES[event.key];
  if (move) {
    event.preventDefault();
    moveTo(input, table, stepGrid(lines, here, move as GridMove, pageOf(place.cell, table)));
    return;
  }
  if (event.ctrlKey) return;
  /* Space selects the row, as in AG Grid and MUI - the key its checkbox
     answers to, from any of its cells. Without a selection it does
     nothing, and never starts an edit: it would open editors on the way
     down the page. */
  if (event.key === " ") {
    const at = rowAt(here);
    if (select && at && place.line !== NEW_LINE) {
      event.preventDefault();
      select(at.row);
    }
    return;
  }
  if (event.key === "Enter" || event.key === "F2") {
    if (editable(here)) {
      event.preventDefault();
      startEdit(here);
      return;
    }
    const first = place.cell.querySelector<HTMLElement>(FOCUSABLE);
    if (first) {
      event.preventDefault();
      grid.setState((s) => ({ ...s, widget: true }));
      first.focus();
    }
    return;
  }
  /* Typing starts an edit, as in a spreadsheet: a text with what was typed,
     a number with a digit typed. Any other editor opens on the value as it
     stands - a select or a day has no first letter to take. */
  if (event.key.length === 1 && editable(here)) {
    const kind = columnById(ids[place.column] ?? "")?.spec.edit;
    event.preventDefault();
    startEdit(here, kind === "text" ? event.key : kind === "number" && /\d/.test(event.key) ? Number(event.key) : undefined);
  }
}

/* A click on a cell that edits opens its editor (ADR-0036) - a click on
   the cell itself, not on a control a presentation put into it. The focus
   the click brought has already run: an edit it could not end is still
   open, and this click opens nothing. */
export function onClick({ grid, lines }: GridInput, { editable, startEdit }: EditingActions, event: ReactMouseEvent<HTMLTableElement>) {
  if (event.button !== 0 || grid.state.editing) return;
  const place = placeOfCell(event.currentTarget, event.target);
  if (!place || (event.target as Element).closest(FOCUSABLE) !== place.cell) return;
  const here: GridPosition = { line: lines.findIndex((l) => l.key === place.line), column: place.column };
  if (here.line >= 0 && editable(here)) startEdit(here, undefined, true);
}

/* A focus in the grid - by key, by click, by Tab - makes its cell the
   Active one; a focus inside a cell is among its controls. An edit the
   focus left for another cell ends where it validates and is reported; one
   that does not keeps the editor, and the focus goes back to it with its
   message - a draft is never dropped without a word. A Row draft is not
   left by a focus at all. */
export function onFocus({ grid, lines, ids }: GridInput, { save, refuse }: EditingActions, event: ReactFocusEvent<HTMLTableElement>) {
  const editing = grid.state.editing;
  const place = placeOfCell(event.currentTarget, event.target);
  if (!place) return;
  const line = lines.findIndex((l) => l.key === place.line);
  const column = ids[place.column] ?? "";
  if (editing?.row) {
    if (editing.line !== place.line) return refuse();
    if (column in editing.drafts && column !== editing.column) grid.setState((s) => ({ ...s, editing: s.editing && { ...s.editing, column } }));
  } else if (editing && (editing.line !== place.line || editing.column !== column) && !save()) {
    grid.focus.want("editor");
    return;
  }
  grid.focus.want(null);
  /* From the state as the key just left it: a key moves the Active cell
     and focuses it in one event, and the focus must not undo the goal. */
  grid.setState((s) => {
    const goal = goalIn(place, s.active);
    return {
      ...s,
      widget: (event.target as Element) !== place.cell,
      active: { line: place.line, column: ids[goal] ?? "", lineIndex: Math.max(0, line), columnIndex: goal },
    };
  });
}

/* Leaving the grid leaves the cell's controls as well: tabbing back in
   lands on the cell. An edit stays open - a date picker's panel lies
   outside, in a portal. */
export function onBlur({ grid }: GridInput, event: ReactFocusEvent<HTMLTableElement>) {
  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) grid.setState((s) => (s.widget ? { ...s, widget: false } : s));
}
