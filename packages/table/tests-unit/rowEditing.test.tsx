/* ADR-0036 at the table's public interface: a click opens a cell's editor,
   the pointer says a cell edits, `editMode="row"` edits a row as one Row
   draft saved on purpose, and a grid adds and deletes rows by its own
   buttons - all reported, none applied. */

import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { CellEdit, RowAdd, RowDelete, RowSave } from "../src";

interface Loop {
  id: string;
  name: string;
  setpoint: number | null;
  mode: string;
  comment: string;
}

const LOOPS: Loop[] = [
  { id: "l1", name: "TIC-101", setpoint: 80, mode: "Auto", comment: "" },
  { id: "l2", name: "TIC-102", setpoint: 65, mode: "Manual", comment: "Valve sticks" },
];

interface Props {
  rows?: Loop[];
  editMode?: "cell" | "row";
  onCellEdit?: (edit: CellEdit<Loop>) => void;
  onRowSave?: (save: RowSave<Loop>) => void;
  onRowAdd?: (add: RowAdd) => void;
  onRowDelete?: (remove: RowDelete<Loop>) => void;
}

function Loops({ rows = LOOPS, ...props }: Props) {
  const { Table, Column } = useTable(rows, { rowKey: (l) => l.id });
  return (
    <Table grid ariaLabel="Loops" newRow={() => ({ mode: "Auto" })} {...props}>
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
const press = (key: string) => fireEvent.keyDown(active(), { key });
const cellOf = (text: string) => screen.getByText(text).closest("td, th") as HTMLElement;
/** A click as a pointer makes it: the focus first, then the click. */
const click = (element: HTMLElement) => {
  act(() => element.focus());
  fireEvent.click(element);
};
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
/** The delete question in the body - its width stands reserved, unseen, in the head. */
const asked = () => screen.queryAllByText("Delete?").filter((e) => !e.closest("thead"));

describe("A click on a cell that edits", () => {
  it("opens its editor at once", () => {
    render(<Loops onCellEdit={() => undefined} />);
    click(cellOf("80"));
    expect(document.activeElement).toBe(field("Edit Setpoint: TIC-101"));
  });

  it("opens a select focused, on the value as it stands", () => {
    render(<Loops onCellEdit={() => undefined} />);
    click(cellOf("Manual"));
    const select = screen.getByLabelText("Edit Mode: TIC-102") as HTMLSelectElement;
    expect(document.activeElement).toBe(select);
    expect(select.value).toBe("1");
  });

  it("opens nothing on a cell that does not edit", () => {
    render(<Loops onCellEdit={() => undefined} />);
    click(cellOf("TIC-101"));
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("ends the edit open elsewhere first, and opens nothing where that edit does not validate", () => {
    const onCellEdit = vi.fn();
    render(<Loops onCellEdit={onCellEdit} />);
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "150" } });
    click(cellOf("Valve sticks"));
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Edit Comment: TIC-102")).toBeNull();
    expect(document.activeElement).toBe(field("Edit Setpoint: TIC-101"));
  });

  it("is marked for the pointer: typed or picked, and nothing on a cell that does not edit", () => {
    render(<Loops onCellEdit={() => undefined} />);
    expect(cellOf("80").dataset.edit).toBe("type");
    expect(cellOf("Auto").dataset.edit).toBe("pick");
    expect(cellOf("TIC-101").dataset.edit).toBeUndefined();
  });
});

describe("A click outside the grid", () => {
  it("ends a cell's edit as a click on another cell does, and leaves the focus where it went", () => {
    const onCellEdit = vi.fn();
    render(
      <>
        <button>elsewhere</button>
        <Loops onCellEdit={onCellEdit} />
      </>,
    );
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "95" } });
    const elsewhere = screen.getByText("elsewhere");
    fireEvent.mouseDown(elsewhere);
    act(() => elsewhere.focus());
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "l1", columnId: "setpoint", value: 95 }));
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
    expect(document.activeElement).toBe(elsewhere);
  });

  it("keeps a draft that does not validate open with its message, without taking the focus back", () => {
    const onCellEdit = vi.fn();
    render(
      <>
        <button>elsewhere</button>
        <Loops onCellEdit={onCellEdit} />
      </>,
    );
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "150" } });
    const elsewhere = screen.getByText("elsewhere");
    fireEvent.mouseDown(elsewhere);
    act(() => elsewhere.focus());
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(field("Edit Setpoint: TIC-101").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(elsewhere);
  });

  it("leaves a Row draft open, without a word", () => {
    const onRowSave = vi.fn();
    render(
      <>
        <button>elsewhere</button>
        <Loops editMode="row" onRowSave={onRowSave} />
      </>,
    );
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "95" } });
    fireEvent.mouseDown(screen.getByText("elsewhere"));
    expect(onRowSave).not.toHaveBeenCalled();
    expect(field("Edit Setpoint: TIC-101").value).toBe("95");
    expect(screen.queryByText("Save or discard this row first")).toBeNull();
  });
});

