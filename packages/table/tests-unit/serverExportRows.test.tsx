/* Exporting all that match: with `exportRows` the button asks the application
   for every row of the current request and writes the file in the table's own
   columns. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Export, Toolbar, useTable } from "../src";
import type { Table, TableRequest } from "../src";

interface Item {
  id: string;
  name: string;
  qty: number;
}

const PAGE: Item[] = [{ id: "a", name: "Bolt", qty: 1 }];
const ALL: Item[] = [
  { id: "a", name: "Bolt", qty: 1 },
  { id: "b", name: "Nut", qty: 2 },
  { id: "c", name: "Washer", qty: 3 },
];

let current: Table<Item> | null = null;
const capture = (t: Table<Item>) => {
  current = t;
};

function Shop({ exportRows, onExport }: { exportRows?: (r: TableRequest) => Promise<readonly Item[]>; onExport: (t: string) => void }) {
  const t = useTable(PAGE, { rowKey: (i) => i.id, server: true, rowCount: 3, onRequest: () => {}, exportRows });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Items">
      <Toolbar>
        <Export onExport={onExport} />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="qty" label="Qty" />
    </Frame>
  );
}

const lines = (text: string) => text.replace("﻿", "").split("\r\n").filter(Boolean);

describe("exportRows", () => {
  it("writes the returned rows in the visible columns; the label says Export", async () => {
    const onExport = vi.fn();
    const exportRows = vi.fn(async () => ALL);
    render(<Shop exportRows={exportRows} onExport={onExport} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
    });
    expect(lines(onExport.mock.calls[0]![0])).toEqual(["Name,Qty", "Bolt,1", "Nut,2", "Washer,3"]);
    expect(exportRows).toHaveBeenCalledWith(current!.request);
  });

  it("without it the button says Export page and writes the page", () => {
    const onExport = vi.fn();
    render(<Shop onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: "Export page" }));
    expect(lines(onExport.mock.calls[0]![0])).toEqual(["Name,Qty", "Bolt,1"]);
  });

  it("is busy and announced while out, ignores a second click, and hands over the request of the click", async () => {
    const onExport = vi.fn();
    let resolve!: (rows: readonly Item[]) => void;
    const exportRows = vi.fn(() => new Promise<readonly Item[]>((r) => (resolve = r)));
    render(<Shop exportRows={exportRows} onExport={onExport} />);
    const atClick = current!.request;
    const button = screen.getByRole("button", { name: "Export" });
    fireEvent.click(button);
    act(() => current!.setSearch("nut"));
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getAllByRole("status").map((s) => s.textContent)).toContain("Preparing the export");
    fireEvent.click(button);
    expect(exportRows).toHaveBeenCalledTimes(1);
    expect(exportRows).toHaveBeenCalledWith(atClick);
    await act(async () => resolve(ALL));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect((button as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByText("Preparing the export")).toBeNull();
  });

  it("shows a rejection's message, writes no file, and the next click works", async () => {
    const onExport = vi.fn();
    const exportRows = vi.fn().mockRejectedValueOnce(new Error("Too many rows")).mockResolvedValueOnce(ALL);
    render(<Shop exportRows={exportRows} onExport={onExport} />);
    const button = screen.getByRole("button", { name: "Export" });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.getByRole("alert").textContent).toBe("Too many rows");
    expect(onExport).not.toHaveBeenCalled();
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("falls back to exportFailed for a rejection without a message", async () => {
    const exportRows = vi.fn().mockRejectedValue(undefined);
    render(<Shop exportRows={exportRows} onExport={vi.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
    });
    expect(screen.getByRole("alert").textContent).toBe("The export failed");
  });
});
