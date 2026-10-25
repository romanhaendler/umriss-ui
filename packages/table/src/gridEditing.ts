/* The grid's edit paths: opening a cell or a new row, the draft, and the save
   that validates and reports. Each takes what the frame's grid wiring
   (`GridInput`) holds, as of one render. */

import type { VirtualRows } from "@umriss-ui/core";
import type { ColumnEntry } from "./registry";
import { isAbsent } from "./values";
import { rowLine } from "./model/gridWalk";
import type { GridLine, GridPosition } from "./model/gridWalk";
import type { CellEdit, RowAdd, RowDelete, RowSave } from "./types";
import { NEW_LINE } from "./gridState";
import type { GridHandle } from "./gridState";

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
  /** Reports the row as the current one - in a table with `onCurrentRowChange`;
      Enter asks for it on a cell with nothing to edit or enter. */
  report: ((row: unknown) => void) | undefined;
}

/** Does this column edit? */
const edits = (entry: ColumnEntry | undefined): entry is ColumnEntry => entry?.spec.edit !== undefined;

/** Two values the same for an edit: a point in time by its time, an absent
    value and an emptied text alike. */
export function same(a: unknown, b: unknown): boolean {
  const plain = (v: unknown) => (isAbsent(v) || v === "" ? null : v instanceof Date ? v.getTime() : v);
  return Object.is(plain(a), plain(b));
}

export type EditingActions = ReturnType<typeof editingActions>;

export function editingActions(input: GridInput) {
  const { grid, lines, ids, columnById, rowKey, onCellEdit, rowMode, onRowSave, onRowAdd, newRow } = input;
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
      True when the edit is over. `focus` false leaves the focus where it is. */
  const save = (patch: Readonly<Record<string, unknown>> = {}, focus = true): boolean => {
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
      if (focus) grid.focus.want("editor");
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
    if (focus) grid.focus.want("cell");
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

  return { rowAt, editable, startEdit, save, commit, discard, refuse, setDraft, addRow };
}