describe("A Row draft (editMode=\"row\")", () => {
  it("opens every cell of the row that edits, the one clicked focused", () => {
    render(<Loops editMode="row" onRowSave={() => undefined} />);
    click(cellOf("Manual"));
    expect(document.activeElement).toBe(screen.getByLabelText("Edit Mode: TIC-102"));
    expect(field("Edit Setpoint: TIC-102").value).toBe("65");
    expect(field("Edit Comment: TIC-102").value).toBe("Valve sticks");
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
  });

  it("reports nothing until it is saved, then only the columns it changed", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "95" } });
    fireEvent.change(field("Edit Comment: TIC-101"), { target: { value: "Retuned" } });
    expect(onRowSave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Save: TIC-101" }));
    expect(onRowSave).toHaveBeenCalledWith({ rowKey: "l1", changes: { setpoint: 95, comment: "Retuned" }, row: LOOPS[0] });
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
  });

  it("saves on Enter and discards on Escape", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "90" } });
    press("Escape");
    expect(onRowSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "90" } });
    press("Enter");
    expect(onRowSave).toHaveBeenCalledWith(expect.objectContaining({ changes: { setpoint: 90 } }));
  });

  it("closes unchanged without a report", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("80"));
    press("Enter");
    expect(onRowSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
  });

  it("drops its changes on Discard", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "Discard: TIC-101" }));
    expect(onRowSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Edit Setpoint: TIC-101")).toBeNull();
    expect(cellOf("80")).toBeTruthy();
  });

  it("is not left for another row: the focus goes back, and it asks to be saved or discarded first", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("80"));
    fireEvent.change(active(), { target: { value: "90" } });
    click(cellOf("Valve sticks"));
    expect(onRowSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText("Edit Comment: TIC-102")).toBeNull();
    expect(document.activeElement).toBe(field("Edit Setpoint: TIC-101"));
    expect(field("Edit Setpoint: TIC-101").value).toBe("90");
    expect(screen.getByText("Save or discard this row first")).toBeTruthy();
  });

  it("checks every cell on Save, shows every message, and keeps the draft open in the first", () => {
    const onRowSave = vi.fn();
    render(<Loops editMode="row" onRowSave={onRowSave} />);
    click(cellOf("Valve sticks"));
    fireEvent.change(field("Edit Setpoint: TIC-102"), { target: { value: "150" } });
    press("Enter");
    expect(onRowSave).not.toHaveBeenCalled();
    expect(field("Edit Setpoint: TIC-102").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field("Edit Setpoint: TIC-102"));
    fireEvent.change(field("Edit Setpoint: TIC-102"), { target: { value: "110" } });
    press("Enter");
    expect(onRowSave).toHaveBeenCalledWith(expect.objectContaining({ rowKey: "l2", changes: { setpoint: 110 } }));
  });

  it("goes with its row when the row leaves the rows", () => {
    function Shrinking() {
      const [rows, setRows] = useState(LOOPS);
      return (
        <>
          <button onClick={() => setRows(rows.slice(1))}>drop</button>
          <Loops rows={rows} editMode="row" onRowSave={() => undefined} />
        </>
      );
    }
    render(<Shrinking />);
    click(cellOf("80"));
    fireEvent.click(screen.getByText("drop"));
    expect(screen.queryByLabelText(/^Edit /)).toBeNull();
    click(cellOf("Valve sticks"));
    expect(document.activeElement).toBe(field("Edit Comment: TIC-102"));
  });
});

