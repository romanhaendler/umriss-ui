/* The range filter (table-filters 05): `filter="range"` for numbers and points
   in time, built with the same interface as a filter of one's own.

   Both bounds are inclusive, each may stay open, an absent value never matches.
   For points in time the bounds are calendar days in local time: `to` 30.09.
   includes the whole day. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  amount: number | null;
  due: Date;
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", amount: 100, due: new Date(2026, 8, 1, 0, 0) },
  { id: "b", number: "A-2", amount: 300, due: new Date(2026, 8, 15, 12, 30) },
  { id: "c", number: "A-3", amount: 500, due: new Date(2026, 8, 30, 23, 45) },
  { id: "d", number: "A-4", amount: 900, due: new Date(2026, 9, 1, 0, 15) },
  { id: "e", number: "A-5", amount: null, due: new Date(2026, 8, 20, 8, 0) },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

function List() {
  const t = useTable(ORDERS, { rowKey: (a) => a.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
      <Column value="number" label="Order" rowHeader />
      <Column value="amount" label="Quantity" filter="range" />
      <Column value="due" label="Due date" filter="range" />
    </Frame>
  );
}

const numbers = () => current!.filtered.map((a) => a.number);

describe("Numbers", () => {
  it("includes both bounds", () => {
    render(<List />);
    act(() => current!.setFilter("amount", { from: 100, to: 500 }));
    expect(numbers()).toEqual(["A-1", "A-2", "A-3"]);
  });

  it("leaves one bound open", () => {
    render(<List />);
    act(() => current!.setFilter("amount", { from: 500 }));
    expect(numbers()).toEqual(["A-3", "A-4"]);
    act(() => current!.setFilter("amount", { to: 300 }));
    expect(numbers()).toEqual(["A-1", "A-2"]);
  });

  it("never lets an absent value through, not even with open bounds", () => {
    render(<List />);
    act(() => current!.setFilter("amount", { from: 0 }));
    expect(numbers()).not.toContain("A-5");
  });

  it("an empty range lifts the condition", () => {
    render(<List />);
    act(() => current!.setFilter("amount", { from: 100 }));
    act(() => current!.setFilter("amount", {}));
    expect(current!.filter).toEqual({});
    expect(numbers()).toHaveLength(5);
  });

  it("names the condition with its bounds", () => {
    const { container } = render(<List />);
    act(() => current!.setFilter("amount", { from: 100, to: 500 }));
    expect(container.textContent).toContain("100–500");
    act(() => current!.setFilter("amount", { from: 100 }));
    expect(container.textContent).toContain("from 100");
    act(() => current!.setFilter("amount", { to: 500 }));
    expect(container.textContent).toContain("to 500");
  });
});

describe("Points in time", () => {
  it("counts in calendar days: the last day counts in full", () => {
    render(<List />);
    act(() => current!.setFilter("due", { from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }));
    // A-3 lies on 30.09. at 23:45, A-4 on 1.10. at 0:15.
    expect(numbers()).toEqual(["A-1", "A-2", "A-3", "A-5"]);
  });

  it("names two days of the same year with one year", () => {
    const { container } = render(<List />);
    act(() => current!.setFilter("due", { from: new Date(2026, 8, 1), to: new Date(2026, 8, 30) }));
    expect(container.textContent).toContain("01/09–30/09/2026");
    act(() => current!.setFilter("due", { from: new Date(2025, 11, 1), to: new Date(2026, 8, 30) }));
    expect(container.textContent).toContain("01/12/2025–30/09/2026");
  });

  it("takes a bound with a time of day as its day", () => {
    render(<List />);
    act(() => current!.setFilter("due", { from: new Date(2026, 8, 15, 23, 59) }));
    expect(numbers()).toEqual(["A-2", "A-3", "A-4", "A-5"]);
  });
});

describe("The input of the range", () => {
  const panel = () => screen.getByRole("dialog", { name: "Filter Quantity" });

  it("takes over a number as it is typed", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Quantity" }));
    fireEvent.change(within(panel()).getByLabelText("From"), { target: { value: "300" } });
    expect(current!.filter).toEqual({ amount: { from: 300 } });
    expect(numbers()).toEqual(["A-2", "A-3", "A-4"]);
  });

  it("marks the fields invalid when From lies behind To, and keeps the last valid condition", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Quantity" }));
    fireEvent.change(within(panel()).getByLabelText("From"), { target: { value: "500" } });
    fireEvent.change(within(panel()).getByLabelText("To"), { target: { value: "100" } });
    expect(current!.filter).toEqual({ amount: { from: 500 } });
    expect(within(panel()).getByLabelText("From").getAttribute("aria-invalid")).toBe("true");
    expect(within(panel()).getByLabelText("To").getAttribute("aria-invalid")).toBe("true");
  });

  it("offers the period picker for a point in time", () => {
    render(<List />);
    fireEvent.click(screen.getByRole("button", { name: "Filter Due date" }));
    const period = screen.getByRole("dialog", { name: "Filter Due date" });
    expect(within(period).getByRole("button", { name: /Select range/i })).toBeTruthy();
  });
});
