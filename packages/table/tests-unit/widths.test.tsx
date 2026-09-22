/* Widths, sticky parts, density, virtualisation (umriss-table 10).

   The proof in the browser - that the column really sticks, that a virtualised
   table really scrolls smoothly - waits for the package's demo (spec, Testing
   Decisions). Here stands what jsdom can express. */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UmrissProvider } from "@umriss-ui/core";
import { within } from "@testing-library/react";
import { ColumnMenu, Pagination, useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: string;
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", line: "L2" },
  { id: "b", number: "A-2", line: "L1" },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

afterEach(() => vi.restoreAllMocks());

function List({ density, sticky = false }: { density?: "regular" | "compact"; sticky?: boolean }) {
  const t = useTable(ORDERS, { rowKey: (a) => a.id });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame selectable density={density} stickyRowHeader={sticky} stickyHeader>
      <ColumnMenu />
      <Column value="line" label="Line" resizable width={120} />
      <Column value="number" label="Order" rowHeader />
    </Frame>
  );
}

const firePointer = (element: Element, type: string, init: PointerEventInit) =>
  element.dispatchEvent(new PointerEvent(type, { bubbles: true, ...init }));

describe("Column width", () => {
  const gripAndCell = (root: HTMLElement) => {
    const cell = root.querySelector<HTMLElement>('th[data-column="line"]')!;
    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue({ width: 100 } as DOMRect);
    return { cell, grip: cell.querySelector('[role="presentation"]')! };
  };

  it("has the column's width as its start", () => {
    const { container } = render(<List />);
    expect(container.querySelector<HTMLElement>('th[data-column="line"]')!.style.width).toBe("120px");
  });

  it("a drag sets the width and does not sort", () => {
    const { container } = render(<List />);
    const { cell, grip } = gripAndCell(container);
    act(() => {
      fireEvent.pointerDown(grip, { pointerId: 1, clientX: 10 });
      firePointer(grip, "pointermove", { pointerId: 1, clientX: 50 });
      firePointer(grip, "pointerup", { pointerId: 1, clientX: 50 });
    });
    fireEvent.click(grip);
    expect(cell.style.width).toBe("140px");
    expect(cell.getAttribute("aria-sort")).toBe("none");
  });

  it("a second pointer neither moves the drag nor ends it", () => {
    const { container } = render(<List />);
    const { cell, grip } = gripAndCell(container);
    act(() => {
      fireEvent.pointerDown(grip, { pointerId: 1, clientX: 10 });
      firePointer(grip, "pointermove", { pointerId: 2, clientX: 300 });
      firePointer(grip, "pointerup", { pointerId: 2, clientX: 300 });
    });
    expect(cell.style.width).toBe("120px");
    act(() => firePointer(grip, "pointermove", { pointerId: 1, clientX: 30 }));
    expect(cell.style.width).toBe("120px");
    expect(current!.widths.line).toBe(120);
    act(() => firePointer(grip, "pointerup", { pointerId: 1, clientX: 30 }));
    act(() => firePointer(grip, "pointermove", { pointerId: 1, clientX: 90 }));
    expect(current!.widths.line).toBe(120);
  });

  it("Alt with an arrow key changes the width from the keyboard", () => {
    const { container } = render(<List />);
    const { cell } = gripAndCell(container);
    fireEvent.keyDown(cell.querySelector("button")!, { key: "ArrowRight", altKey: true });
    expect(cell.style.width).toBe("108px");
    fireEvent.keyDown(cell.querySelector("button")!, { key: "ArrowLeft", altKey: true, shiftKey: true });
    expect(cell.style.width).toBe("68px");
  });

  it("a double click fits the column to its widest content", () => {
    const { container } = render(<List />);
    const { cell, grip } = gripAndCell(container);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(173);
    fireEvent.doubleClick(grip);
    expect(cell.style.width).toBe("174px");
  });

  it("a double click fits a widened column back down: it measures without the width it has", () => {
    const { container } = render(<List />);
    const { cell, grip } = gripAndCell(container);
    /* A cell is never narrower than its width - measured with it, a widened
       column only ever grew. */
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
      return cell.style.width === "" ? 73 : 400;
    });
    fireEvent.doubleClick(grip);
    expect(cell.style.width).toBe("74px");
  });
});

