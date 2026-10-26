/* The table's date editor uses core's DatePicker unchanged: under a named zone
   it takes and hands out the instant of the zone's midnight. The run's zone is
   Europe/Berlin (vitest.config.ts). */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@umriss-ui/core";
import { useTable } from "../src";
import type { CellEdit } from "../src";

interface Job {
  id: string;
  due: Date;
}

// Midnight of 17 March in New York.
const JOBS: Job[] = [{ id: "j1", due: new Date("2026-03-17T04:00:00Z") }];

function Jobs({ onCellEdit }: { onCellEdit: (edit: CellEdit<Job>) => void }) {
  const { Table, Column } = useTable(JOBS, { rowKey: (j) => j.id });
  return (
    <Table grid onCellEdit={onCellEdit} aria-label="Jobs">
      <Column value="id" label="Job" rowHeader />
      <Column value="due" label="Due" format="date" edit="date" />
    </Table>
  );
}

describe("the date editor under a named zone", () => {
  it("opens on the zone's day and commits the zone's midnight", () => {
    const onCellEdit = vi.fn();
    render(
      <LanguageProvider formats={{ timeZone: "America/New_York" }}>
        <Jobs onCellEdit={onCellEdit} />
      </LanguageProvider>,
    );
    const cell = screen.getByText("17/03/2026").closest<HTMLElement>("td, th")!;
    act(() => cell.focus());
    fireEvent.focus(cell);
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    fireEvent.click(screen.getByLabelText("Edit Due: j1"));
    expect(screen.getByLabelText("Tuesday, 17 March 2026").getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByLabelText("Wednesday, 18 March 2026"));
    expect(onCellEdit).toHaveBeenCalledTimes(1);
    expect((onCellEdit.mock.calls[0]![0] as CellEdit<Job>).value).toEqual(new Date("2026-03-18T04:00:00Z"));
  });
});