describe("A new row", () => {
  it("opens as an empty Row draft above the rows, from the button beneath a table without a toolbar", () => {
    render(<Loops onRowAdd={() => undefined} onCellEdit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    const setpoint = field("Edit Setpoint: New row");
    expect(document.activeElement).toBe(setpoint);
    expect(setpoint.value).toBe("");
    /* `newRow` gives what the columns start with. */
    expect((screen.getByLabelText("Edit Mode: New row") as HTMLSelectElement).value).toBe("0");
    const rows = screen.getAllByRole("row");
    expect(rows[1]!.contains(setpoint)).toBe(true);
  });

  it("is reported whole once every cell validates, and appears when the rows carry it", () => {
    const onRowAdd = vi.fn();
    render(<Loops onRowAdd={onRowAdd} />);
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    press("Enter");
    expect(onRowAdd).not.toHaveBeenCalled();
    expect(field("Edit Setpoint: New row").getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(field("Edit Setpoint: New row"), { target: { value: "70" } });
    fireEvent.change(field("Edit Comment: New row"), { target: { value: "Spare" } });
    fireEvent.click(screen.getByRole("button", { name: "Save: New row" }));
    expect(onRowAdd).toHaveBeenCalledWith({ values: { setpoint: 70, mode: "Auto", comment: "Spare" } });
    expect(screen.queryByLabelText(/New row$/)).toBeNull();
  });

  it("leaves no trace when discarded", () => {
    const onRowAdd = vi.fn();
    render(<Loops onRowAdd={onRowAdd} />);
    const before = screen.getAllByRole("row").length;
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    press("Escape");
    expect(onRowAdd).not.toHaveBeenCalled();
    expect(screen.getAllByRole("row")).toHaveLength(before);
  });

  it("is refused while a Row draft is open", () => {
    render(<Loops editMode="row" onRowSave={() => undefined} onRowAdd={() => undefined} />);
    click(cellOf("80"));
    fireEvent.click(screen.getByRole("button", { name: "New row" }));
    expect(screen.queryByLabelText("Edit Setpoint: New row")).toBeNull();
    expect(screen.getByText("Save or discard this row first")).toBeTruthy();
  });
});

describe("Deleting a row", () => {
  it("asks inside the row, and reports only once confirmed", () => {
    const onRowDelete = vi.fn();
    render(<Loops onRowDelete={onRowDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete: TIC-102" }));
    expect(onRowDelete).not.toHaveBeenCalled();
    expect(asked()).toHaveLength(1);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Keep: TIC-102" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete: TIC-102" }));
    expect(onRowDelete).toHaveBeenCalledWith({ rowKey: "l2", row: LOOPS[1] });
  });

  it("keeps the row on Keep, and reports nothing", () => {
    const onRowDelete = vi.fn();
    render(<Loops onRowDelete={onRowDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete: TIC-101" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep: TIC-101" }));
    expect(onRowDelete).not.toHaveBeenCalled();
    expect(asked()).toHaveLength(0);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete: TIC-101" }));
  });

  it("does nothing while a Row draft elsewhere holds the grid", () => {
    const onRowDelete = vi.fn();
    render(<Loops editMode="row" onRowSave={() => undefined} onRowDelete={onRowDelete} />);
    click(cellOf("80"));
    fireEvent.click(screen.getByRole("button", { name: "Delete: TIC-102" }));
    expect(asked()).toHaveLength(0);
  });
});
