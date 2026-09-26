/* Grid mode (table-grid-mode 02 and 03, ADR-0034): `<Table grid>` is one tab
   stop with an **Active cell** the arrows walk (`model/gridWalk.ts`), and a
   column that declares `edit` is edited in place.

   The Active cell is state, not DOM focus alone (G6): it holds on to its
   line's key and its column's id, so it survives sorting, filtering and a
   virtual window that renders its row away. The cells are the table's own
   `<td>` and `<th>`; which one carries the tab stop is written onto the DOM
   after every render (`GridFocus`) rather than threaded through every cell a
   table renders - head, rows, group lines, details, footer.

   Inside a cell, its own controls - a checkbox, the row actions, a fold, a
   sort button, whatever a presentation renders - leave the tab order, and
   Enter or F2 reaches them (G2, the APG grid's widget mode); Escape leaves.

   An edit is controlled (G3, the schedule's intent pattern, ADR-0023): the
   editor holds a draft, Enter or Tab reports it through `onCellEdit`, and the
   table applies nothing - the value changes when the caller's rows do.

   ADR-0036: a click on a cell that edits opens its editor. `editMode="row"`
   opens every cell of the row that edits as one **Row draft**, reported only
   when it is saved; a new row is always one. An edit of one cell is a draft
   of one column - the same state, the same save. */

import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import { DatePicker, FormField, Input, NumberInput, Popover, Select, VisuallyHidden, useFormats } from "@umriss-ui/core";
import type { VirtualRows, Wording } from "@umriss-ui/core";
import type { ColumnEntry } from "./registry";
import { occurringValues } from "./columnFilter";
import { isAbsent } from "./values";
import { nextCell, placeOf, rowLine, stepGrid } from "./model/gridWalk";
import type { GridLine, GridMove, GridPosition } from "./model/gridWalk";
import type { CellEdit, RowAdd, RowDelete, RowSave } from "./types";
import styles from "./Table.module.css";

/* --- State ------------------------------------------------------------------------ */

/** Where the Active cell stands: the keys it holds on to, and the indices it
    stood at - where a key is gone, the cell now at that index takes over. */
interface Active {
  line: string;
  column: string;
  lineIndex: number;
  columnIndex: number;
}

/** The line of a new row: above the body's rows, with no row key yet. */
export const NEW_LINE = "new";

/** An edit in progress: the line, the drafts of its open cells by column id -
    one in a cell's edit, every cell that edits in a Row draft - and the
    messages of the drafts that did not validate. */
export interface Editing {
  line: string;
  /** The open cell the focus is in, or goes back to. */
  column: string;
  /** A Row draft: reported only when saved, left only by saving or discarding. */
  row: boolean;
  drafts: Readonly<Record<string, unknown>>;
  errors: Readonly<Record<string, string>>;
  /** Someone tried to leave the Row draft: it asks to be saved or discarded first. */
  refused: boolean;
  /** A new row's values before anything is typed (`newRow`). */
  fresh?: unknown;
}

export interface GridState {
  active: Active | null;
  /** The Active cell's own controls are in the tab order: Enter or F2 went in. */
  widget: boolean;
  editing: Editing | null;
}

type Wish = "cell" | "editor" | "open";

/** What a key wants focused once the cell it names is rendered - the Active
    cell, or the editor in it. A virtual window renders a row a moment after
    the key that walked to it; the DOM effect grants the wish then. */
class FocusWish {
  private wish: Wish | null = null;

  /** `open`: the editor, with its list or calendar open - a click asked for it. */
  want(wish: Wish | null) {
    /* The editor outranks the cell: Tab commits one edit and opens the next. */
    if (this.wish === null || this.wish === "cell" || wish === null) this.wish = wish;
  }

  /** The wish, once - where the cell stands; otherwise it waits. */
  take(standing: boolean): Wish | null {
    const wish = standing ? this.wish : null;
    if (wish) this.wish = null;
    return wish;
  }
}

