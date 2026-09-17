/* The pre-filter (table-filters 02): which rows a table has at all.

   Regression tests for the defects the spec found:
   D3 - the figures and the empty state counted rows the application's filter
        never admits;
   D4 - a filter written in the call made the table crash on the first render
        ("Too many re-renders");
   D5 - the list filter offered values the application's filter excludes. */

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, Search, Toolbar, useTable } from "../src";
import type { TableView } from "../src";

interface Order {
  id: string;
  number: string;
  plant: "Plant A" | "Plant B";
}

const ORDERS: Order[] = [
  { id: "1", number: "A-1", plant: "Plant A" },
  { id: "2", number: "B-1", plant: "Plant B" },
  { id: "3", number: "A-2", plant: "Plant A" },
  { id: "4", number: "B-2", plant: "Plant B" },
  { id: "5", number: "A-3", plant: "Plant A" },
];

function List({
  plant,
  pageSize = 10,
  start,
}: {
  plant: string;
  pageSize?: number;
  start?: TableView;
}) {
  const { Table: Frame, Column } = useTable(ORDERS, {
    rowKey: (a) => a.id,
    pageSize,
    preFilter: (a) => a.plant === plant,
    initialView: start,
  });
  return (
    <Frame empty="No orders in this plant">
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="plant" label="Plant" filter="list" />
      <Pagination />
    </Frame>
  );
}

const rowHeaders = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("tbody th")).map((th) => th.textContent);

describe("D4: a pre-filter may stand in the call", () => {
  it("renders and pages", () => {
    const { container } = render(<List plant="Plant A" pageSize={1} />);
    expect(rowHeaders(container)).toEqual(["A-1"]);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(rowHeaders(container)).toEqual(["A-2"]);
  });

  it("the old name `filter` renders just as well", () => {
    function Old() {
      const { Table: Frame, Column } = useTable(ORDERS, { rowKey: (a) => a.id, filter: (a) => a.plant === "Plant B" });
      return (
        <Frame>
          <Column value="number" label="Order" rowHeader />
        </Frame>
      );
    }
    const { container } = render(<Old />);
    expect(rowHeaders(container)).toEqual(["B-1", "B-2"]);
  });

  it("a change of the pre-filter does not reset the page", () => {
    const { container, rerender } = render(<List plant="Plant A" pageSize={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(rowHeaders(container)).toEqual(["A-2"]);
    rerender(<List plant="Plant B" pageSize={1} />);
    expect(rowHeaders(container)).toEqual(["B-2"]);
  });
});

describe("D3: the table's rows are the ones the pre-filter admits", () => {
  it("the ratio counts only admitted rows", () => {
    render(<List plant="Plant A" start={{ search: "A-2" }} />);
    expect(screen.getByText("1 of 3")).toBeTruthy();
  });

  it("if the pre-filter admits nothing the table is empty - not 'nothing matches', even with a search", () => {
    const { container } = render(<List plant="Plant C" start={{ search: "A" }} />);
    expect(container.textContent).toContain("No orders in this plant");
    expect(container.textContent).not.toContain("Nothing matches the search and filters");
  });

  it("'nothing matches' appears only once the search finds nothing among the admitted rows", () => {
    const { container } = render(<List plant="Plant A" start={{ search: "B-" }} />);
    expect(container.textContent).toContain("Nothing matches the search and filters");
  });
});

describe("D5: the list filter offers only admitted values", () => {
  it("a plant the pre-filter excludes is not up for choice", () => {
    render(<List plant="Plant A" />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Plant" }));
    const panel = screen.getByRole("dialog", { name: "Filter Plant" });
    expect(within(panel).getAllByRole("checkbox").map((k) => k.closest("label")?.textContent)).toEqual(["Plant A"]);
  });
});
