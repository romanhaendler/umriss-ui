/* What a grouped table draws (table-grouping 04, ADR-0029): header bands for
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

function Orders({ paged = false }: { paged?: boolean }) {
  const t = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "customer"], pageSize: 5 });
  capture(t);
  const { Table: Frame, Column } = t;
  return (
    <Frame>
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

describe("header bands and spans", () => {
  it("draws 16 lines for 13 orders: a band per line, the customer beside its orders", () => {
    const { container } = render(<Orders />);
    expect(kinds(container)).toEqual([
      "header", "row", "row", "row", "row", "row", "row",
      "header", "row", "row", "row", "row",
      "header", "row", "row", "row",
    ]);
    // The innermost grouped column stands first; the outer one is gone.
    expect(heads(container)).toEqual(["Customer", "Order", "Quantity", "Scrap"]);
  });

  it("gives a band its value, its count and its aggregates in their columns", () => {
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

  it("folds a band to itself; everything folded is a summary of the lines", () => {
    const { container } = render(<Orders />);
    act(() => current!.foldAll());
    expect(kinds(container)).toEqual(["header", "header", "header"]);
    fireEvent.click(screen.getByRole("button", { name: "Unfold Line 3, 3" }));
    expect(kinds(container)).toEqual(["header", "header", "header", "row", "row", "row"]);
  });
});

describe("a page that begins inside a group", () => {
  it("repeats the band, marked continued, and the span's value on its first row", () => {
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
