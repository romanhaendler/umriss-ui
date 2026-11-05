/* An edit on an expanded child row of a tree stays open while typing: the
   child is among the table's rows, even though it is not a top-level row. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

interface Unit {
  id: string;
  name: string;
  children?: Unit[];
}

const UNITS: Unit[] = [{ id: "v", name: "Sales", children: [{ id: "vn", name: "North" }] }];

function Units({ editMode, onCellEdit, onRowSave }: { editMode?: "row"; onCellEdit: () => void; onRowSave: () => void }) {
  const { Table, Column } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children });
  return (
    <Table grid aria-label="Units" editMode={editMode} onCellEdit={onCellEdit as never} onRowSave={onRowSave as never}>
      <Column value="name" label="Unit" rowHeader edit="text" />
    </Table>
  );
}

describe.each([[undefined], ["row" as const]])("An edit on a child row, editMode %s", (editMode) => {
  it("stays open while typing", () => {
    const onCellEdit = vi.fn();
    const onRowSave = vi.fn();
    render(<Units editMode={editMode} onCellEdit={onCellEdit} onRowSave={onRowSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Unfold rows under Sales" }));
    act(() => screen.getByText("North").closest<HTMLElement>("td, th")!.focus());
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    fireEvent.change(document.activeElement as HTMLInputElement, { target: { value: "North 2" } });
    expect(screen.getByDisplayValue("North 2")).toBeTruthy();
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(onRowSave).not.toHaveBeenCalled();
  });
});