/** What the grid keeps between renders: the state, and the focus a key wished. */
export function useGridState() {
  const [state, setState] = useState<GridState>({ active: null, widget: false, editing: null });
  const [focus] = useState(() => new FocusWish());
  return { state, setState, focus };
}

export type GridHandle = ReturnType<typeof useGridState>;

/* --- What a cell reads ------------------------------------------------------------ */

export interface GridContextValue {
  editing: Editing | null;
  setDraft: (column: string, draft: unknown) => void;
  /** Ends the edit with this value for the column: reported where it validates. */
  commit: (column: string, value: unknown) => void;
  /** A Row draft's buttons. */
  save: () => void;
  discard: () => void;
  /** Reports a confirmed delete, where the table has `onRowDelete`. */
  remove: ((row: unknown) => void) | undefined;
  hook: { rows: readonly unknown[]; admitted: readonly unknown[] };
  wording: Wording;
}

export const GridContext = createContext<GridContextValue | null>(null);

/** The editor of a cell, when this cell is open - the one edited, or one of
    a Row draft's. */
export function useCellEditor(line: string, columnId: string): GridContextValue | null {
  const grid = useContext(GridContext);
  const editing = grid?.editing;
  return editing && editing.line === line && columnId in editing.drafts ? grid : null;
}

/* --- The DOM: which cell is the tab stop ------------------------------------------ */

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';
const SAVED = "data-grid-tabindex";

/** Takes an element inside a cell out of the tab order, or gives it back the
    tab stop it had - noted on the element, so that nothing a presentation
    set is lost. */
function quiet(element: HTMLElement, out: boolean) {
  if (out && !element.hasAttribute(SAVED)) {
    element.setAttribute(SAVED, element.getAttribute("tabindex") ?? "");
    element.tabIndex = -1;
  } else if (!out && element.hasAttribute(SAVED)) {
    const was = element.getAttribute(SAVED)!;
    if (was === "") element.removeAttribute("tabindex");
    else element.setAttribute("tabindex", was);
    element.removeAttribute(SAVED);
  }
}

/** The cells of a line, with the column each begins at. */
function cellsOf(row: HTMLTableRowElement): { cell: HTMLTableCellElement; start: number; end: number }[] {
  let start = 0;
  return Array.from(row.cells).map((cell) => {
    const entry = { cell, start, end: start + cell.colSpan };
    start = entry.end;
    return entry;
  });
}

/** The cell a key or a focus happened in, and its place: its line's key and
    the column it begins at. Null outside this grid - a popover's panel is in
    a portal, and a key there is the panel's. */
function placeOfCell(table: HTMLTableElement, target: EventTarget | null): { cell: HTMLTableCellElement; line: string; column: number; end: number } | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest<HTMLTableCellElement>("td, th");
  const row = cell?.parentElement as HTMLTableRowElement | undefined;
  const line = row?.dataset.gridLine;
  if (!cell || !row || line === undefined || row.closest("table") !== table) return null;
  const { start, end } = cellsOf(row).find((c) => c.cell === cell)!;
  return { cell, line, column: start, end };
}

/** Writes the tab stop onto the Active cell and takes every cell's own
    controls out of the tab order - after every render, since a virtual window
    renders new rows as it scrolls. A component and not a hook of the frame's:
    what it needs is known only after the frame's early return. */
