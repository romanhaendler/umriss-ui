/* The date-time and the boolean editor: the time of day is kept, a toggle
   commits, a Row draft takes both. The run's zone is Europe/Berlin. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { CellEdit, RowSave } from "../src";

interface Job {
  id: string;
  start: Date;
  done: boolean;
}

// 01:30 in Berlin on 17 March.
const JOBS: Job[] = [{ id: "j1", start: new Date("2026-03-17T00:30:00Z"), done: false }];

function Jobs({ edit, onCellEdit, onRowSave, editMode }: { edit: "date" | "dateTime"; onCellEdit?: (e: CellEdit<Job>) => void; onRowSave?: (s: RowSave<Job>) => void; editMode?: "row" }) {
  const { Table, Column } = useTable(JOBS, { rowKey: (j) => j.id });
  return (
    <Table grid editMode={editMode} onCellEdit={onCellEdit} onRowSave={onRowSave} aria-label="Jobs">
      <Column value="id" label="Job" rowHeader />
      <Column value="start" label="Start" edit={edit} />
      <Column value="done" label="Done" edit="boolean" />
    </Table>
  );
}

const focusCell = (text: string) => {
  const cell = screen.getByText(text).closest<HTMLElement>("td, th")!;
  act(() => cell.focus());
  fireEvent.focus(cell);
};
const enter = () => fireEvent.keyDown(document.activeElement!, { key: "Enter" });

describe("the date-time editor", () => {
  for (const edit of ["date", "dateTime"] as const) {
    it(`edit="${edit}" over values with a time offers the time of day and keeps it`, () => {
      const onCellEdit = vi.fn();
      render(<Jobs edit={edit} onCellEdit={onCellEdit} />);
      focusCell("17/03/2026, 01:30");
      enter();
      fireEvent.click(screen.getByLabelText("Edit Start: j1"));
      fireEvent.click(screen.getByLabelText("Wednesday, 18 March 2026"));
      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
      expect((onCellEdit.mock.calls[0]![0] as CellEdit<Job>).value).toEqual(new Date("2026-03-18T00:30:00Z"));
    });
  }
});

describe("the boolean editor", () => {
  it("toggles with a click on the checkbox and reports it", () => {
    const onCellEdit = vi.fn();
    render(<Jobs edit="dateTime" onCellEdit={onCellEdit} />);
    focusCell("No");
    enter();
    const box = screen.getByLabelText("Edit Done: j1") as HTMLInputElement;
    expect(document.activeElement).toBe(box);
    fireEvent.click(box);
    expect(onCellEdit).toHaveBeenCalledTimes(1);
    expect(onCellEdit.mock.calls[0]![0]).toMatchObject({ columnId: "done", value: true });
  });

  it("a click on the cell opens it and toggles at once", () => {
    const onCellEdit = vi.fn();
    render(<Jobs edit="dateTime" onCellEdit={onCellEdit} />);
    vi.useFakeTimers();
    fireEvent.click(screen.getByText("No").closest("td")!);
    act(() => void vi.runAllTimers());
    vi.useRealTimers();
    expect(onCellEdit.mock.calls[0]?.[0]).toMatchObject({ columnId: "done", value: true });
  });

  it("is one of a Row draft's changes in editMode=row", () => {
    const onRowSave = vi.fn();
    render(<Jobs edit="dateTime" editMode="row" onRowSave={onRowSave} />);
    focusCell("No");
    enter();
    fireEvent.click(screen.getByLabelText("Edit Done: j1"));
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    expect(onRowSave.mock.calls[0]![0].changes).toEqual({ done: true });
  });
});
