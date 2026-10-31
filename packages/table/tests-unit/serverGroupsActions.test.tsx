/* A grouped server table does what a grouped table does with its groups: fold
   all, select a group, export, and number its lines for a screen reader. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Export, Pagination, Toolbar, groupPath, useTable } from "../src";
import type { AllMatching, ServerGroup, TableRequest } from "../src";

interface Row {
  id: string;
  status: string;
  amount: number;
}

const rows: Row[] = [
  { id: "a", status: "open", amount: 1 },
  { id: "b", status: "open", amount: 2 },
  { id: "c", status: "done", amount: 4 },
  { id: "d", status: "wait", amount: 8 },
];
const groups: ServerGroup[] = [
  { path: ["open"], count: 30, at: 0, totals: { amount: 700 } },
  { path: ["done"], count: 12, at: 2 },
  { path: ["wait"], count: 5, at: 3 },
];

let asked: TableRequest[] = [];
let received: unknown[] = [];
let exported: string[] = [];

function Server({
  grid = false,
  rowCount = 50,
  exportRows,
}: {
  grid?: boolean;
  rowCount?: number;
  exportRows?: (r: TableRequest) => Promise<readonly Row[]>;
}) {
  const t = useTable(rows, {
    rowKey: (r) => r.id,
    server: true,
    rowCount,
    matchCount: 47,
    pageSize: 10,
    defaultGrouping: ["status"],
    onRequest: (request) => asked.push(request),
    groups,
    exportRows,
  });
  const { Table: Frame, Column, RowActions, Action } = t;
  return (
    <Frame selectable grid={grid} aria-label="Orders">
      <Toolbar>
        <Export onExport={(text) => exported.push(text)} />
      </Toolbar>
      <Pagination />
      <Column value="id" label="Id" rowHeader />
      <Column value="status" label="Status" />
      <Column value="amount" label="Amount" aggregate="sum" />
      <RowActions>
        <Action bulk onSelect={(selected) => received.push(selected)}>
          Release
        </Action>
      </RowActions>
    </Frame>
  );
}

afterEach(() => {
  asked = [];
  received = [];
  exported = [];
  vi.restoreAllMocks();
});

describe("fold all", () => {
  it("folds the groups of the page in one request and unfolds them in one", () => {
    render(<Server />);
    fireEvent.click(document.querySelector("[data-fold-path]")!, { altKey: true });
    expect(asked).toHaveLength(2);
    expect(asked.at(-1)!.folded).toEqual([groupPath(["done"]), groupPath(["open"]), groupPath(["wait"])].sort());
    fireEvent.click(document.querySelector("[data-fold-path]")!, { altKey: true });
    expect(asked).toHaveLength(3);
    expect(asked.at(-1)!.folded).toEqual([]);
  });
});

describe("selecting a group", () => {
  it("draws a box per group; ticking it hands the bulk action the request and the group", () => {
    render(<Server />);
    fireEvent.click(screen.getByRole("checkbox", { name: /open/i }));
    expect(screen.getByText(/30 selected/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    const got = received[0] as AllMatching;
    expect(got.group).toBe(groupPath(["open"]));
    expect(got.except).toEqual([]);
    expect(got.request).toMatchObject({ grouping: ["status"] });
  });

  it("ticks the rows of the chosen group; unticking one is an exception to it", () => {
    render(<Server />);
    fireEvent.click(screen.getByRole("checkbox", { name: /open/i }));
    expect((screen.getByRole("checkbox", { name: "Select a" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Select c" }) as HTMLInputElement).checked).toBe(false);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select a" }));
    expect((screen.getByRole("checkbox", { name: "Select a" }) as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText(/29 selected/i)).toBeTruthy();
    expect((screen.getByRole("checkbox", { name: /open/i }) as HTMLInputElement).indeterminate).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    expect((received[0] as AllMatching).except).toEqual(["a"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select a" }));
    expect(screen.getByText(/30 selected/i)).toBeTruthy();
    expect((screen.getByRole("checkbox", { name: /open/i }) as HTMLInputElement).checked).toBe(true);
  });

  it("ends when another group is chosen or a row is ticked", () => {
    render(<Server />);
    fireEvent.click(screen.getByRole("checkbox", { name: /open/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /done/i }));
    expect(screen.getByText(/12 selected/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select a" }));
    expect(screen.queryByText(/12 selected/i)).toBeNull();
    expect(screen.getByText(/1 selected/i)).toBeTruthy();
  });

  it("offers all that match by `matchCount`, not by the lines", () => {
    render(<Server />);
    fireEvent.click(document.querySelector("thead [role=checkbox], thead input[type=checkbox]")!);
    fireEvent.click(screen.getByRole("button", { name: /47/ }));
    expect(screen.getByText(/47 selected/i)).toBeTruthy();
  });
});

describe("export", () => {
  it("writes the page in the groups' order and asks for all with the grouping", async () => {
    const exportRows = vi.fn<(r: TableRequest) => Promise<Row[]>>(async () => rows);
    render(<Server exportRows={exportRows} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Export" }));
    });
    expect(exportRows.mock.calls[0]![0]).toMatchObject({ grouping: ["status"] });
    expect(exported[0]).toContain("a,open");
  });
});

describe("numbering", () => {
  it("numbers the lines of a page over every page and counts all of them", () => {
    render(<Server rowCount={25} />);
    const index = Array.from(document.querySelectorAll("tbody tr")).map((tr) => tr.getAttribute("aria-rowindex")).filter(Boolean);
    expect(index).toEqual(["2", "3", "4", "5", "6", "7", "8"]);
    expect(document.querySelector("table")?.getAttribute("aria-rowcount")).toBe("26");
  });
});

describe("keyboard", () => {
  it("makes the group lines rows of the grid, walked down from the head", () => {
    render(<Server grid />);
    const lines = Array.from(document.querySelectorAll("tr[data-grid-line]")).map((tr) => (tr as HTMLElement).dataset.gridLine);
    expect(lines.filter((l) => l?.startsWith("header:"))).toHaveLength(3);
    const head = document.querySelector<HTMLElement>('tr[data-grid-line="head"] [tabindex="0"]') ?? document.querySelector<HTMLElement>('tr[data-grid-line="head"] th');
    head!.focus();
    fireEvent.keyDown(head!, { key: "ArrowDown" });
    expect((document.activeElement?.closest("tr") as HTMLElement).dataset.gridLine).toMatch(/^header:/);
  });
});
