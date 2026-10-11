/* Ctrl or Cmd with C in the table: the key handler that copies the edited
   field, the selected rows or the Active cell, and the flash that marks them. */

import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { announce } from "@umriss-ui/core";
import type { Formats, Wording } from "@umriss-ui/core";
import { warnOnce } from "./dev";
import { cellText, selectedInOrder, selectionText, valueText } from "./export";
import type { ColumnEntry, HookSnapshot, Registry } from "./registry";
import { rowLine } from "./model/gridWalk";
import type { GridLine } from "./model/gridWalk";
import type { GridHandle } from "./grid";

/** What a copy marks for a moment: `data-copied` runs the stylesheet's flash and
    comes off at `animationend`. Set by hand, not by state - a flash re-renders
    no row. Set again, it starts over; the reflow between lets it. */
function flash(cells: readonly Element[]) {
  for (const cell of cells) cell.removeAttribute("data-copied");
  void document.body.offsetWidth;
  for (const cell of cells) cell.setAttribute("data-copied", "");
}

/* Ctrl or Cmd with C: the selected rows, or - in a grid with
   no selection - the Active cell. Heard here by bubbling from rows, cells and
   headers; the grid's own handler lets the key pass. The browser keeps the
   key only where the reader can have marked text of their own: a text-like
   input, a textarea, a contenteditable - and the page's own selection. A
   checkbox, a radio, a button, a switch or a select holds no text to mark, and
   a click leaves the focus on it, so on those the copy runs. */
export function copyKeyHandler({
  registry,
  hook,
  grid,
  gridMode,
  gridLines,
  dataColumns,
  formats,
  wording,
  tableElement,
}: {
  registry: Registry;
  hook: HookSnapshot;
  grid: GridHandle;
  gridMode: boolean;
  /** Every line the arrows walk. */
  gridLines: readonly GridLine[];
  dataColumns: readonly ColumnEntry[];
  formats: Formats;
  wording: Wording;
  /** The table, read when a copy happens. */
  tableElement: () => HTMLTableElement | null;
}) {
  return (event: ReactKeyboardEvent<HTMLDivElement>) => {
    /* What is said goes through core's one voice, from the table, so that
       inside a modal dialog it is the dialog's region that speaks. The same
       words again are heard again: the voice writes a new node every time. */
    const say = (words: string) => announce(words, tableElement());
    if (event.defaultPrevented || event.altKey || event.shiftKey || event.ctrlKey === event.metaKey) return;
    if (event.key.toLowerCase() !== "c") return;
    const { target, currentTarget } = event;
    if (!(target instanceof Element)) return;
    /* A field of an open editor is the exception: with nothing marked in it the
       key copies what stands in it. A number is typed text, so it has a mark like
       any other; a select or an own editor has none, its draft is the value. */
    const cell = target.closest<HTMLElement>("td, th");
    const editedId = cell?.dataset.editing;
    const field = target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
    const holdsText = field?.matches("textarea, [contenteditable]:not([contenteditable='false']), input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], [type=range], [type=color], [type=file], [type=image])");
    if (holdsText && editedId === undefined) return;
    if (window.getSelection()?.toString()) return;
    if ((field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) && field.selectionStart !== field.selectionEnd) return;
    let text = "";
    let words = "";
    let marked: Element[] = cell ? [cell] : [];
    const chosen = selectedInOrder(registry);
    const edited = editedId === undefined ? undefined : dataColumns.find((e) => e.spec.id === editedId);
    if (edited) {
      text = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement ? field.value : valueText(edited, grid.state.editing?.drafts[edited.spec.id], formats, wording);
      words = wording.copiedCell;
    } else if (chosen.length > 0) {
      text = selectionText(registry, formats, wording);
      words = wording.copiedRows(chosen.length, formats.count(chosen.length));
      const keys = new Set(chosen.map((row) => hook.rowKey(row)));
      marked = Array.from(currentTarget.querySelectorAll<HTMLElement>("tr[data-motion]"))
        .filter((tr) => keys.has(tr.dataset.motion!))
        .flatMap((tr) => Array.from(tr.children));
    } else if (gridMode && grid.state.active) {
      const { line: key, column } = grid.state.active;
      const line = gridLines.find((l) => l.key === key);
      const entry = dataColumns.find((e) => e.spec.id === column);
      if (!line || line.row === undefined || line.key !== rowLine(hook.rowKey(line.row)) || !entry) return;
      /* The focus may stand on a control in another cell of the row. */
      const home = Array.from(currentTarget.querySelectorAll<HTMLElement>("tr[data-grid-line]")).find((tr) => tr.dataset.gridLine === key)?.children[grid.state.active.columnIndex];
      if (home) marked = [home];
      text = cellText(entry, line.row, formats, wording);
      words = wording.copiedCell;
    } else return;
    event.preventDefault();
    const failed = (reason: unknown) => {
      warnOnce("copy-failed", `The clipboard refused the copy (${String(reason)}). It needs a secure context and a focused document.`);
      say(wording.copyFailed);
    };
    Promise.resolve()
      .then(() => navigator.clipboard.writeText(text))
      .then(() => {
        flash(marked);
        say(words);
      }, failed);
  };
}
