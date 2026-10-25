/* The current row (ADR-0071): the application's key, marked on its row, and
   the one click handler that reports a choice. */

import { createContext } from "react";
import type { MouseEvent } from "react";
import { FOCUSABLE } from "./gridKeys";

/** What a row reads: the key to mark, and how a choice of a row is reported -
    absent when the table does not report. */
export const CurrentRowContext = /* @__PURE__ */ createContext<{
  key: string | null | undefined;
  report: ((row: unknown) => void) | undefined;
}>({ key: undefined, report: undefined });

/** The row object of each body row's element, set while the table reports.
    A group header, a detail, the footer and a new-row draft are never in it. */
export const rowOfElement = /* @__PURE__ */ new WeakMap<Element, unknown>();

/** A primary click on a body row, outside the controls of the row. */
export function chooseRow(
  event: MouseEvent<HTMLTableElement>,
  rowKey: (row: unknown) => string,
  report: (key: string, row: unknown) => void,
) {
  const target = event.target;
  if (event.button !== 0 || !(target instanceof Element)) return;
  const tr = target.closest("tr");
  if (!tr || !event.currentTarget.contains(tr) || !rowOfElement.has(tr)) return;
  /* A cell is a focusable stop in grid mode, a virtual row is one anywhere:
     neither is a control. A label is the box of a checkbox. */
  const control = target.closest(`${FOCUSABLE}, label`);
  if (control && control !== tr && control.tagName !== "TD" && control.tagName !== "TH" && tr.contains(control)) return;
  const row = rowOfElement.get(tr);
  report(rowKey(row), row);
}
