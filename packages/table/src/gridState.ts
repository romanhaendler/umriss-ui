/* What the grid keeps between renders: the Active cell, the edit in progress
   and the focus a key wished (ADR-0034, ADR-0036). */

import { useState } from "react";

/** Where the Active cell stands: the keys it holds on to, and the indices it
    stood at - where a key is gone, the cell now at that index takes over. */
export interface Active {
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
