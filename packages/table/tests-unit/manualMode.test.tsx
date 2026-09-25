/* Manual mode at the table's interface (table-server-mode 01 and 02): the view
   goes out once per change, a fake server with latency answers, and loading,
   list filters, selection, grouping, export and grid mode behave as M1-M5 say.
   Without `manual` nothing changes - the rest of the suite is that proof. */

import { StrictMode, useState } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../src";
import type { ManualView, Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: "L1" | "L2" | "L3";
  amount: number;
}

/* The server's rows: 95 orders, which the table never holds at once. */
const ALL: Order[] = Array.from({ length: 95 }, (_, i) => ({
  id: `o${i + 1}`,
  number: `A-${String(i + 1).padStart(3, "0")}`,
  line: (["L1", "L2", "L3"] as const)[i % 3]!,
  amount: (i * 7) % 50,
}));

const LATENCY = 300;

/** What a server does with a view: search, conditions, sort, then the page. */
function answer(view: ManualView): { rows: Order[]; rowCount: number } {
  const lines = view.conditions.line as readonly string[] | undefined;
  let rows = ALL.filter((o) => o.number.toLowerCase().includes(view.search.toLowerCase()) && (!lines || lines.includes(o.line)));
  for (const level of [...view.sort].reverse()) {
    const key = level.column as keyof Order;
    rows = [...rows].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (level.direction === "asc" ? 1 : -1));
  }
  const start = (view.page - 1) * view.pageSize;
  return { rows: rows.slice(start, start + view.pageSize), rowCount: rows.length };
}

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};
let reports: ManualView[] = [];
let bulk: (readonly Order[])[] = [];
let exported: string[] = [];

/** A table over the fake server: every view is answered after LATENCY, the
    previous page stays in the meantime, and a late answer to an older view is
    dropped - the caller's business, done the way the demo does it. */
function Server({ grid = false, filterOptions = true, groupable }: { grid?: boolean; filterOptions?: boolean; groupable?: boolean }) {
  const [data, setData] = useState<{ rows: Order[]; rowCount: number }>({ rows: [], rowCount: 0 });
  const [loading, setLoading] = useState(true);
  const [asked, setAsked] = useState(0);
  const t = useTable(data.rows, {
    rowKey: (o) => o.id,
    pageSize: 10,
    manual: true,
    rowCount: data.rowCount,
    onViewChange: (view) => {
      reports.push(view);
      const ticket = asked + 1;
      setAsked(ticket);
      setLoading(true);
      setTimeout(() => {
        setAsked((latest) => {
          if (latest === ticket) {
            setData(answer(view));
            setLoading(false);
          }
          return latest;
        });
      }, LATENCY);
    },
    filterOptions: filterOptions ? (column) => (column === "line" ? ["L1", "L2", "L3"] : []) : undefined,
  });
  capture(t);
  const { Table: Frame, Column, RowActions, Action } = t;
  return (
    <Frame selectable loading={loading} grid={grid} groupable={groupable} ariaLabel="Orders">
      <Pagination />
      <Toolbar>
        <Search placeholder="Search orders" />
        <ColumnMenu />
        <Export onExport={(text) => exported.push(text)} />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="line" label="Line" filter="list" />
      <Column value="amount" label="Quantity" aggregate="sum" />
      <RowActions>
        <Action bulk onSelect={(rows) => bulk.push(rows)}>
          Release
        </Action>
      </RowActions>
    </Frame>
  );
}


const settle = () => act(() => void vi.advanceTimersByTime(LATENCY));
const bodyNumbers = () => Array.from(document.querySelectorAll("tbody th")).map((th) => th.textContent);

beforeEach(() => {
  vi.useFakeTimers();
  reports = [];
  bulk = [];
  exported = [];
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Manual mode - the view goes out", () => {
  it("reports the first view once, complete, even under Strict Mode", () => {
    render(
      <StrictMode>
        <Server />
      </StrictMode>,
    );
    expect(reports).toEqual([{ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }]);
  });

  it("reports every change of what decides the rows once, and nothing else", () => {
    render(<Server />);
    settle();
    const t = () => current!;
    act(() => t().setSearch("A-0"));
    act(() => t().toggleSort("amount"));
    act(() => t().setFilter("line", ["L2"]));
    act(() => t().setPage(2));
    act(() => t().setPageSize(25));
    // A width and a hidden column fetch nothing.
    act(() => t().setWidth("number", 200));
    act(() => t().toggleColumn("line"));
    act(() => t().setPage(1));
    expect(reports.map(({ search, conditions, sort, page, pageSize }) => ({ search, conditions, sort, page, pageSize }))).toEqual([
      { search: "", conditions: {}, sort: [], page: 1, pageSize: 10 },
      { search: "A-0", conditions: {}, sort: [], page: 1, pageSize: 10 },
      { search: "A-0", conditions: {}, sort: [{ column: "amount", direction: "asc" }], page: 1, pageSize: 10 },
      { search: "A-0", conditions: { line: ["L2"] }, sort: [{ column: "amount", direction: "asc" }], page: 1, pageSize: 10 },
      { search: "A-0", conditions: { line: ["L2"] }, sort: [{ column: "amount", direction: "asc" }], page: 2, pageSize: 10 },
      { search: "A-0", conditions: { line: ["L2"] }, sort: [{ column: "amount", direction: "asc" }], page: 1, pageSize: 25 },
    ]);
  });

  it("shows the rows as the server sent them: a sort by the header reports, it does not reorder", () => {
    render(<Server />);
    settle();
    expect(bodyNumbers()).toEqual(ALL.slice(0, 10).map((o) => o.number));
    fireEvent.click(screen.getByRole("button", { name: /Quantity/ }));
    // Until the answer, the table does not sort the page it holds.
    expect(reports.at(-1)!.sort).toEqual([{ column: "amount", direction: "asc" }]);
    settle();
    expect(bodyNumbers()).toEqual(answer(reports.at(-1)!).rows.map((o) => o.number));
  });

  it("pages by the server's count", () => {
    render(<Server />);
    settle();
    const bar = screen.getByRole("navigation", { name: "Pagination" });
    expect(bar.textContent).toContain("95 entries");
    expect(bar.textContent).toContain("Page 1 of 10");
    fireEvent.click(within(bar).getByRole("button", { name: "Next" }));
    expect(reports.at(-1)!.page).toBe(2);
    settle();
    expect(bodyNumbers()[0]).toBe("A-011");
    expect(bar.textContent).toContain("Page 2 of 10");
  });

  it("counts the matches in the toolbar by the server's count, and offers the way back when nothing matches", () => {
    render(<Server />);
    settle();
    act(() => current!.setSearch("Z"));
    settle();
    expect(screen.getByRole("status").textContent).toBe("0 entries");
    expect(screen.getByText("Nothing matches the search and filters")).toBeTruthy();
  });
});

