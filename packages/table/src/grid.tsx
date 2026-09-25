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
   table applies nothing - the value changes when the caller's rows do. */

import { createContext, useContext, useLayoutEffect, useState } from "react";
import type { FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject } from "react";
import { DatePicker, FormField, Input, NumberInput, Select, VisuallyHidden, useFormats } from "@umriss-ui/core";
import type { VirtualRows, Wording } from "@umriss-ui/core";
import type { ColumnEntry } from "./registry";
import { occurringValues } from "./columnFilter";
import { isAbsent } from "./values";
import { nextCell, placeOf, rowLine, stepGrid } from "./model/gridWalk";
import type { GridLine, GridMove, GridPosition } from "./model/gridWalk";
import type { CellEdit } from "./types";

/* --- State ------------------------------------------------------------------------ */

/** Where the Active cell stands: the keys it holds on to, and the indices it
    stood at - where a key is gone, the cell now at that index takes over. */
interface Active {
  line: string;
  column: string;
  lineIndex: number;
  columnIndex: number;
}

/** An edit in progress: the cell, the editor's draft, and the message of a
    draft that did not validate. */
export interface Editing {
  line: string;
  column: string;
  draft: unknown;
  error: string | null;
}

export interface GridState {
  active: Active | null;
  /** The Active cell's own controls are in the tab order: Enter or F2 went in. */
  widget: boolean;
  editing: Editing | null;
}

/** What a key wants focused once the cell it names is rendered - the Active
    cell, or the editor in it. A virtual window renders a row a moment after
    the key that walked to it; the DOM effect grants the wish then. */
class FocusWish {
  private wish: "cell" | "editor" | null = null;

  want(wish: "cell" | "editor" | null) {
    /* The editor outranks the cell: Tab commits one edit and opens the next. */
    if (this.wish !== "editor" || wish === null) this.wish = wish;
  }

  /** The wish, once - where the cell stands; otherwise it waits. */
  take(standing: boolean): "cell" | "editor" | null {
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
  setDraft: (draft: unknown) => void;
  commit: (value: unknown) => void;
  hook: { rows: readonly unknown[]; admitted: readonly unknown[] };
  wording: Wording;
}

export const GridContext = createContext<GridContextValue | null>(null);

/** The editor of a cell, when this cell is the one being edited. */
export function useCellEditor(rowKey: string, columnId: string): GridContextValue | null {
  const grid = useContext(GridContext);
  const editing = grid?.editing;
  return editing && editing.line === rowLine(rowKey) && editing.column === columnId ? grid : null;
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
export function GridFocus({ table: tableRef, grid, lines, ids }: { table: RefObject<HTMLTableElement | null>; grid: GridHandle; lines: readonly GridLine[]; ids: readonly string[] }) {
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const { active, widget, editing } = grid.state;
    const at = resolve(active, lines, ids);
    const key = lines[at.line]?.key;
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
        const open = cell === stop && (widget || (editing !== null && editing.line === line));
        for (const element of Array.from(cell.querySelectorAll<HTMLElement>(FOCUSABLE))) quiet(element, !open);
      }
    }
    /* The Active cell's line not rendered - a virtual window scrolled away
       from it: the tab stop stands in the window, in the same column, and
       whoever tabs in starts there. */
    const target = stop ?? fallback ?? table.querySelector<HTMLTableCellElement>("tr[data-grid-line] > *");
    if (target) target.tabIndex = 0;
    const wish = grid.focus.take(stop !== null);
    if (wish === "editor") {
      const field = (stop as HTMLTableCellElement | null)?.querySelector<HTMLElement>("input, select, textarea, button");
      field?.focus();
      if (field instanceof HTMLInputElement && field.type === "text") field.setSelectionRange(field.value.length, field.value.length);
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
  const { grid, lines, ids, columnById, rowKey, virtual, onCellEdit } = input;
  const { setState } = grid;
  const keys = lines.map((l) => l.key);

  const lineRow = (key: string) => lines.find((l) => l.key === key)?.row;
  const editable = (p: GridPosition) => {
    const line = lines[p.line];
    return line?.row !== undefined && line.key === rowLine(rowKey(line.row)) && edits(columnById(ids[p.column] ?? ""));
  };

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
    if (cell) cell.focus();
    else {
      grid.focus.want("cell");
      if (virtual && line.at >= 0) virtual.showRow(line.at);
    }
  };

  const startEdit = (p: GridPosition, initial?: unknown) => {
    const line = lines[p.line]!;
    const entry = columnById(ids[p.column] ?? "")!;
    grid.focus.want("editor");
    setState((s) => ({
      ...s,
      active: { line: line.key, column: entry.spec.id, lineIndex: p.line, columnIndex: p.column },
      editing: { line: line.key, column: entry.spec.id, draft: initial === undefined ? entry.read(line.row) : initial, error: null },
    }));
  };

  /** Reports the draft - unless it does not validate, in which case the
      editor stays open with the message. True when the edit is over. */
  const commit = (value: unknown): boolean => {
    const editing = grid.state.editing;
    if (!editing) return true;
    const entry = columnById(editing.column);
    const row = lineRow(editing.line);
    if (!entry || row === undefined) {
      setState((s) => ({ ...s, editing: null }));
      return true;
    }
    const message = entry.spec.validate?.(value as never, row as never);
    if (message) {
      setState((s) => ({ ...s, editing: s.editing && { ...s.editing, draft: value, error: message } }));
      return false;
    }
    if (!same(value, entry.read(row))) onCellEdit?.({ rowKey: rowKey(row), columnId: entry.spec.id, value, row });
    grid.focus.want("cell");
    setState((s) => ({ ...s, editing: null }));
    return true;
  };

