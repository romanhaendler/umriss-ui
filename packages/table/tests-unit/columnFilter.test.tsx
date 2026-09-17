/* One interface for column filters, typed conditions (table-filters 03).

   The list filter and a filter of one's own go through the same door:
   `columnFilter({ matches, Input, describe })`. From outside one sets and reads
   conditions through `t.setFilter` and `t.filter`, and the view carries them.
   D6: a condition goes with its column. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination, columnFilter, useTable } from "../src";
import type { TableView, Table } from "../src";

interface Part {
  id: string;
  number: string;
  line: "L1" | "L2" | null;
  stock: number | null;
  arrival: Date;
}

const PARTS: Part[] = [
  { id: "a", number: "T-1", line: "L1", stock: 0, arrival: new Date(2026, 8, 1) },
  { id: "b", number: "T-2", line: "L2", stock: 12, arrival: new Date(2026, 8, 2) },
  { id: "c", number: "T-3", line: null, stock: 40, arrival: new Date(2026, 8, 1) },
  { id: "d", number: "T-4", line: "L1", stock: null, arrival: new Date(2026, 8, 3) },
];

const matches = vi.fn((value: number, condition: "low" | "empty") => (condition === "empty" ? value === 0 : value < 20));

const stockLevel = columnFilter<number, "low" | "empty">({
  matches,
  Input: ({ condition, setCondition, values, column }) => (
    <div data-testid="input" data-values={values.join(",")} data-column={`${column.id}:${column.label}`}>
      <span data-testid="condition">{condition ?? "none"}</span>
      <button type="button" onClick={() => setCondition("empty")}>
        only empty
      </button>
      <button type="button" onClick={() => setCondition(null)}>
        all
      </button>
    </div>
  ),
  describe: (condition) => (condition === "empty" ? "empty" : "low"),
});

let current: Table<Part> | null = null;
const capture = (t: Table<Part>) => {
  current = t;
};

function List({
  withLine = true,
  start,
  preFilter,
  number,
}: {
  withLine?: boolean;
  start?: TableView;
  preFilter?: (part: Part) => boolean;
  number?: (n: string) => string;
}) {
  const t = useTable(PARTS, { rowKey: (z) => z.id, pageSize: 1, initialView: start, preFilter });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <Column value="number" label="Part" rowHeader>
        {number}
      </Column>
      {withLine && <Column value="line" label="Line" filter="list" />}
      <Column value="stock" id="level" label="Stock" filter={stockLevel} />
      <Column value="arrival" label="Inbox" filter="list" />
      <Pagination pageSizes={[1, 10]} />
    </Frame>
  );
}

const filteredNumbers = () => current!.filtered.map((z) => z.number);

afterEach(() => {
  matches.mockClear();
  vi.restoreAllMocks();
});

describe("t.setFilter and t.filter", () => {
  it("sets a condition, reads it back and lifts it with null", () => {
    render(<List />);
    act(() => current!.setFilter("line", ["L1"]));
    expect(current!.filter).toEqual({ line: ["L1"] });
    expect(filteredNumbers()).toEqual(["T-1", "T-4"]);
    act(() => current!.setFilter("line", null));
    expect(current!.filter).toEqual({});
    expect(filteredNumbers()).toEqual(["T-1", "T-2", "T-3", "T-4"]);
  });

  it("changing a condition resets to page one", () => {
    render(<List />);
    act(() => current!.setPage(3));
    expect(current!.page).toBe(3);
    act(() => current!.setFilter("line", ["L1", "L2"]));
    expect(current!.page).toBe(1);
  });

  it("an absent value is null in the list filter, a point in time is compared by its time", () => {
    render(<List />);
    act(() => current!.setFilter("line", [null]));
    expect(filteredNumbers()).toEqual(["T-3"]);
    act(() => current!.setFilter("line", null));
    act(() => current!.setFilter("arrival", [new Date(2026, 8, 1)]));
    expect(filteredNumbers()).toEqual(["T-1", "T-3"]);
  });

  it("a condition that does not fit the column's kind is passed over with a warning", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<List />);
    const setUnchecked = current!.setFilter as (column: string, condition: unknown) => void;
    act(() => setUnchecked("line", { from: 1 }));
    act(() => setUnchecked("number", ["T-1"]));
    expect(current!.filter).toEqual({});
    expect(filteredNumbers()).toHaveLength(4);
    expect(warning).toHaveBeenCalledTimes(2);
  });
});

describe("The view carries the conditions", () => {
  it("initialView sets them for the first render already", () => {
    const number = vi.fn((n: string) => n);
    render(<List start={{ conditions: { line: ["L2"] } }} number={number} />);
    expect(number.mock.calls.length).toBeGreaterThan(0);
    expect(number.mock.calls.every(([n]) => n === "T-2")).toBe(true);
    expect(filteredNumbers()).toEqual(["T-2"]);
  });

  it("t.view reads them back, and an unknown name falls out", () => {
    render(<List start={{ conditions: { gibtsnicht: ["x"], line: ["L2"] } }} />);
    expect(current!.view).toEqual({ conditions: { line: ["L2"] } });
    act(() => current!.setFilter("line", null));
    expect(current!.view).toEqual({});
  });
});

describe("A filter of one's own", () => {
  it("lets through what matches, and an absent value never matches - matches does not see it", () => {
    render(<List />);
    act(() => current!.setFilter("level", "low"));
    expect(filteredNumbers()).toEqual(["T-1", "T-2"]);
    expect(matches.mock.calls.every(([value]) => typeof value === "number")).toBe(true);
    expect(matches).toHaveBeenCalled();
  });

  it("its input gets the condition, the values of the admitted rows and the column, and sets the condition", () => {
    render(<List preFilter={(z) => z.id !== "b"} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Stock" }));
    const input = within(screen.getByRole("dialog", { name: "Filter Stock" })).getByTestId("input");
    expect(input.dataset.values).toBe("0,40");
    expect(input.dataset.column).toBe("level:Stock");
    fireEvent.click(within(input).getByRole("button", { name: "only empty" }));
    expect(current!.filter).toEqual({ level: "empty" });
    expect(within(input).getByTestId("condition").textContent).toBe("empty");
    expect(filteredNumbers()).toEqual(["T-1"]);
  });

  it("its condition is named with describe", () => {
    const { container } = render(<List />);
    act(() => current!.setFilter("level", "empty"));
    expect(container.textContent).toContain("Stock");
    expect(container.textContent).toContain("empty");
  });
});

describe("D6: a condition goes with its column", () => {
  it("if the column leaves the JSX its condition goes with it; when it returns it has none", () => {
    const { rerender } = render(<List />);
    act(() => current!.setFilter("line", ["L1"]));
    expect(filteredNumbers()).toEqual(["T-1", "T-4"]);
    rerender(<List withLine={false} />);
    expect(current!.filter).toEqual({});
    expect(filteredNumbers()).toHaveLength(4);
    rerender(<List withLine />);
    expect(current!.filter).toEqual({});
    expect(filteredNumbers()).toHaveLength(4);
  });

  it("a hidden column is still there and keeps its condition", () => {
    render(<List />);
    act(() => current!.setFilter("line", ["L1"]));
    act(() => current!.toggleColumn("line"));
    expect(current!.filter).toEqual({ line: ["L1"] });
    expect(filteredNumbers()).toEqual(["T-1", "T-4"]);
  });
});
