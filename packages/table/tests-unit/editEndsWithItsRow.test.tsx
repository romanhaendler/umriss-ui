/* An open edit ends only when a live update removed its row from the hook's
   rows (ADR-0036): not while the table loads, not when the row only changes
   page, and a Row draft is not left by paging. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";

interface Pump {
  id: string;
  name: string;
  flow: number;
}

const PUMPS: Pump[] = [
  { id: "p1", name: "Pump 1", flow: 12 },
  { id: "p2", name: "Pump 2", flow: 30 },
  { id: "p3", name: "Pump 3", flow: 7 },
];

function Grid({ rows, loading, editMode, paged, onCellEdit, onRowSave }: {
  rows: Pump[];
  loading?: boolean;
  editMode?: "row";
  paged?: boolean;
  onCellEdit?: (e: unknown) => void;
  onRowSave?: (e: unknown) => void;
}) {
  const t = useTable(rows, { rowKey: (p) => p.id, pageSize: 2 });
  const { Table, Column } = t;
  return (
    <>
      {paged && <Pagination of={t} />}
      <Table grid aria-label="Pumps" loading={loading} editMode={editMode} onCellEdit={onCellEdit as never} onRowSave={onRowSave as never}>
        <Column value="name" label="Pump" rowHeader />
        <Column value="flow" label="Flow" edit="number" validate={(v) => (v !== null && v > 100 ? "Too high" : undefined)} />
      </Table>
    </>
  );
}

const open = () => {
  act(() => screen.getByText("30").closest<HTMLElement>("td")!.focus());
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  return document.activeElement as HTMLInputElement;
};

describe("An edit while the table loads", () => {
  it.each([["a valid draft", "45", false], ["an invalid draft", "500", true]])("keeps %s open", (_, value, invalid) => {
    const onCellEdit = vi.fn();
    const { rerender } = render(<Grid rows={PUMPS} onCellEdit={onCellEdit} />);
    const input = open();
    fireEvent.change(input, { target: { value } });
    if (invalid) fireEvent.keyDown(input, { key: "Enter" });
    rerender(<Grid rows={PUMPS} loading onCellEdit={onCellEdit} />);
    expect(onCellEdit).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(value)).toBeTruthy();
    expect(document.activeElement).toBe(input);
    if (invalid) expect(screen.getAllByText("Too high").length).toBeGreaterThan(0);
  });
});

describe("A Row draft", () => {
  const draft = () => {
    const { rerender } = render(<Grid rows={PUMPS} editMode="row" paged onRowSave={onRowSave} />);
    open();
    return rerender;
  };
  const onRowSave = vi.fn();

  it("whose row a live update moves to another page is not saved", () => {
    const rerender = draft();
    fireEvent.change(screen.getByDisplayValue("30"), { target: { value: "31" } });
    rerender(<Grid rows={[PUMPS[0]!, PUMPS[2]!, PUMPS[1]!]} editMode="row" paged onRowSave={onRowSave} />);
    expect(onRowSave).not.toHaveBeenCalled();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("is not left by the pager", () => {
    draft();
    fireEvent.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    expect(screen.getByDisplayValue("30")).toBeTruthy();
  });
});
