/* The view as a starting state, over registered columns (umriss-table 11,
   table-filters 01).

   The difficulty is the timing: the hook is called before a column has
   registered. What is decided: the view is taken over on the first render and
   checked against the columns only on reading. Unknown names fall away, default
   values are not reported, and the default is what the application set. */

import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, useTable } from "../src";
import type { TableView, Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: string;
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

function AmountColumn({ of, presentation }: { of: Table<Order>; presentation?: (m: number) => string }) {
  const { Column } = of;
  return (
    <Column value="amount" label="Quantity" resizable>
      {presentation}
    </Column>
  );
}

function List({ start, presentation }: { start?: TableView; presentation?: (m: number) => string }) {
  const t = useTable(ORDERS, {
    rowKey: (a) => a.id,
    pageSize: 2,
    defaultSort: { column: "number", direction: "asc" },
    initialView: start,
  });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <Pagination />
      <Column value="number" label="Order" rowHeader resizable width={100} />
      <Column value="line" label="Line" />
      <AmountColumn of={t} presentation={presentation} />
    </Frame>
  );
}

describe("Round trip", () => {
  it("an untouched table yields an empty view - the application's settings are the default", () => {
    render(<List />);
    expect(current!.view).toEqual({});
  });

  it("a fully populated view comes back unchanged as the starting state", () => {
    const { unmount } = render(<List />);
    act(() => current!.setSearch("-"));
    act(() => current!.toggleSort("line"));
    act(() => current!.toggleSort("amount", true));
    act(() => current!.setPageSize(3));
    act(() => current!.toggleColumn("line"));
    act(() => current!.setOrder(["amount"]));
    act(() => current!.setWidth("number", 150));
    act(() => current!.setPage(2));
    const before = current!.view;
    expect(before).toEqual({
      search: "-",
      sort: [
        { column: "line", direction: "asc" },
        { column: "amount", direction: "asc" },
      ],
      page: 2,
      pageSize: 3,
      hidden: ["line"],
      order: ["amount"],
      widths: { number: 150 },
    });
    unmount();

    render(<List start={before} />);
    expect(current!.view).toEqual(before);
    expect(current!.page).toBe(2);
  });
});

describe("Checking against the registered columns", () => {
  it("a view naming a column that is not in the JSX yields a valid view without it", () => {
    render(
      <List
        start={{
          sort: [
            { column: "gibtsnicht", direction: "desc" },
            { column: "amount", direction: "asc" },
          ],
          hidden: ["gibtsnicht", "line"],
          order: ["gibtsnicht"],
          widths: { gibtsnicht: 200 },
        }}
      />,
    );
    expect(current!.view).toEqual({
      sort: [{ column: "amount", direction: "asc" }],
      hidden: ["line"],
    });
    expect(current!.sort).toEqual([{ column: "amount", direction: "asc" }]);
  });

  it("the first rendered rows already show the sort of the view", () => {
    const presentation = vi.fn((m: number) => String(m));
    render(<List start={{ sort: [{ column: "amount", direction: "desc" }] }} presentation={presentation} />);
    const firstRows = presentation.mock.calls.slice(0, 2).map(([m]) => m);
    expect(firstRows).toEqual([9, 7]);
  });
});
