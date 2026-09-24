/* What a grouped table draws (table-grouping 04, ADR-0029): group headers for
   the outer levels, a span for the innermost, a group of one row as that row,
   folded groups as one line, and a page that begins inside a group. The case
   is the prototype's: 13 orders on three lines for eight customers. */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination, useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  line: string;
  customer: string;
  quantity: number;
  scrap: number | null;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200, scrap: 14 },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", quantity: 800, scrap: 3 },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400, scrap: 31 },
  { id: "A-1058", line: "Line 1", customer: "Otto & Söhne", quantity: 600, scrap: 0 },
  { id: "A-1060", line: "Line 1", customer: "Otto & Söhne", quantity: 300, scrap: 2 },
  { id: "A-1061", line: "Line 1", customer: "Otto & Söhne", quantity: 300, scrap: null },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000, scrap: 62 },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", quantity: 3200, scrap: 18 },
  { id: "A-1055", line: "Line 2", customer: "Lindner Tech", quantity: 1500, scrap: 4 },
  { id: "A-1057", line: "Line 2", customer: "Lindner Tech", quantity: 900, scrap: 1 },
  { id: "A-1046", line: "Line 3", customer: "Kessler AG", quantity: 700, scrap: 9 },
  { id: "A-1050", line: "Line 3", customer: "Vogt Maschinen", quantity: 450, scrap: 0 },
  { id: "A-1053", line: "Line 3", customer: "Weiss Antriebe", quantity: 1100, scrap: 27 },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};

function Orders({ paged = false, selectable = false }: { paged?: boolean; selectable?: boolean }) {
  const t = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "customer"], pageSize: 5 });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame selectable={selectable}>
      {paged && <Pagination />}
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column value="scrap" label="Scrap" aggregate="sum" />
    </Frame>
  );
}

const lines = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLTableRowElement>("tbody tr[data-line]"));
const kinds = (root: HTMLElement) => lines(root).map((tr) => tr.dataset.line);
const heads = (root: HTMLElement) => Array.from(root.querySelectorAll("thead th")).map((th) => th.textContent);
const cellsOf = (tr: HTMLTableRowElement) => Array.from(tr.cells).map((c) => c.textContent?.trim());

describe("group headers and spans", () => {
  it("draws 16 lines for 13 orders: a group header per line, the customer beside its orders", () => {
    const { container } = render(<Orders />);
    expect(kinds(container)).toEqual([
      "header", "row", "row", "row", "row", "row", "row",
      "header", "row", "row", "row", "row",
      "header", "row", "row", "row",
    ]);
    // The innermost grouped column stands first; the outer one is gone.
    expect(heads(container)).toEqual(["Customer", "Order", "Quantity", "Scrap"]);
  });

  it("gives a group header its value, its count and its aggregates in their columns", () => {
    const { container } = render(<Orders />);
    const band = lines(container)[0]!;
    expect(band.cells[0]!.textContent).toContain("Line 1");
    expect(band.cells[0]!.textContent).toContain("6");
    expect(cellsOf(band).slice(-2)).toEqual(["5,600", "50"]);
  });

  it("shows a span's value once, on its first row, with the count where there is more than one", () => {
    const { container } = render(<Orders />);
    const [, first, second, kessler] = lines(container);
    expect(first!.cells[0]!.textContent).toBe("Brenner GmbH2");
    expect(second!.cells[0]!.textContent).toBe("");
    // A group of one row is that row: no fold, no count.
    expect(kessler!.cells[0]!.textContent).toBe("Kessler AG");
    expect(within(kessler!.cells[0]!).queryByRole("button")).toBeNull();
  });
});

describe("folding", () => {
  it("folds a span to one line with its aggregates", () => {
    const { container } = render(<Orders />);
    fireEvent.click(screen.getByRole("button", { name: "Fold Otto & Söhne, 3" }));
    const folded = lines(container).find((tr) => tr.dataset.line === "folded")!;
    expect(cellsOf(folded)).toEqual(["Otto & Söhne3", "3 entries", "1,200", "2"]);
    expect(lines(container)).toHaveLength(14);
  });

  it("folds a group header to itself; everything folded is a summary of the lines", () => {
    const { container } = render(<Orders />);
    act(() => current!.foldAll());
    expect(kinds(container)).toEqual(["header", "header", "header"]);
    fireEvent.click(screen.getByRole("button", { name: "Unfold Line 3, 3" }));
    expect(kinds(container)).toEqual(["header", "header", "header", "row", "row", "row"]);
  });
});

describe("a page that begins inside a group", () => {
  it("repeats the group header, marked continued, and the span's value on its first row", () => {
    const { container } = render(<Orders paged />);
    act(() => current!.setPage(2));
    const [band, first] = lines(container);
    expect(band!.dataset.continued).toBe("");
    expect(band!.cells[0]!.textContent).toContain("Line 1");
    expect(band!.cells[0]!.textContent).toContain("continued");
    expect(first!.cells[0]!.textContent).toContain("Otto & Söhne");
    expect(first!.cells[1]!.textContent).toBe("A-1060");
  });
});

