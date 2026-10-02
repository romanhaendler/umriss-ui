/* The row pitch (ADR-0042): a row's height never follows what it shows. The
   heights themselves are the browser suite's; here what makes them hold - a
   control in a cell is small, and a cut value shows whole in a tip. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "@umriss-ui/core";
import { useTable } from "../src";

interface Order {
  id: string;
  customer: string;
}

const ORDERS: Order[] = [
  { id: "A-1", customer: "Holloway Garden Supplies and Landscaping Cooperative" },
  { id: "B-1", customer: "Brixley Cycles" },
];

function Orders() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <Table ariaLabel="Orders">
      <Column value="id" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column id="open" label="Open" value={(o) => o.id}>
        {(id) => <Button>{`Open ${id}`}</Button>}
      </Column>
    </Table>
  );
}

const small = (element: HTMLElement) => element.className.split(" ").some((c) => /(^|_)sm(_|$)/.test(c));

/* jsdom lays nothing out: a box is cut where its content is wider than it. */
function cutWhere(cut: (box: HTMLElement) => boolean) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return cut(this) ? 400 : 100;
  });
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("a control in a cell", () => {
  it("is small without the application saying so", () => {
    render(<Orders />);
    expect(small(screen.getByRole("button", { name: "Open A-1" }))).toBe(true);
  });
});

describe("the tip of a cut value", () => {
  it("shows the whole value after the tooltip's delay, and only where the value is cut", () => {
    vi.useFakeTimers();
    cutWhere((box) => box.textContent?.startsWith("Holloway") ?? false);
    render(<Orders />);
    fireEvent.pointerOver(screen.getByText("Brixley Cycles"));
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.pointerOver(screen.getByText(/^Holloway/));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByRole("tooltip").textContent).toBe(ORDERS[0]!.customer);
  });

  it("goes with Escape", () => {
    vi.useFakeTimers();
    cutWhere((box) => box.textContent?.startsWith("Holloway") ?? false);
    render(<Orders />);
    fireEvent.pointerOver(screen.getByText(/^Holloway/));
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