export function GridFocus({
  table: tableRef,
  grid,
  lines,
  ids,
  editable,
}: {
  table: RefObject<HTMLTableElement | null>;
  grid: GridHandle;
  lines: readonly GridLine[];
  ids: readonly string[];
  /** In a grid that edits: whether the cell at a position does. Every other
      cell of its body and foot is `aria-readonly` (table-grid-mode 05). */
  editable?: (p: GridPosition) => boolean;
}) {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const { active, widget, editing } = grid.state;
    const at = resolve(active, lines, ids);
    const key = lines[at.line]?.key;
    const indexOf = new Map(lines.map((l, i) => [l.key, i]));
    let stop: HTMLTableCellElement | null = null;
    let fallback: HTMLTableCellElement | null = null;
    /* ponytail: every cell and every control in them, after every render -
       a few hundred in a virtual window, all of them in a long table without
       one; a pass over the changed lines only is the upgrade if it shows. */
    for (const row of Array.from(table.querySelectorAll<HTMLTableRowElement>("tr[data-grid-line]"))) {
      const line = row.dataset.gridLine!;
      const cells = cellsOf(row);
      for (const { cell, start, end } of cells) {
        const covers = (at.column >= start && at.column < end) || (cell === cells.at(-1)!.cell && at.column >= end);
        if (covers && line === key) stop = cell;
        if (covers && fallback === null && line !== "head") fallback = cell;
        cell.tabIndex = -1;
        if (editable && line !== "head" && !editable({ line: indexOf.get(line) ?? -1, column: start })) cell.setAttribute("aria-readonly", "true");
        else cell.removeAttribute("aria-readonly");
        /* A Row draft's cells are open all of them: Tab walks its editors and
           its buttons as in a form. */
        const open = (editing?.row === true && editing.line === line) || (cell === stop && (widget || (editing !== null && editing.line === line)));
        for (const element of Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE))) quiet(element, !open);
      }
    }
    /* The Active cell's line not rendered - a virtual window scrolled away
       from it: the tab stop stands in the window, in the same column, and
       whoever tabs in starts there. */
    const target = stop ?? fallback ?? table.querySelector<HTMLTableCellElement>("tr[data-grid-line] > *");
    /* A Row draft's fields are its stops; its cell as one more would stand
       between them on the way back. */
    if (target && !(editing?.row && target.parentElement?.dataset.gridLine === editing.line)) target.tabIndex = 0;
    const wish = grid.focus.take(stop !== null);
    if (wish === "editor" || wish === "open") {
      const field = (stop as HTMLTableCellElement | null)?.querySelector<HTMLElement>("input, select, textarea, button");
      field?.focus();
      if (field instanceof HTMLInputElement && field.type === "text") field.setSelectionRange(field.value.length, field.value.length);
      /* Clicked open, a select shows its list and a day its calendar at once:
         the click was the choice to edit (ADR-0036). The picker needs the
         click's activation, which the frame after it still has. */
      if (wish === "open" && field instanceof HTMLSelectElement) {
        try {
          field.showPicker();
        } catch {
          /* Not in every browser: the select stays focused, one more click opens it. */
        }
      } else if (wish === "open" && field instanceof HTMLButtonElement) field.click();
    } else if (wish === "cell") (stop as HTMLTableCellElement | null)?.focus();
  });
  return null;
}

/** The Active cell as a position over the lines; before any, the first
    cell of the body. */
function resolve(active: Active | null, lines: readonly GridLine[], ids: readonly string[]): GridPosition {
  if (!active) return { line: Math.min(1, lines.length - 1), column: 0 };
  return {
    line: placeOf(
      lines.map((l) => l.key),
      active.line,
      active.lineIndex,
    ),
    column: placeOf(ids, active.column, active.columnIndex),
  };
}

/* --- The keys --------------------------------------------------------------------- */

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

export interface GridInput {
  grid: GridHandle;
  lines: readonly GridLine[];
  /** The head row's columns: data columns by id, the others by a name of
      their own (`#select`, `#detail`, `#span`, `#actions`). */
  ids: readonly string[];
  /** The data columns by id - the ones an edit can be declared on. */
  columnById: (id: string) => ColumnEntry | undefined;
  rowKey: (row: unknown) => string;
  virtual: VirtualRows | undefined;
  onCellEdit: ((edit: CellEdit<unknown>) => void) | undefined;
  /** `editMode="row"` (ADR-0036): a row opens whole, as a Row draft. */
  rowMode: boolean;
  onRowSave: ((save: RowSave<unknown>) => void) | undefined;
  onRowAdd: ((add: RowAdd) => void) | undefined;
  newRow: (() => unknown) | undefined;
  onRowDelete: ((remove: RowDelete<unknown>) => void) | undefined;
  /** Selects or deselects a row - in a table with selection; Space asks for
      it from any cell of the row. */
  select: ((row: unknown) => void) | undefined;
}

