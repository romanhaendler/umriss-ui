/* Table toolbar, search, column menu, export, paging, filters (umriss-table 08,
   table-filters 04: the conditions stand in the table toolbar). */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: "L1" | "L2";
  amount: number;
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", line: "L2", amount: 5 },
  { id: "b", number: "A-2", line: "L1", amount: 3 },
  { id: "c", number: "B-3", line: "L1", amount: 7 },
  { id: "d", number: "B-4", line: "L2", amount: 1 },
  { id: "e", number: "C-5", line: "L1", amount: 9 },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

function List({
  onExport,
  searchOutside = false,
  rows = ORDERS,
  loading = false,
  preFilter,
}: {
  onExport?: (text: string) => void;
  searchOutside?: boolean;
  rows?: Order[];
  loading?: boolean;
  preFilter?: (order: Order) => boolean;
}) {
  const t = useTable(rows, { rowKey: (a) => a.id, pageSize: 2, preFilter });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <>
      {searchOutside && <Search of={t} aria-label="Search outside" />}
      <Frame empty="No orders yet" loading={loading}>
        <Pagination />
        <Toolbar>
          <Search placeholder="Search orders" />
          <ColumnMenu />
          <Export onExport={onExport} />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="line" label="Line" filter="list" />
        <Column value="amount" label="Quantity" filter="list" />
      </Frame>
    </>
  );
}

const headers = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("thead th[data-column]")).map((th) => th.getAttribute("data-column"));
const rowHeaders = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("tbody th")).map((th) => th.textContent);