describe("selecting a group (table-grouping 05)", () => {
  it("selects every row of a group header – on other pages and in folded groups as well", () => {
    render(<Orders paged selectable />);
    fireEvent.click(screen.getByRole("button", { name: "Fold Otto & Söhne, 3" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Line 1" }));
    expect(current!.selection.count).toBe(6);
    expect((screen.getByRole("checkbox", { name: "Select Line 1" }) as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Line 1" }));
    expect(current!.selection.count).toBe(0);
  });

  it("gives a span of several rows a box of its own that shows a partial selection", () => {
    render(<Orders selectable />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-1058" }));
    const otto = screen.getByRole("checkbox", { name: "Select Otto & Söhne" }) as HTMLInputElement;
    expect(otto.indeterminate).toBe(true);
    expect((screen.getByRole("checkbox", { name: "Select Line 1" }) as HTMLInputElement).indeterminate).toBe(true);
    fireEvent.click(otto);
    expect(current!.selection.count).toBe(3);
    // A group of one row is selected by its row's own box.
    expect(screen.queryByRole("checkbox", { name: "Select Kessler AG" })).toBeNull();
  });
});

describe("the treegrid (table-grouping 05)", () => {
  it("is a treegrid while grouped, with levels, folds and positions", () => {
    const { container } = render(<Orders />);
    expect(screen.getByRole("treegrid")).toBeTruthy();
    const [band, first] = lines(container);
    expect(band!.getAttribute("aria-level")).toBe("1");
    expect(band!.getAttribute("aria-expanded")).toBe("true");
    expect(band!.getAttribute("aria-posinset")).toBe("1");
    expect(band!.getAttribute("aria-setsize")).toBe("3");
    expect(first!.getAttribute("aria-level")).toBe("2");
    act(() => current!.setGrouping([]));
    expect(screen.queryByRole("treegrid")).toBeNull();
  });

  it("folds with the left arrow and unfolds with the right one, and the focus stays on the fold", () => {
    render(<Orders />);
    const fold = screen.getByRole("button", { name: "Fold Otto & Söhne, 3" });
    fold.focus();
    fireEvent.keyDown(fold, { key: "ArrowLeft" });
    const unfold = screen.getByRole("button", { name: "Unfold Otto & Söhne, 3" });
    expect(document.activeElement).toBe(unfold);
    fireEvent.keyDown(unfold, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fold Otto & Söhne, 3" }));
  });

  it("goes from an open fold to the fold of the group around it with the left arrow", () => {
    render(<Orders />);
    act(() => current!.toggleFold(JSON.stringify(["value:Line 1", "value:Otto & Söhne"])));
    const otto = screen.getByRole("button", { name: "Unfold Otto & Söhne, 3" });
    otto.focus();
    fireEvent.keyDown(otto, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Fold Line 1, 6" }));
  });
});

describe("all siblings at once, and a virtual window (table-grouping 04, 05)", () => {
  it("folds every group of the level with Alt and an arrow, and unfolds them again", () => {
    render(<Orders />);
    const brenner = screen.getByRole("button", { name: "Fold Brenner GmbH, 2" });
    brenner.focus();
    fireEvent.keyDown(brenner, { key: "ArrowLeft", altKey: true });
    // Brenner and Otto on Line 1, Lindner on Line 2 - the groups of one order do not fold.
    expect(current!.folded).toHaveLength(3);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Unfold Brenner GmbH, 2" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight", altKey: true });
    expect(current!.folded).toHaveLength(0);
  });

  it("counts lines, not rows, for a virtual window", () => {
    function Virtual() {
      const { Table: Frame, Column } = useTable(ORDERS, {
        rowKey: (o) => o.id,
        defaultGrouping: ["line", "customer"],
        virtual: { rowHeight: 36 },
      });
      return (
        <Frame maxHeight="300px">
          <Column value="id" label="Order" rowHeader />
          <Column value="line" label="Line" />
          <Column value="customer" label="Customer" />
          <Column value="quantity" label="Quantity" aggregate="sum" />
        </Frame>
      );
    }
    const { container } = render(<Virtual />);
    // 16 lines, the header row and the footer.
    expect(screen.getByRole("treegrid").getAttribute("aria-rowcount")).toBe("18");
    expect(kinds(container)[0]).toBe("header");
  });
});

describe("one level (ADR-0029, Q27)", () => {
  it("is a group header over plain rows: every aggregate under its column, no span", () => {
    function OneLevel() {
      const { Table: Frame, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: "line" });
      return (
        <Frame>
          <Column value="id" label="Order" rowHeader />
          <Column value="line" label="Line" />
          <Column value="quantity" label="Quantity" aggregate="sum" />
          <Column value="scrap" label="Scrap" aggregate="sum" />
        </Frame>
      );
    }
    const { container } = render(<OneLevel />);
    expect(heads(container)).toEqual(["Order", "Quantity", "Scrap"]);
    expect(kinds(container).slice(0, 8)).toEqual(["header", "row", "row", "row", "row", "row", "row", "header"]);
    const band = lines(container)[0]!;
    expect(cellsOf(band)).toEqual(["Line 16", "5,600", "50"]);
    expect(lines(container)[1]!.cells[0]!.textContent).toBe("A-1041");
  });
});
