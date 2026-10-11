/* The view as a starting state, over registered columns (umriss-table 11,
   table-filters 01).

   The difficulty is the timing: the hook is called before a column has
   registered. What is decided: the view is taken over on the first render and
   checked against the columns only on reading. Unknown names fall away, default
   values are not reported, and the default is what the application set. */

import { StrictMode } from "react";
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

function List({ start, presentation, report, tap }: { start?: TableView; presentation?: (m: number) => string; report?: (view: TableView) => void; tap?: (t: Table<Order>) => void }) {
  const t = useTable(ORDERS, {
    rowKey: (a) => a.id,
    pageSize: 2,
    defaultSort: { column: "number", direction: "asc" },
    initialView: start,
    onViewChange: report,
  });
  capture(t);
  tap?.(t);
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

describe("setView (ADR-0047)", () => {
  it("reads initialView once: a different one on a later render is ignored", () => {
    const { rerender } = render(<List start={{ search: "A-" }} />);
    rerender(<List start={{ sort: [{ column: "amount", direction: "desc" }] }} />);
    expect(current!.view).toEqual({ search: "A-" });
  });

  it("applies a whole view: what it leaves out goes back to its default, names no column carries fall out", () => {
    render(<List start={{ search: "A-" }} />);
    act(() => current!.toggleColumn("line"));
    act(() => current!.setView({ sort: [{ column: "amount", direction: "desc" }], hidden: ["gone", "line"], widths: { gone: 80 } }));
    expect(current!.view).toEqual({ sort: [{ column: "amount", direction: "desc" }], hidden: ["line"] });
    act(() => current!.setView({ search: "B" }));
    expect(current!.view).toEqual({ search: "B" });
  });

  it("is not reported through onViewChange, and the reader's next change still is", () => {
    const report = vi.fn();
    render(<StrictMode><List report={report} /></StrictMode>);
    act(() => current!.setView({ search: "A-" }));
    act(() => current!.setView({ search: "A-" }));
    expect(report).not.toHaveBeenCalled();
    act(() => current!.setWidth("number", 150));
    expect(report.mock.calls).toEqual([[{ search: "A-", widths: { number: 150 } }]]);
  });

  it("keeps two tables linked both ways in step, the other reporting nothing", () => {
    let a: Table<Order> | null = null;
    let b: Table<Order> | null = null;
    const reportA = vi.fn((v: TableView) => b!.setView(v));
    const reportB = vi.fn((v: TableView) => a!.setView(v));
    render(
      <>
        <List report={reportA} tap={(t) => (a = t)} />
        <List report={reportB} tap={(t) => (b = t)} />
      </>,
    );
    act(() => a!.toggleSort("amount"));
    expect(b!.sort).toEqual([{ column: "amount", direction: "asc" }]);
    expect(reportA).toHaveBeenCalledTimes(1);
    expect(reportB).not.toHaveBeenCalled();
    act(() => b!.toggleColumn("line"));
    expect(a!.hidden).toEqual(["line"]);
    expect(reportB).toHaveBeenCalledTimes(1);
    expect(reportA).toHaveBeenCalledTimes(1);
  });

  it("reports nothing while untouched", () => {
    const report = vi.fn();
    render(<List report={report} />);
    expect(report).not.toHaveBeenCalled();
  });

  it("reports every change the reader makes once, always the whole view", () => {
    const report = vi.fn();
    render(<StrictMode><List report={report} /></StrictMode>);
    act(() => current!.setSearch("A-"));
    act(() => current!.setWidth("number", 150));
    expect(report.mock.calls).toEqual([
      [{ search: "A-" }],
      [{ search: "A-", widths: { number: 150 } }],
    ]);
  });
});