/** Does this column edit? */
const edits = (entry: ColumnEntry | undefined): entry is ColumnEntry => entry?.spec.edit !== undefined;

/** Two values the same for an edit: a point in time by its time, an absent
    value and an emptied text alike. */
function same(a: unknown, b: unknown): boolean {
  const plain = (v: unknown) => (isAbsent(v) || v === "" ? null : v instanceof Date ? v.getTime() : v);
  return Object.is(plain(a), plain(b));
}

/** The frame's handlers for a table in grid mode. Not a hook: they close over
    this render's lines, and the frame calls them after its early return. */
export function gridHandlers(input: GridInput) {
  const { grid, lines, ids, columnById, rowKey, virtual, onCellEdit, rowMode, onRowSave, onRowAdd, newRow, onRowDelete, select } = input;
  const { setState } = grid;
  const keys = lines.map((l) => l.key);
  const editing = grid.state.editing;

  const lineRow = (key: string) => (key === NEW_LINE ? editing?.fresh : lines.find((l) => l.key === key)?.row);
  /** The row of a row line - not of its detail, nor of a group line. */
  const rowAt = (p: GridPosition) => {
    const line = lines[p.line];
    if (line?.key === NEW_LINE) return { row: line.row };
    return line?.row !== undefined && line.key === rowLine(rowKey(line.row)) ? { row: line.row } : null;
  };
  const editable = (p: GridPosition) => rowAt(p) !== null && edits(columnById(ids[p.column] ?? ""));
  /** The columns that edit, left to right. */
  const editingColumns = () => ids.map(columnById).filter(edits);

  /** The column a key starts from in this cell: the walk's goal where the
      Active cell stands here and the cell spans it, else the cell's first. */
  const goalIn = (place: { line: string; column: number; end: number }, active = grid.state.active) => {
    return active && active.line === place.line && active.columnIndex >= place.column && active.columnIndex < place.end
      ? active.columnIndex
      : place.column;
  };

  /** The Active cell moves here: focused where it stands, otherwise brought
      into the virtual window and focused once it is rendered. */
  const moveTo = (table: HTMLTableElement, p: GridPosition) => {
    const line = lines[p.line];
    if (!line) return;
    /* The column stays the walk's goal, not the start of the cell that covers
       it: down through a spanning label, on down again, the walk is back in
       the column it came from. */
    setState((s) => ({ ...s, widget: false, active: { line: line.key, column: ids[p.column] ?? "", lineIndex: p.line, columnIndex: p.column } }));
    const row = Array.from(table.querySelectorAll<HTMLTableRowElement>("tr[data-grid-line]")).find((r) => r.dataset.gridLine === line.key);
    const cell = row ? cellsOf(row).find((c) => p.column >= c.start && p.column < c.end)?.cell : undefined;
    /* The head sticks, always in view: scrolled into view it sat in the
       scroll padding kept for it, and the body jumped up beneath it. */
    if (cell) cell.focus({ preventScroll: line.key === "head" });
    else {
      grid.focus.want("cell");
      if (virtual && line.at >= 0) virtual.showRow(line.at);
    }
  };

  /** Opens the cell at `p` - in row mode its whole row. `initial` is what was
      typed; `open` asks the select or the day to show its choices. */
  const startEdit = (p: GridPosition, initial?: unknown, open = false) => {
    const line = lines[p.line]!;
    const entry = columnById(ids[p.column] ?? "")!;
    const drafts: Record<string, unknown> = rowMode ? Object.fromEntries(editingColumns().map((e) => [e.spec.id, e.read(line.row)])) : {};
    drafts[entry.spec.id] = initial === undefined ? entry.read(line.row) : initial;
    grid.focus.want(open ? "open" : "editor");
    setState((s) => ({
      ...s,
      active: { line: line.key, column: entry.spec.id, lineIndex: p.line, columnIndex: p.column },
      editing: { line: line.key, column: entry.spec.id, row: rowMode, drafts, errors: {}, refused: false },
    }));
  };

  /** Ends the edit: every open draft validated, then reported - a cell's
      edit through `onCellEdit`, a Row draft's changes through `onRowSave`, a
      new row whole through `onRowAdd`. Where a draft does not validate, the
      edit stays open with its messages and the focus in the first of them.
      True when the edit is over. */
  const save = (patch: Readonly<Record<string, unknown>> = {}): boolean => {
    if (!editing) return true;
    const drafts = { ...editing.drafts, ...patch };
    const row = lineRow(editing.line);
    if (row === undefined) {
      setState((s) => ({ ...s, editing: null }));
      return true;
    }
    const errors: Record<string, string> = {};
    for (const [id, value] of Object.entries(drafts)) {
      const message = columnById(id)?.spec.validate?.(value as never, row as never);
      if (message) errors[id] = message;
    }
    const invalid = Object.keys(drafts).find((id) => errors[id] !== undefined);
    if (invalid !== undefined) {
      const column = editing.row ? invalid : editing.column;
      grid.focus.want("editor");
      setState((s) => ({
        ...s,
        active: { line: editing.line, column, lineIndex: Math.max(0, keys.indexOf(editing.line)), columnIndex: ids.indexOf(column) },
        editing: s.editing && { ...s.editing, column, drafts, errors, refused: false },
      }));
      return false;
    }
    const changed = Object.keys(drafts).filter((id) => !same(drafts[id], columnById(id)?.read(row)));
    if (editing.line === NEW_LINE) onRowAdd?.({ values: drafts });
    else if (editing.row) {
      if (changed.length > 0) onRowSave?.({ rowKey: rowKey(row), changes: Object.fromEntries(changed.map((id) => [id, drafts[id]])), row });
    } else if (changed.length > 0) onCellEdit?.({ rowKey: rowKey(row), columnId: editing.column, value: drafts[editing.column], row });
    grid.focus.want("cell");
    setState((s) => ({ ...s, editing: null }));
    return true;
  };

  const commit = (column: string, value: unknown) => save({ [column]: value });

  const discard = () => {
    grid.focus.want("cell");
    setState((s) => ({ ...s, editing: null }));
  };

  /** A Row draft stays: someone tried to leave it. It says so beside its
      buttons, and the focus goes back into it. */
  const refuse = () => {
    grid.focus.want("editor");
    setState((s) => (s.editing ? { ...s, editing: { ...s.editing, refused: true } } : s));
  };

  const setDraft = (column: string, draft: unknown) =>
    setState((s) => {
      if (!s.editing) return s;
      /* A message stays until the draft is right: checked again as it is
         corrected, never before the first attempt to commit. */
      const errors = { ...s.editing.errors };
      if (errors[column] !== undefined) {
        const message = columnById(column)?.spec.validate?.(draft as never, lineRow(s.editing.line) as never);
        if (message) errors[column] = message;
        else delete errors[column];
      }
      return { ...s, editing: { ...s.editing, drafts: { ...s.editing.drafts, [column]: draft }, errors, refused: false } };
    });

  /** "New row": an empty Row draft above the rows, its first cell that edits
      focused. An open edit ends first - a Row draft cannot be left so. */
  const addRow = () => {
    if (editing && (editing.row || !save())) return refuse();
    const columns = editingColumns();
    const first = columns[0];
    if (!first) return;
    const fresh = newRow?.() ?? {};
    grid.focus.want("editor");
    setState((s) => ({
      ...s,
      widget: false,
      active: { line: NEW_LINE, column: first.spec.id, lineIndex: 1, columnIndex: ids.indexOf(first.spec.id) },
      editing: {
        line: NEW_LINE,
        column: first.spec.id,
        row: true,
        /* What `newRow` leaves out is empty - `null`, as an emptied field says it. */
        drafts: Object.fromEntries(columns.map((e) => [e.spec.id, e.read(fresh) ?? null])),
        errors: {},
        refused: false,
        fresh,
      },
    }));
  };

  /* The handlers stand on the <table>: the element they are heard on is the grid. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>) => {
    const table = event.currentTarget;
    if (event.defaultPrevented) return;
    const place = placeOfCell(table, event.target);
    if (!place) return;
    const here: GridPosition = { line: keys.indexOf(place.line), column: goalIn(place) };
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
        setState((s) => ({ ...s, widget: false }));
        place.cell.focus();
      }
      return;
    }

    if (event.altKey || event.metaKey) return;
    const move = event.ctrlKey ? { Home: "first", End: "last" }[event.key] : MOVES[event.key];
    if (move) {
      event.preventDefault();
      moveTo(table, stepGrid(lines, here, move as GridMove, pageOf(place.cell, table)));
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
        setState((s) => ({ ...s, widget: true }));
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
  };

  /* A click on a cell that edits opens its editor (ADR-0036) - a click on
     the cell itself, not on a control a presentation put into it. The focus
     the click brought has already run: an edit it could not end is still
     open, and this click opens nothing. */
  const onClick = (event: ReactMouseEvent<HTMLTableElement>) => {
    if (event.button !== 0 || editing) return;
    const place = placeOfCell(event.currentTarget, event.target);
    if (!place || (event.target as Element).closest(FOCUSABLE) !== place.cell) return;
    const here: GridPosition = { line: keys.indexOf(place.line), column: place.column };
    if (here.line >= 0 && editable(here)) startEdit(here, undefined, true);
  };

  /* A focus in the grid - by key, by click, by Tab - makes its cell the
     Active one; a focus inside a cell is among its controls. An edit the
     focus left for another cell ends where it validates and is reported; one
     that does not keeps the editor, and the focus goes back to it with its
     message - a draft is never dropped without a word. A Row draft is not
     left by a focus at all. */
  const onFocus = (event: ReactFocusEvent<HTMLTableElement>) => {
    const place = placeOfCell(event.currentTarget, event.target);
    if (!place) return;
    const line = keys.indexOf(place.line);
    const column = ids[place.column] ?? "";
    if (editing?.row) {
      if (editing.line !== place.line) return refuse();
      if (column in editing.drafts && column !== editing.column) setState((s) => ({ ...s, editing: s.editing && { ...s.editing, column } }));
    } else if (editing && (editing.line !== place.line || editing.column !== column) && !save()) {
      grid.focus.want("editor");
      return;
    }
    grid.focus.want(null);
    /* From the state as the key just left it: a key moves the Active cell
       and focuses it in one event, and the focus must not undo the goal. */
    setState((s) => {
      const goal = goalIn(place, s.active);
      return {
        ...s,
        widget: (event.target as Element) !== place.cell,
        active: { line: place.line, column: ids[goal] ?? "", lineIndex: Math.max(0, line), columnIndex: goal },
      };
    });
  };

  /* Leaving the grid leaves the cell's controls as well: tabbing back in
     lands on the cell. An edit stays open - a date picker's panel lies
     outside, in a portal. */
  const onBlur = (event: ReactFocusEvent<HTMLTableElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setState((s) => (s.widget ? { ...s, widget: false } : s));
  };

  const context: Omit<GridContextValue, "hook" | "wording"> = {
    editing,
    setDraft,
    commit,
    save: () => void save(),
    discard,
    remove: onRowDelete && ((row: unknown) => onRowDelete({ rowKey: rowKey(row), row })),
  };
  return { onKeyDown, onClick, onFocus, onBlur, context, editable, addRow };
}