describe("Sticky parts and density", () => {
  it("the sticky first column is the row header, in front, behind the selection", () => {
    const { container } = render(<List sticky />);
    const header = container.querySelector<HTMLElement>("thead th[data-column]")!;
    expect(header.getAttribute("data-column")).toBe("number");
    expect(header.className).toContain("stickyCell");
    expect(header.style.left).toBe("34px");
    const rowHeader = container.querySelector<HTMLElement>('tbody th[scope="row"]')!;
    expect(rowHeader.style.left).toBe("34px");
    expect(container.querySelector("table")!.className).toContain("sticky");
  });

  it("the sticky row header stands first in the column menu and in the export as well", () => {
    render(<List sticky />);
    expect(current!.asCsv().replace("﻿", "").split("\r\n")[0]).toBe("Order;Line");
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    const menu = screen.getByRole("dialog");
    expect(within(menu).getAllByRole("checkbox").map((k) => k.closest("label")!.textContent)).toEqual(["Order", "Line"]);
    expect((within(menu).getByRole("button", { name: "Move Line forward" }) as HTMLButtonElement).disabled).toBe(true);
    expect((within(menu).getByRole("button", { name: "Move Order backward" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("the density comes from the provider and can be overridden at the table", () => {
    const { container, rerender } = render(
      <UmrissProvider density="compact">
        <List />
      </UmrissProvider>,
    );
    expect(container.querySelector("table")!.className).toContain("compact");
    rerender(
      <UmrissProvider density="compact">
        <List density="regular" />
      </UmrissProvider>,
    );
    expect(container.querySelector("table")!.className).not.toContain("compact");
  });
});

describe("Virtualisation", () => {
  interface Reading {
    id: string;
    number: string;
  }
  const MANY: Reading[] = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), number: `M-${i}` }));

  function Big() {
    const { Table: Frame, Column } = useTable(MANY, { rowKey: (m) => m.id, virtual: { rowHeight: 20 } });
    return (
      <Frame maxHeight="100px">
        <Column value="number" label="Messung" rowHeader />
        <Pagination />
      </Frame>
    );
  }

  it("renders only the window, but counts every row and does not page", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big />);
    const data = container.querySelectorAll("tbody tr[data-row]");
    // 100 px / 20 px = 5 rows, one of them cut off, four buffer rows below.
    expect(data).toHaveLength(10);
    expect(container.querySelector("table")!.getAttribute("aria-rowcount")).toBe("1001");
    // The header row is there, so it says which one it is.
    expect(container.querySelector("thead tr")!.getAttribute("aria-rowindex")).toBe("1");
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("moves the window with the scrolling", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
    const { container } = render(<Big />);
    const scroll = container.querySelector("table")!.parentElement!;
    scroll.scrollTop = 2000;
    fireEvent.scroll(scroll);
    const first = container.querySelector("tbody tr[data-row]")!;
    // Row 100 stands on top, four buffer rows before it; aria-rowindex counts
    // from one, with the header.
    expect(first.getAttribute("data-row")).toBe("96");
    expect(first.getAttribute("aria-rowindex")).toBe("98");
    expect(first.getAttribute("tabindex")).toBe("0");
  });
});

/* Without a provider and without a statement, regular – the counterpart of
   "builds it without a provider as before" from `anbieter.test.tsx` in
   @umriss-ui/core, which went with the table (umriss-table 14). */
describe("Density without a provider", () => {
  it("builds a table without a provider and without a statement as regular", () => {
    const { container } = render(<List />);
    expect(container.querySelector("table")!.className).not.toContain("compact");
  });
});