describe("Manual mode - loading (M2)", () => {
  it("shows as many placeholders as the page had rows, and is busy", () => {
    const { container } = render(<Server />);
    // Before the first answer: a page's worth.
    expect(container.querySelectorAll("tbody tr[aria-hidden]")).toHaveLength(10);
    settle();
    act(() => current!.setSearch("A-09"));
    settle();
    expect(bodyNumbers()).toHaveLength(6);
    act(() => current!.toggleSort("amount"));
    expect(container.querySelector("table")!.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("tbody tr[aria-hidden]")).toHaveLength(6);
    settle();
    expect(container.querySelector("table")!.getAttribute("aria-busy")).toBeNull();
  });
});

describe("Manual mode - list filters (M4)", () => {
  it("offers the values the application names, not the page's", () => {
    render(<Server />);
    settle();
    act(() => current!.setFilter("line", ["L3"]));
    settle();
    fireEvent.click(screen.getByRole("button", { name: "Filter Line" }));
    const panel = screen.getByRole("dialog", { name: "Filter Line" });
    expect(within(panel).getAllByRole("checkbox").map((c) => c.getAttribute("aria-label") ?? c.parentElement!.textContent)).toEqual([
      "L1",
      "L2",
      "L3",
    ]);
  });

  it("warns once where no values are named, and offers the page's", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Server filterOptions={false} />);
    settle();
    fireEvent.click(screen.getByRole("button", { name: "Filter Line" }));
    expect(warn.mock.calls.some(([m]) => String(m).includes("filterOptions"))).toBe(true);
    warn.mockRestore();
  });
});

describe("Manual mode - selection (M5)", () => {
  it("keeps keys of other pages, selects the page with 'select all' and says so, and hands a bulk action every selected row", () => {
    render(<Server />);
    settle();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-001" }));
    act(() => current!.setPage(2));
    settle();
    const all = screen.getByRole("checkbox", { name: "Select all on this page" });
    fireEvent.click(all);
    expect(current!.selection.count).toBe(11);
    expect(current!.selection.isSelected("o1")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Release" }));
    expect(bulk[0]!.map((o) => o.number)).toEqual(["A-001", ...ALL.slice(10, 20).map((o) => o.number)]);
    // Deselecting the page leaves page one's key alone.
    fireEvent.click(all);
    expect([...current!.selection.selected]).toEqual(["o1"]);
  });
});

describe("Manual mode - what the table does not do over one page", () => {
  it("has no footer, and no grouping - with a warning where one was asked for (M3)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { container } = render(<Server groupable />);
    settle();
    expect(container.querySelector("tfoot")).toBeNull();
    expect(warn.mock.calls.some(([m]) => String(m).includes("`groupable` is passed over"))).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.queryByRole("region", { name: "Grouping" })).toBeNull();
    act(() => current!.setGrouping(["line"]));
    expect(current!.grouping).toEqual([]);
    warn.mockRestore();
  });

  it("exports the page, and its button says so", () => {
    render(<Server />);
    settle();
    fireEvent.click(screen.getByRole("button", { name: "Export page" }));
    const lines = exported[0]!.replace("﻿", "").trim().split(/\r?\n/);
    expect(lines).toHaveLength(11);
    expect(lines[1]).toContain("A-001");
  });
});

describe("Manual mode - grid mode", () => {
  it("walks the page, and the Active cell stands at the same place on the next one", () => {
    render(<Server grid />);
    settle();
    const cell = screen.getByText("A-003");
    act(() => cell.focus());
    fireEvent.focus(cell);
    act(() => current!.setPage(2));
    settle();
    const stop = document.querySelector<HTMLElement>("table [tabindex='0']")!;
    expect(stop.textContent).toBe("A-013");
  });
});