  const cancel = () => {
    grid.focus.want("cell");
    setState((s) => ({ ...s, editing: null }));
  };

  const setDraft = (draft: unknown) =>
    setState((s) => {
      if (!s.editing) return s;
      /* A message stays until the draft is right: checked again as it is
         corrected, never before the first attempt to commit. */
      const entry = columnById(s.editing.column);
      const error = s.editing.error === null ? null : (entry?.spec.validate?.(draft as never, lineRow(s.editing.line) as never) ?? null);
      return { ...s, editing: { ...s.editing, draft, error } };
    });

  /* The handlers stand on the <table>: the element they are heard on is the grid. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLTableElement>) => {
    const table = event.currentTarget;
    if (event.defaultPrevented) return;
    const place = placeOfCell(table, event.target);
    if (!place) return;
    const here: GridPosition = { line: keys.indexOf(place.line), column: goalIn(place) };
    if (here.line < 0) return;
    const editing = grid.state.editing;

    /* In the editor: Enter commits, Escape cancels, Tab commits and moves on
       to the next cell that edits. A button in an editor - the date picker's
       trigger - keeps its Enter. */
    if (editing && editing.line === place.line && editing.column === ids[place.column]) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      } else if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        commit(editing.draft);
      } else if (event.key === "Tab") {
        const next = nextCell(lines, here, event.shiftKey, editable);
        /* Past the last cell that edits, Tab leaves the grid as it would
           anywhere else - once the draft is reported. */
        const done = commit(editing.draft);
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
       stands - a select or a day has no first letter to take. Space is no
       typing there: it would open an editor on the way down the page. */
    if (event.key.length === 1 && editable(here)) {
      const kind = columnById(ids[place.column] ?? "")?.spec.edit;
      if (kind !== "text" && event.key === " ") return;
      event.preventDefault();
      startEdit(here, kind === "text" ? event.key : kind === "number" && /\d/.test(event.key) ? Number(event.key) : undefined);
    }
  };

  /* A focus in the grid - by key, by click, by Tab - makes its cell the
     Active one; a focus inside a cell is among its controls. An edit the
     focus left for another cell ends where it validates and is reported; one
     that does not keeps the editor, and the focus goes back to it with its
     message - a draft is never dropped without a word. */
  const onFocus = (event: ReactFocusEvent<HTMLTableElement>) => {
    const place = placeOfCell(event.currentTarget, event.target);
    if (!place) return;
    const line = keys.indexOf(place.line);
    const editing = grid.state.editing;
    if (editing && (editing.line !== place.line || editing.column !== ids[place.column]) && !commit(editing.draft)) {
      grid.focus.want("editor");
      return;
    }
    grid.focus.want(null);
    /* From the state as the key just left it: a key moves the Active cell
       and focuses it in one event, and the focus must not undo the goal. */
    setState((s) => {
      const column = goalIn(place, s.active);
      return {
        ...s,
        widget: (event.target as Element) !== place.cell,
        active: { line: place.line, column: ids[column] ?? "", lineIndex: Math.max(0, line), columnIndex: column },
      };
    });
  };

  /* Leaving the grid leaves the cell's controls as well: tabbing back in
     lands on the cell. An edit stays open - a date picker's panel lies
     outside, in a portal. */
  const onBlur = (event: ReactFocusEvent<HTMLTableElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setState((s) => (s.widget ? { ...s, widget: false } : s));
  };

  const context: Omit<GridContextValue, "hook" | "wording"> = { editing: grid.state.editing, setDraft, commit };
  return { onKeyDown, onFocus, onBlur, context };
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
    validate (G4, G5). Its name says what is edited, for which row. */
export function CellEditor({ entry, row, rowName, grid }: { entry: ColumnEntry; row: unknown; rowName: string; grid: GridContextValue }) {
  const formats = useFormats();
  const { spec } = entry;
  const editing = grid.editing!;
  const draft = editing.draft;
  const label = grid.wording.editCell(spec.label, rowName);
  let field: ReactNode;
  if (typeof spec.edit === "function") {
    field = (spec.edit as (editor: unknown) => ReactNode)({
      value: draft,
      onChange: grid.setDraft,
      commit: (value?: unknown) => grid.commit(value === undefined ? draft : value),
      row,
      invalid: editing.error !== null,
      label,
    });
  } else if (spec.edit === "number") {
    field = <NumberInput size="sm" value={typeof draft === "number" ? draft : null} onChange={grid.setDraft} />;
  } else if (spec.edit === "date") {
    /* A day picked is a decision: it commits, as Enter does in a text. */
    field = <DatePicker size="sm" value={draft instanceof Date ? draft : null} onChange={(date) => grid.commit(date)} />;
  } else if (spec.edit === "select") {
    const options = spec.editOptions ?? occurringValues(grid.hook.admitted, entry.read, formats).values;
    const index = options.findIndex((o) => same(o, draft));
    field = (
      <Select selectSize="sm" value={index < 0 ? "" : String(index)} onChange={(event) => grid.setDraft(options[Number(event.target.value)])}>
        {index < 0 && <option value="" />}
        {options.map((option, i) => (
          <option key={i} value={i}>
            {option instanceof Date ? formats.date(option) : String(option)}
          </option>
        ))}
      </Select>
    );
  } else {
    field = <Input size="sm" value={isAbsent(draft) ? "" : String(draft)} onChange={(event) => grid.setDraft(event.target.value)} />;
  }
  return (
    <FormField label={<VisuallyHidden>{label}</VisuallyHidden>} error={editing.error ?? undefined}>
      {field}
    </FormField>
  );
}
