/* The row pitch (ADR-0042): a row's height never follows what it shows. The
   heights themselves are the browser suite's; here what makes them hold - a
   control in a cell is small, and a cut value shows whole in a tip. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "@umriss-ui/core";
import { Pagination, Search, useTable } from "../src";
import type { TableSnapshot } from "../src";

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

  it("stays away from a cut component: a badge has no words that say it whole", () => {
    vi.useFakeTimers();
    cutWhere((box) => box.textContent?.startsWith("Open") ?? false);
    render(<Orders />);
    fireEvent.pointerOver(screen.getByRole("button", { name: "Open A-1" }));
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole("tooltip")).toBeNull();
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

/* A page holds its height (row-pitch 02, 03). */
interface Shipment {
  id: string;
  depot: string;
}

const SHIPMENTS: Shipment[] = Array.from({ length: 23 }, (_, i) => ({ id: `FP-${1000 + i}`, depot: i < 9 ? "North" : "River" }));
let snapshot: TableSnapshot<Shipment> | null = null;
const capture = (t: TableSnapshot<Shipment>) => {
  snapshot = t;
};

function Shipments({ rows = SHIPMENTS, grouped = false, paged = true }: { rows?: Shipment[]; grouped?: boolean; paged?: boolean }) {
  const t = useTable(rows, { rowKey: (s) => s.id, pageSize: 10, defaultGrouping: grouped ? "depot" : undefined });
  capture(t);
  return (
    <t.Table ariaLabel="Shipments">
      <Search />
      <t.Column value="id" label="Shipment" rowHeader />
      <t.Column value="depot" label="Depot" />
      {paged && <Pagination />}
    </t.Table>
  );
}

const filler = (container: HTMLElement) => container.querySelector<HTMLElement>("tbody tr[data-filler] td");
const lines = (container: HTMLElement) => container.querySelectorAll("tbody tr:not([data-filler])").length;

describe("a page holds its height", () => {
  it("fills a short last page up to the page size, and a table of one page not at all", () => {
    const { container, unmount } = render(<Shipments />);
    expect(filler(container)).toBeNull();
    act(() => snapshot!.setPage(3));
    expect(lines(container)).toBe(3);
    expect(filler(container)!.style.height).toBe("calc(var(--_pitch) * 7)");
    unmount();
    const one = render(<Shipments rows={SHIPMENTS.slice(0, 4)} />);
    expect(filler(one.container)).toBeNull();
  });

  it("fills a grouped page as well, whose lines count its headers", () => {
    const { container } = render(<Shipments grouped />);
    expect(lines(container)).toBe(10);
    act(() => snapshot!.setPage(snapshot!.pageCount));
    const last = lines(container);
    expect(last).toBeLessThan(10);
    expect(filler(container)!.style.height).toBe(`calc(var(--_pitch) * ${10 - last})`);
  });

  it("keeps the height of a page while a search or a condition leaves few rows on one page", () => {
    const { container } = render(<Shipments />);
    act(() => snapshot!.setSearch("FP-102"));
    expect(snapshot!.pageCount).toBe(1);
    expect(lines(container)).toBe(3);
    expect(filler(container)!.style.height).toBe("calc(var(--_pitch) * 7)");
    act(() => snapshot!.setSearch(""));
    expect(filler(container)).toBeNull();
  });

  it("keeps the height of a page when nothing matches, and leaves a table without a bar as it is", () => {
    const { container, unmount } = render(<Shipments />);
    act(() => snapshot!.setSearch("nothing like it"));
    const cell = container.querySelector<HTMLElement>("tbody td")!;
    expect(cell.style.height).toBe("calc(var(--_pitch) * 10)");
    unmount();
    const bare = render(<Shipments paged={false} />);
    act(() => snapshot!.setSearch("nothing like it"));
    expect(bare.container.querySelector<HTMLElement>("tbody td")!.style.height).toBe("");
  });
});

describe("a value taller than a row", () => {
  it("is cut, and the table says so once in development, naming the column", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.textContent?.startsWith("Open") ? 48 : 0;
    });
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(35);
    const { rerender } = render(<Orders />);
    rerender(<Orders />);
    const said = warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes("taller than a row"));
    expect(said).toHaveLength(1);
    expect(said[0]).toContain('"Open"');
  });
});
