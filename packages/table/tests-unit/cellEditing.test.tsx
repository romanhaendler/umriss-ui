/* Editing in place (table-grid-mode 03): the edit lifecycle at the table's
   public interface - started by Enter, F2 or typing, committed by Enter or
   Tab, cancelled by Escape, held open by a message that does not validate,
   and reported, never applied. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { CellEdit } from "../src";

interface Loop {
  id: string;
  name: string;
  setpoint: number;
  mode: string;
  comment: string;
}

const LOOPS: Loop[] = [
  { id: "l1", name: "TIC-101", setpoint: 80, mode: "Auto", comment: "" },
  { id: "l2", name: "TIC-102", setpoint: 65, mode: "Manual", comment: "Valve sticks" },
];

function Loops({ onCellEdit }: { onCellEdit: (edit: CellEdit<Loop>) => void }) {
  const { Table, Column } = useTable(LOOPS, { rowKey: (l) => l.id });
  return (
    <Table grid onCellEdit={onCellEdit} ariaLabel="Loops">
      <Column value="name" label="Loop" rowHeader />
      <Column
        value="setpoint"
        label="Setpoint"
        edit="number"
        validate={(value) => (value === null ? "A setpoint is required" : value > 120 ? "At most 120 °C" : undefined)}
      />
      <Column value="mode" label="Mode" edit="select" editOptions={["Auto", "Manual", "Off"]} />
      <Column value="comment" label="Comment" edit="text" />
    </Table>
  );
}

const active = () => document.activeElement as HTMLElement;
const press = (key: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(active(), { key, ...init });
const focusCell = (text: string) => {
  const cell = screen.getByText(text);
  act(() => cell.focus());
  fireEvent.focus(cell);
};

describe("Editing a cell", () => {
  it("opens the column's core field with Enter, named after column and row, and marks the grid editable", () => {
    render(<Loops onCellEdit={() => undefined} />);
    expect(screen.getByRole("grid").getAttribute("aria-readonly")).toBeNull();
    focusCell("80");
    press("Enter");
    const field = screen.getByLabelText("Edit Setpoint: TIC-101") as HTMLInputElement;
    expect(document.activeElement).toBe(field);
    expect(field.value).toBe("80");
  });

  /* table-grid-mode 05: in a grid that edits, a cell that does not says so. */
  it("marks every cell that does not edit read-only, and none that does", () => {
    render(<Loops onCellEdit={() => undefined} />);
    const cell = (text: string) => screen.getByText(text).closest("td, th")!;
    expect(cell("TIC-101").getAttribute("aria-readonly")).toBe("true");
    expect(cell("80").getAttribute("aria-readonly")).toBeNull();
    expect(cell("Valve sticks").getAttribute("aria-readonly")).toBeNull();
    // The head names the columns; it is not a cell that could edit.
    expect(screen.getByRole("columnheader", { name: /Setpoint/ }).getAttribute("aria-readonly")).toBeNull();
  });

  it("does not start an edit with Space", () => {
    render(<Loops onCellEdit={() => undefined} />);
    focusCell("Valve sticks");
    press(" ");
    expect(screen.queryByLabelText("Edit Comment: TIC-102")).toBeNull();
  });

  it("reports the draft on Enter, applies nothing, and gives the focus back to the cell", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("F2");
    fireEvent.change(active(), { target: { value: "95" } });
    press("Enter");
    expect(onCellEdit).toHaveBeenCalledWith({ rowKey: "l1", columnId: "setpoint", value: 95, row: LOOPS[0] });
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
    /* The table applies nothing: the rows did not change, so neither did the cell. */
    expect(active().textContent).toBe("80");
  });

  it("drops the draft on Escape and reports nothing", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("Enter");
    fireEvent.change(active(), { target: { value: "95" } });
    press("Escape");
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(active().textContent).toBe("80");
  });

  it("reports nothing where the draft is the value it was", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("Enter");
    press("Enter");
    expect(onCellEdit).not.toHaveBeenCalled();
  });

  it("starts with what was typed", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("Valve sticks");
    press("x");
    expect((screen.getByLabelText("Edit Comment: TIC-102") as HTMLInputElement).value).toBe("x");
    focusCell("80");
    press("7");
    expect((screen.getByLabelText("Edit Setpoint: TIC-101") as HTMLInputElement).value).toBe("7");
  });

  it("keeps a draft that does not validate open, with the message beneath, until it does", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("Enter");
    fireEvent.change(active(), { target: { value: "150" } });
    press("Enter");
    expect(onCellEdit).not.toHaveBeenCalled();
    const field = screen.getByLabelText("Edit Setpoint: TIC-101");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(field.getAttribute("aria-describedby")!)?.textContent).toBe("At most 120 °C");
    /* Seen beneath the cell in a popover, not inside the table: nothing in
       it shifts (table-grid-mode 05). */
    const shown = screen.getAllByText("At most 120 °C").filter((m) => !m.closest("table"));
    expect(shown).toHaveLength(1);
    /* Corrected, the message goes as the draft becomes right. */
    fireEvent.change(field, { target: { value: "110" } });
    expect(screen.queryByText("At most 120 °C")).toBeNull();
    press("Enter");
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ columnId: "setpoint", value: 110 }));
  });

  it("commits on Tab and moves on to the next cell that edits, across rows", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("Valve sticks");
    press("Enter");
    fireEvent.change(active(), { target: { value: "Valve replaced" } });
    press("Tab", { shiftKey: true });
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "l2", columnId: "comment", value: "Valve replaced" }));
    expect(document.activeElement).toBe(screen.getByLabelText("Edit Mode: TIC-102"));
    press("Tab", { shiftKey: true });
    expect(document.activeElement).toBe(screen.getByLabelText("Edit Setpoint: TIC-102"));
    press("Tab", { shiftKey: true });
    expect(document.activeElement).toBe(screen.getByLabelText("Edit Comment: TIC-101"));
  });

  it("offers the options of a select and reports the one chosen", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("Auto");
    press("Enter");
    const select = screen.getByLabelText("Edit Mode: TIC-101") as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(["Auto", "Manual", "Off"]);
    fireEvent.change(select, { target: { value: "2" } });
    press("Enter");
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ columnId: "mode", value: "Off" }));
  });

  it("does not edit a column without `edit`", () => {
    render(<Loops onCellEdit={() => undefined} />);
    focusCell("TIC-101");
    press("Enter");
    press("x");
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("ends an edit the focus left for another cell - reported where it validates", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("Enter");
    fireEvent.change(active(), { target: { value: "90" } });
    focusCell("TIC-102");
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ value: 90 }));
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
  });

  it("keeps a draft that does not validate when the focus leaves for another cell, and takes the focus back to it", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("80");
    press("Enter");
    fireEvent.change(active(), { target: { value: "150" } });
    focusCell("TIC-102");
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByLabelText("Edit Setpoint: TIC-101"));
    expect(screen.getAllByText("At most 120 °C").length).toBeGreaterThan(0);
  });

  it("lets Tab leave the grid past the last cell that edits, once the draft is reported", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    focusCell("Valve sticks");
    press("Enter");
    fireEvent.change(active(), { target: { value: "Valve replaced" } });
    const tab = fireEvent.keyDown(active(), { key: "Tab" });
    /* Not prevented: the browser moves the focus on, out of the table. */
    expect(tab).toBe(true);
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ value: "Valve replaced" }));
  });

  it("opens a select by typing, on the value as it stands", () => {
    render(<Loops onCellEdit={() => undefined} />);
    focusCell("Manual");
    press("m");
    expect((screen.getByLabelText("Edit Mode: TIC-102") as HTMLSelectElement).value).toBe("1");
  });
});

describe("An editor of one's own", () => {
  interface Note {
    id: string;
    text: string;
  }

  function Notes({ onCellEdit }: { onCellEdit: (edit: CellEdit<Note>) => void }) {
    const { Table, Column } = useTable([{ id: "n1", text: "hello" }], { rowKey: (n) => n.id });
    return (
      <Table grid onCellEdit={onCellEdit}>
        <Column
          value="text"
          label="Note"
          edit={({ value, onChange, label, invalid }) => (
            <textarea aria-label={label} aria-invalid={invalid} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          )}
        />
      </Table>
    );
  }

  it("receives the draft and its name, and commits through the table's keys", () => {
    const onCellEdit = vi.fn();
    render(<Notes onCellEdit={onCellEdit} />);
    focusCell("hello");
    press("Enter");
    const area = screen.getByLabelText("Edit Note: n1") as HTMLTextAreaElement;
    expect(document.activeElement).toBe(area);
    fireEvent.change(area, { target: { value: "hello there" } });
    press("Enter");
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ columnId: "text", value: "hello there" }));
  });
});