/** How many lines PageUp and PageDown jump: as many as the scroll area shows
    - or the window, where the table grows with its rows. */
function pageOf(cell: HTMLElement, table: HTMLTableElement): number {
  const height = cell.parentElement?.getBoundingClientRect().height ?? 0;
  const scroller = table.parentElement;
  const view = Math.min(scroller?.clientHeight || window.innerHeight, window.innerHeight);
  return height > 0 ? Math.max(1, Math.floor(view / height) - 1) : 10;
}

/* --- The editor ------------------------------------------------------------------- */

/** The editor in a cell: the core field for its kind, or the column's own,
    inside a `FormField` whose error is the message of a draft that did not
    validate (G4, G5). Its name says what is edited, for which row.

    It lies over the cell at the cell's size, and the message hangs beneath
    it in a popover: nothing in the table shifts while a cell is edited
    (table-grid-mode 05). The field's description stays the `FormField`'s
    message, out of sight; the popover is its picture. */
export function CellEditor({ entry, row, rowName, grid }: { entry: ColumnEntry; row: unknown; rowName: string; grid: GridContextValue }) {
  const formats = useFormats();
  const anchor = useRef<HTMLDivElement>(null);
  const { spec } = entry;
  const editing = grid.editing!;
  const id = spec.id;
  const draft = editing.drafts[id];
  const error = editing.errors[id] ?? null;
  const setDraft = (value: unknown) => grid.setDraft(id, value);
  const label = grid.wording.editCell(spec.label, rowName);
  let field: ReactNode;
  if (typeof spec.edit === "function") {
    field = (spec.edit as (editor: unknown) => ReactNode)({
      value: draft,
      onChange: setDraft,
      commit: (value?: unknown) => grid.commit(id, value === undefined ? draft : value),
      row,
      invalid: error !== null,
      label,
    });
  } else if (spec.edit === "number") {
    field = <NumberInput size="sm" value={typeof draft === "number" ? draft : null} onChange={setDraft} />;
  } else if (spec.edit === "date") {
    /* A day picked is a decision: it commits, as Enter does in a text - in a
       Row draft it is one of the row's, saved with it. */
    field = <DatePicker size="sm" value={draft instanceof Date ? draft : null} onChange={(date) => (editing.row ? setDraft(date) : grid.commit(id, date))} />;
  } else if (spec.edit === "select") {
    const options = spec.editOptions ?? occurringValues(grid.hook.admitted, entry.read, formats).values;
    const index = options.findIndex((o) => same(o, draft));
    field = (
      <Select selectSize="sm" value={index < 0 ? "" : String(index)} onChange={(event) => setDraft(options[Number(event.target.value)])}>
        {index < 0 && <option value="" />}
        {options.map((option, i) => (
          <option key={i} value={i}>
            {option instanceof Date ? formats.date(option) : String(option)}
          </option>
        ))}
      </Select>
    );
  } else {
    field = <Input size="sm" value={isAbsent(draft) ? "" : String(draft)} onChange={(event) => setDraft(event.target.value)} />;
  }
  return (
    <div ref={anchor} className={styles.editor}>
      <FormField className={styles.editorField} label={<VisuallyHidden>{label}</VisuallyHidden>} error={error ?? undefined}>
        {field}
      </FormField>
      {/* Held open while the draft does not validate: an outside click or
          Escape does not take the message away - Escape cancels the edit. */}
      <Popover open={error !== null} onOpenChange={() => undefined} anchorRef={anchor} restoreFocus={false} offset={4} className={styles.editorMessage}>
        <span aria-hidden="true">{error}</span>
      </Popover>
    </div>
  );
}
