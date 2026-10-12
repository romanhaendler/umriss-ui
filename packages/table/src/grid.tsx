/* Grid mode (ADR-0034): `<Table grid>` is one tab
   stop with an **Active cell** the arrows walk (`model/gridWalk.ts`), and a
   column that declares `edit` is edited in place.

   The Active cell is state, not DOM focus alone: it holds on to its
   line's key and its column's id, so it survives sorting, filtering and a
   virtual window that renders its row away. The cells are the table's own
   `<td>` and `<th>`; which one carries the tab stop is written onto the DOM
   after every render (`GridFocus`) rather than threaded through every cell a
   table renders - head, rows, group lines, details, footer.

   Inside a cell, its own controls - a checkbox, the row actions, a fold, a
   sort button, whatever a presentation renders - leave the tab order, and
   Enter or F2 reaches them (the APG grid's widget mode); Escape leaves.

   An edit is controlled (the schedule's intent pattern, ADR-0023): the
   editor holds a draft, Enter or Tab reports it through `onCellEdit`, and the
   table applies nothing - the value changes when the caller's rows do.

   ADR-0036: a click on a cell that edits opens its editor. `editMode="row"`
   opens every cell of the row that edits as one **Row draft**, reported only
   when it is saved; a new row is always one. An edit of one cell is a draft
   of one column - the same state, the same save. */

import { createContext, useContext, useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { DatePicker, FormField, Input, NumberInput, Popover, Select, VisuallyHidden, useFormats } from "@umriss-ui/core";
import type { Wording } from "@umriss-ui/core";
import type { ColumnEntry } from "./registry";
import { occurringValues } from "./columnFilter";
import { isAbsent } from "./values";
import { placeOf } from "./model/gridWalk";
import type { GridLine, GridPosition } from "./model/gridWalk";
import { NEW_LINE, useGridState } from "./gridState";
import type { Active, Editing, GridHandle, GridState } from "./gridState";
import { editingActions, same } from "./gridEditing";
import type { GridInput } from "./gridEditing";
import { FOCUSABLE, cellsOf, onBlur, onClick, onFocus, onKeyDown } from "./gridKeys";
import styles from "./Table.module.css";

export { NEW_LINE, useGridState };
export type { Editing, GridHandle, GridInput, GridState };

/** The frame's handlers for a table in grid mode. Not a hook: they close over
    this render's lines, and the frame calls them after its early return. */
export function gridHandlers(input: GridInput) {
  const { grid, rowKey, onRowDelete } = input;
  const actions = editingActions(input);
  const { save, discard, commit, setDraft, editable, addRow } = actions;

  const context: Omit<GridContextValue, "hook" | "wording"> = {
    editing: grid.state.editing,
    setDraft,
    commit,
    save: () => void save(),
    discard,
    remove: onRowDelete && ((row: unknown) => onRowDelete({ rowKey: rowKey(row), row })),
  };
  /* A click outside the grid ends an edit of one cell as a click on another
     cell does - reported where it validates, left open with its message where
     not; the focus stays where the click put it (ADR-0036). A Row draft stays
     open: it is saved on purpose, not by a click elsewhere on the page. */
  const editing = grid.state.editing;
  const outside = editing && !editing.row ? () => void save({}, false) : undefined;

  return {
    onKeyDown: (event: Parameters<typeof onKeyDown>[2]) => onKeyDown(input, actions, event),
    onClick: (event: Parameters<typeof onClick>[2]) => onClick(input, actions, event),
    onFocus: (event: Parameters<typeof onFocus>[2]) => onFocus(input, actions, event),
    onBlur: (event: Parameters<typeof onBlur>[1]) => onBlur(input, event),
    context,
    editable,
    addRow,
    outside,
  };
}

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

export const GridContext = /* @__PURE__ */ createContext<GridContextValue | null>(null);

/** The editor of a cell, when this cell is open - the one edited, or one of
    a Row draft's. */
export function useCellEditor(line: string, columnId: string): GridContextValue | null {
  const grid = useContext(GridContext);
  const editing = grid?.editing;
  return editing && editing.line === line && columnId in editing.drafts ? grid : null;
}

/* --- The DOM: which cell is the tab stop ------------------------------------------ */

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
  outside,
}: {
  table: RefObject<HTMLTableElement | null>;
  grid: GridHandle;
  lines: readonly GridLine[];
  ids: readonly string[];
  /** In a grid that edits: whether the cell at a position does. Every other
      cell of its body and foot is `aria-readonly`. */
  editable?: (p: GridPosition) => boolean;
  /** While a cell's edit is open: what a click outside the grid does. */
  outside?: () => void;
}) {
  /* A click outside the grid - not in it, and not in a panel one of its
     controls opened (a day's calendar names its panel by `aria-controls`). */
  const outsideRef = useRef(outside);
  useLayoutEffect(() => {
    outsideRef.current = outside;
  });
  const listening = outside !== undefined;
  useEffect(() => {
    const table = tableRef.current;
    if (!listening || !table) return;
    const onMouseDown = (event: MouseEvent) => {
      for (let node = event.target instanceof Element ? event.target : null; node; node = node.parentElement) {
        if (node === table || (node.id && table.querySelector(`[aria-controls="${CSS.escape(node.id)}"]`))) return;
      }
      outsideRef.current?.();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [listening, tableRef]);

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

/* --- The editor ------------------------------------------------------------------- */

/** The editor in a cell: the core field for its kind, or the column's own,
    inside a `FormField` whose error is the message of a draft that did not
    validate. Its name says what is edited, for which row.

    It lies over the cell at the cell's size, and the message hangs beneath
    it in a popover: nothing in the table shifts while a cell is edited.
    The field's description stays the `FormField`'s
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
      <Select size="sm" value={index < 0 ? "" : String(index)} onChange={(event) => setDraft(options[Number(event.target.value)])}>
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
