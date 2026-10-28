/* The undo recipe of the Edits page (table-undo-recipe): the demo's example
   keeps the history of `onCellEdit` in the application, and Ctrl+Z and
   Ctrl+Shift+Z write the replaced and the new value back. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UndoAndRedo from "../demo/examples/Edits/07-undo-and-redo";

const active = () => document.activeElement as HTMLElement;
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(active(), { key, ...init });
const focusCell = (text: string) => {
  const cell = screen.getByText(text).closest<HTMLElement>("td, th")!;
  act(() => cell.focus());
  fireEvent.focus(cell);
};
const edit = (from: string, to: string) => {
  focusCell(from);
  press("Enter");
  fireEvent.change(active(), { target: { value: to } });
  press("Enter");
};

describe("Undo and redo over the reported edits", () => {
  it("restores the value an edit replaced on Ctrl+Z, and writes it again on Ctrl+Shift+Z", () => {
    render(<UndoAndRedo />);
    edit("14", "20");
    expect(screen.getByText("20")).toBeTruthy();

    press("z", { ctrlKey: true });
    expect(screen.queryByText("20")).toBeNull();
    expect(screen.getByText("14")).toBeTruthy();

    press("Z", { ctrlKey: true, shiftKey: true });
    expect(screen.getByText("20")).toBeTruthy();
    expect(screen.queryByText("14")).toBeNull();
  });

  it("undoes the edits in reverse order, and a new edit drops what was undone", () => {
    render(<UndoAndRedo />);
    edit("14", "20");
    edit("20", "21");
    press("z", { ctrlKey: true });
    press("z", { ctrlKey: true });
    expect(screen.getByText("14")).toBeTruthy();

    edit("14", "9");
    press("Z", { ctrlKey: true, shiftKey: true });
    expect(screen.getByText("9")).toBeTruthy();
  });

  it("leaves Ctrl+Z to the text field while an editor is open", () => {
    render(<UndoAndRedo />);
    edit("14", "20");
    focusCell("20");
    press("Enter");
    press("z", { ctrlKey: true });
    expect((screen.getByLabelText("Edit Hours: Draft the layout") as HTMLInputElement).value).toBe("20");
  });
});