describe("Column menu", () => {
  it("hides, and the rendered columns follow", () => {
    const { container } = render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("dialog", { name: "Show, hide and arrange columns" });
    fireEvent.click(within(menu).getByRole("checkbox", { name: "Line" }));
    expect(headers(container)).toEqual(["number", "amount"]);
    expect((within(menu).getByRole("checkbox", { name: "Order" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("reorders, and header and body follow", () => {
    const { container } = render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("dialog");
    fireEvent.click(within(menu).getByRole("button", { name: "Move Quantity forward" }));
    fireEvent.click(within(menu).getByRole("button", { name: "Move Quantity forward" }));
    expect(headers(container)).toEqual(["amount", "number", "line"]);
    const firstRow = container.querySelector("tbody > tr")!;
    expect(Array.from(firstRow.children).map((z) => z.textContent)).toEqual(["5", "A-1", "L2"]);
    expect((within(menu).getByRole("button", { name: "Move Quantity forward" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("is operable without a pointer: every control is a control, and the focus stays after a move", () => {
    render(<List />);
    const open = screen.getByRole("button", { name: "Columns" });
    fireEvent.click(open);
    const menu = screen.getByRole("dialog");
    for (const control of within(menu).getAllByRole("button")) expect(control.tabIndex).not.toBe(-1);
    for (const box of within(menu).getAllByRole("checkbox")) expect(box.tabIndex).not.toBe(-1);
    const backward = within(menu).getByRole("button", { name: "Move Order backward" });
    backward.focus();
    fireEvent.click(backward);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Move Order backward");
    // Having reached the end, the focus goes to the other button instead of into the void.
    fireEvent.click(within(menu).getByRole("button", { name: "Move Order backward" }));
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Move Order forward");
  });
});

describe("Conditions in the table toolbar", () => {
  const conditions = () => screen.getByRole("list", { name: "Active filters" });
  const texts = () => within(conditions()).getAllByRole("listitem").map((b) => b.textContent);

  it("stand in the order in which they were set; a changed one stays at its place", () => {
    render(<List />);
    act(() => current!.setFilter("amount", [1]));
    act(() => current!.setFilter("line", ["L2"]));
    // The colon is ::after in the stylesheet, not text.
    expect(texts()).toEqual(["Quantity1", "LineL2"]);
    act(() => current!.setFilter("amount", [1, 5]));
    expect(texts()).toEqual(["Quantity1, 5", "LineL2"]);
  });

  it("names the first two values and how many more from three on", () => {
    render(<List />);
    act(() => current!.setFilter("amount", [1, 3, 5]));
    expect(texts()).toEqual(["Quantity1, 3 +1"]);
  });

  it("removing one leaves the others standing", () => {
    const { container } = render(<List />);
    act(() => current!.setFilter("amount", [1, 5, 9]));
    act(() => current!.setFilter("line", ["L2"]));
    fireEvent.click(screen.getByRole("button", { name: "Remove Line: L2" }));
    expect(texts()).toEqual(["Quantity1, 5 +1"]);
    expect(current!.filter).toEqual({ amount: [1, 5, 9] });
    expect(rowHeaders(container)).toEqual(["A-1", "B-4"]);
  });

  it("a click on a condition opens the panel of its filter", () => {
    render(<List />);
    act(() => current!.setFilter("line", ["L2"]));
    fireEvent.click(screen.getByRole("button", { name: "Edit Line: L2" }));
    const panel = screen.getByRole("dialog", { name: "Filter Line" });
    expect((within(panel).getByRole("checkbox", { name: "L2" }) as HTMLInputElement).checked).toBe(true);
  });

  it("the search has no condition, but it counts", () => {
    render(<List />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search table" }), { target: { value: "A-" } });
    expect(screen.queryByRole("list", { name: "Active filters" })).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("2 of 5");
  });

  it("the ratio stands in a status that is empty as long as nothing restricts", () => {
    render(<List />);
    expect(screen.getByRole("status").textContent).toBe("");
    act(() => current!.setFilter("line", ["L1"]));
    expect(screen.getByRole("status").textContent).toBe("3 of 5");
  });

  it("'reset' clears search and conditions and nothing else", () => {
    render(<List preFilter={(a) => a.id !== "e"} />);
    act(() => current!.setSearch("A"));
    act(() => current!.setFilter("line", ["L1"]));
    act(() => current!.toggleColumn("amount"));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(current!.search).toBe("");
    expect(current!.filter).toEqual({});
    expect(current!.hidden).toEqual(["amount"]);
    expect(current!.filtered).toHaveLength(4);
    expect(screen.queryByRole("button", { name: "Reset" })).toBeNull();
  });

  it("a search field outside the table takes it through of", () => {
    const { container } = render(<List searchOutside />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search outside" }), { target: { value: "C-" } });
    expect(rowHeaders(container)).toEqual(["C-5"]);
  });
});

describe("The table toolbar, even where none stands", () => {
  const toolbars = () => screen.queryAllByRole("status").length;

  it("a table with a column filter has one, already in the first frame", () => {
    function WithoutToolbar() {
      const { Table: Frame, Column } = useTable(ORDERS, { rowKey: (a) => a.id });
      return (
        <Frame>
          <Column value="number" label="Order" rowHeader />
          <Column value="line" label="Line" filter="list" />
        </Frame>
      );
    }
    render(<WithoutToolbar />);
    expect(toolbars()).toBe(1);
  });

  it("a table with a search outside has one", () => {
    function SearchOutside() {
      const t = useTable(ORDERS, { rowKey: (a) => a.id });
      const { Table: Frame, Column } = t;
      return (
        <>
          <Search of={t} />
          <Frame>
            <Column value="number" label="Order" rowHeader />
          </Frame>
        </>
      );
    }
    render(<SearchOutside />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "B-" } });
    expect(toolbars()).toBe(1);
    expect(screen.getByRole("status").textContent).toBe("2 of 5");
  });

  it("a table without a search and without a filter has none", () => {
    function Plain() {
      const { Table: Frame, Column } = useTable(ORDERS, { rowKey: (a) => a.id });
      return (
        <Frame>
          <Column value="number" label="Order" rowHeader />
        </Frame>
      );
    }
    render(<Plain />);
    expect(toolbars()).toBe(0);
  });

  it("carries only conditions, the ratio and the way back - the selection belongs to a toolbar that was put there", () => {
    function WithSelection() {
      const t = useTable(ORDERS, { rowKey: (a) => a.id });
      const { Table: Frame, Column, RowActions, Action } = t;
      return (
        <Frame selectable>
          <Column value="number" label="Order" rowHeader />
          <Column value="line" label="Line" filter="list" />
          <RowActions>
            <Action bulk onSelect={() => undefined}>
              Sperren
            </Action>
          </RowActions>
        </Frame>
      );
    }
    render(<WithSelection />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-1" }));
    expect(screen.queryByText("1 selected")).toBeNull();
    // The bulk action stands at the row, not in the toolbar the table puts up itself.
    expect(screen.getAllByRole("button", { name: /Sperren/ }).every((k) => k.closest("tbody") !== null)).toBe(true);
  });

  it("where a table toolbar stands, there is no second one", () => {
    render(<List />);
    expect(toolbars()).toBe(1);
  });
});

describe("Export", () => {
  it("contains the filtered set in the visible order - across all pages", () => {
    const onExport = vi.fn();
    render(<List onExport={onExport} />);
    act(() => {
      current!.setSearch("B");
      current!.setOrder(["amount"]);
      current!.toggleColumn("line");
    });
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    const text = String(onExport.mock.calls[0]![0]).replace("﻿", "");
    expect(text.split("\r\n")).toEqual(["Quantity;Order", "7;B-3", "1;B-4"]);
  });
});

describe("Paging", () => {
  it("stands underneath the table, wherever it stands in the JSX, and pages", () => {
    const { container } = render(<List />);
    const table = container.querySelector("table")!;
    const bar = screen.getByRole("navigation", { name: "Pagination" });
    expect(table.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bar.textContent).toContain("Page 1 of 3");
    expect(bar.textContent).toContain("5 entries");
    fireEvent.click(within(bar).getByRole("button", { name: "Next" }));
    expect(rowHeaders(container)).toEqual(["B-3", "B-4"]);
  });
});

describe("Without a pagination bar", () => {
  it("the table does not page but shows every filtered row", () => {
    function WithoutBar() {
      const { Table: Frame, Column } = useTable(ORDERS, { rowKey: (a) => a.id, pageSize: 2 });
      return (
        <Frame>
          <Column value="number" label="Order" rowHeader />
        </Frame>
      );
    }
    const { container } = render(<WithoutBar />);
    expect(rowHeaders(container)).toEqual(["A-1", "A-2", "B-3", "B-4", "C-5"]);
  });
});

describe("Empty and loading", () => {
  it("tells 'nothing there' from 'nothing matches' and offers the way back for the second", () => {
    const { container, unmount } = render(<List rows={[]} />);
    expect(container.textContent).toContain("No orders yet");
    unmount();
    render(<List />);
    act(() => current!.setSearch("gibt es nicht"));
    expect(screen.getByText("Nothing matches the search and filters")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Reset" }).at(-1)!);
    expect(current!.search).toBe("");
  });

  it("shows placeholders instead of rows while loading", () => {
    const { container } = render(<List loading />);
    expect(container.querySelectorAll('tbody tr[aria-hidden="true"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll("tbody th")).toHaveLength(0);
  });
});
