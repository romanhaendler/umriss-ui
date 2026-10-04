/* The view as a starting state, over registered columns (umriss-table 11,
   table-filters 01).

   The difficulty is the timing: the hook is called before a column has
   registered. What is decided: the view is taken over on the first render and
   checked against the columns only on reading. Unknown names fall away, default
   values are not reported, and the default is what the application set. */

import { StrictMode, useState } from "react";
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

function List({ start, presentation, report }: { start?: TableView; presentation?: (m: number) => string; report?: (view: TableView) => void }) {
  const t = useTable(ORDERS, {
    rowKey: (a) => a.id,
    pageSize: 2,
    defaultSort: { column: "number", direction: "asc" },
    initialView: start,
    onViewChange: report,
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

describe("A view handed in later (ADR-0047)", () => {
  it("applies whenever it differs in content from the last one, without a remount", () => {
    const { rerender } = render(<List start={{ search: "A-" }} />);
    act(() => current!.toggleColumn("line"));
    rerender(<List start={{ sort: [{ column: "amount", direction: "desc" }] }} />);
    /* Whatever the new view leaves out is back at its default: it replaces, it does not merge. */
    expect(current!.view).toEqual({ sort: [{ column: "amount", direction: "desc" }] });
    expect(current!.visible.map((o) => o.id)).toEqual(["e", "c"]);
  });

  it("changes nothing when handed the same view again, as a new object", () => {
    const { rerender } = render(<List start={{ search: "A-" }} />);
    act(() => current!.toggleColumn("line"));
    rerender(<List start={{ search: "A-" }} />);
    expect(current!.view).toEqual({ search: "A-", hidden: ["line"] });
  });

  it("lets names no column carries fall out of a view handed in later as well", () => {
    const { rerender } = render(<List />);
    rerender(<List start={{ hidden: ["gone", "line"], widths: { gone: 80 } }} />);
    expect(current!.view).toEqual({ hidden: ["line"] });
  });

  it("reports nothing while untouched", () => {
    const report = vi.fn();
    render(<List report={report} />);
    expect(report).not.toHaveBeenCalled();
  });

  it("reports every change once, always the whole view", () => {
    const report = vi.fn();
    render(<StrictMode><List report={report} /></StrictMode>);
    act(() => current!.setSearch("A-"));
    act(() => current!.setWidth("number", 150));
    expect(report.mock.calls).toEqual([
      [{ search: "A-" }],
      [{ search: "A-", widths: { number: 150 } }],
    ]);
  });

  it("keeps two tables in step through what they report", () => {
    let a: Table<Order> | null = null;
    let b: Table<Order> | null = null;
    function Pair() {
      const [shared, setShared] = useState<TableView>({});
      return (
        <>
          <List start={shared} report={setShared} />
          <Spy onTable={(t) => (a = t)} />
          <List start={shared} report={setShared} />
          <Spy onTable={(t) => (b = t)} />
        </>
      );
    }
    /* `current` is whichever rendered last; the spies take it in turn. */
    function Spy({ onTable }: { onTable: (t: Table<Order>) => void }) {
      onTable(current!);
      return null;
    }
    render(<Pair />);
    act(() => a!.toggleSort("amount"));
    expect(b!.sort).toEqual([{ column: "amount", direction: "asc" }]);
    act(() => b!.toggleColumn("line"));
    expect(a!.hidden).toEqual(["line"]);
  });
});
