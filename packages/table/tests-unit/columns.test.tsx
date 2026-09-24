/* Columns: binding, registration, value and presentation (umriss-table 06).

   The table now renders itself, so rendering gets component tests - the reverse
   of the rule from table-model, which held as long as the rendering belonged to
   the caller. The first case is the reason for this whole package. */

import { StrictMode } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTable } from "../src";
import type { Table } from "../src";

interface Order {
  id: string;
  number: string;
  line: string;
  amount: number | null;
}

const ORDERS: Order[] = [
  { id: "a", number: "A-1", line: "L2", amount: 5 },
  { id: "b", number: "A-2", line: "L1", amount: null },
  { id: "c", number: "A-3", line: "L1", amount: 7 },
];

let current: Table<Order> | null = null;
const capture = (t: Table<Order>) => {
  current = t;
};
const t = () => current!;

function AmountColumn({ of }: { of: Table<Order> }) {
  const { Column } = of;
  return <Column value="amount" label="Quantity" aggregate="sum" />;
}

function Orders({
  withLine = true,
  wrapper = false,
  presentation,
}: {
  withLine?: boolean;
  wrapper?: boolean;
  presentation?: (amount: number) => string;
}) {
  const table = useTable(ORDERS, { rowKey: (a) => a.id });
  capture(table);
  const { Table: Frame, Column } = table;
  return (
    <Frame selectable>
      <Column value="number" label="Order" rowHeader />
      {withLine && <Column value="line" label="Line" width={140} />}
      {wrapper ? (
        <AmountColumn of={table} />
      ) : (
        <Column value="amount" label="Quantity" aggregate="sum">
          {presentation}
        </Column>
      )}
    </Frame>
  );
}

const headers = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("thead th[data-column]")).map((th) => th.getAttribute("data-column"));

/** The cells of a body row without the selection cell. */
const cells = (root: HTMLElement, index: number) =>
  Array.from(root.querySelectorAll("tbody > tr")[index]!.children)
    .slice(1)
    .map((z) => z.textContent);

/** Where the sum stands in the footer row - without the selection cell. */
const footerKinds = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("tfoot td"))
    .slice(1)
    .map((z) => z.getAttribute("data-footer") ?? "");

describe("Registration", () => {
  it("the order of the columns is the JSX order", () => {
    const { container } = render(<Orders />);
    expect(headers(container)).toEqual(["number", "line", "amount"]);
    expect(cells(container, 0)).toEqual(["A-1", "L2", "5"]);
  });

  it("a column inside a wrapper registers at its place", () => {
    const { container } = render(<Orders wrapper />);
    expect(headers(container)).toEqual(["number", "line", "amount"]);
    expect(footerKinds(container)).toEqual(["", "", "sum"]);
  });

  it("a column that appears in the middle stands at its JSX place", () => {
    const { container, rerender } = render(<Orders withLine={false} />);
    expect(headers(container)).toEqual(["number", "amount"]);
    rerender(<Orders withLine />);
    expect(headers(container)).toEqual(["number", "line", "amount"]);
  });

  it("the parts keep their identity - no column is remounted", () => {
    const { container, rerender } = render(<Orders />);
    const marker = container.querySelector("[data-umriss-column]");
    const first = t().Column;
    rerender(<Orders />);
    rerender(<Orders />);
    expect(container.querySelector("[data-umriss-column]")).toBe(marker);
    expect(t().Column).toBe(first);
  });

  it("holds up in Strict Mode: mounting twice, then reordering and hiding", () => {
    const { container } = render(
      <StrictMode>
        <Orders />
      </StrictMode>,
    );
    expect(headers(container)).toEqual(["number", "line", "amount"]);
    act(() => t().setOrder(["amount"]));
    expect(headers(container)).toEqual(["amount", "number", "line"]);
    act(() => t().toggleColumn("line"));
    expect(headers(container)).toEqual(["amount", "number"]);
  });

  it("warns when a column from another hook stands in the table", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    function Foreign() {
      const a = useTable(ORDERS, { rowKey: (z) => z.id });
      const b = useTable(ORDERS, { rowKey: (z) => z.id });
      return (
        <a.Table>
          <a.Column value="number" label="Order" />
          <b.Column id="fremde-line" value={(z) => z.line} label="Line" />
        </a.Table>
      );
    }
    render(<Foreign />);
    expect(warning.mock.calls.some(([text]) => String(text).includes("different useTable call"))).toBe(true);
    warning.mockRestore();
  });
});

describe("Reordering and hiding act on header, body and footer at once", () => {
  it("reordering moves the rendered columns - the error this package exists for", () => {
    const { container } = render(<Orders />);
    act(() => t().setOrder(["amount", "number"]));
    expect(headers(container)).toEqual(["amount", "number", "line"]);
    expect(cells(container, 0)).toEqual(["5", "A-1", "L2"]);
    expect(footerKinds(container)).toEqual(["sum", "", ""]);
  });

  it("hiding takes the column out of all three and leaves it mounted", () => {
    const { container } = render(<Orders />);
    act(() => t().toggleColumn("line"));
    expect(headers(container)).toEqual(["number", "amount"]);
    expect(cells(container, 0)).toEqual(["A-1", "5"]);
    expect(footerKinds(container)).toEqual(["", "sum"]);
    expect(container.querySelectorAll("[data-umriss-column]")).toHaveLength(3);
  });

  it("the row header cannot be hidden", () => {
    const { container } = render(<Orders />);
    act(() => t().toggleColumn("number"));
    expect(headers(container)).toContain("number");
  });

  it("a column that leaves the JSX and returns keeps width and place", () => {
    const { container, rerender } = render(<Orders />);
    act(() => {
      t().setOrder(["line", "number", "amount"]);
      t().setWidth("line", 222);
    });
    rerender(<Orders withLine={false} />);
    expect(headers(container)).toEqual(["number", "amount"]);
    rerender(<Orders withLine />);
    expect(headers(container)).toEqual(["line", "number", "amount"]);
    const line = container.querySelector<HTMLElement>('th[data-column="line"]')!;
    expect(line.style.width).toBe("222px");
  });
});

describe("Value and presentation", () => {
  it("children never gets an absent value", () => {
    const presentation = vi.fn((amount: number) => `${amount} Stk.`);
    const { container } = render(<Orders presentation={presentation} />);
    expect(presentation).toHaveBeenCalled();
    for (const [value] of presentation.mock.calls) {
      expect(typeof value).toBe("number");
      expect(Number.isNaN(value)).toBe(false);
    }
    expect(cells(container, 0)[2]).toBe("5 Stk.");
    // The absent value: visibly a dash, read out a word.
    const empty = container.querySelectorAll("tbody > tr")[1]!.children[3]!;
    expect(empty.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
    expect(empty.textContent).toContain("No value");
  });

  it("sorts through the header, with absent values last in both directions", () => {
    const { container } = render(<Orders />);
    const amount = screen.getByRole("button", { name: /Quantity/ });
    fireEvent.click(amount);
    expect(Array.from(container.querySelectorAll("tbody th")).map((z) => z.textContent)).toEqual(["A-1", "A-3", "A-2"]);
    fireEvent.click(amount);
    expect(Array.from(container.querySelectorAll("tbody th")).map((z) => z.textContent)).toEqual(["A-3", "A-1", "A-2"]);
    expect(container.querySelector('th[data-column="amount"]')?.getAttribute("aria-sort")).toBe("descending");
  });
});

describe("Row header and selection", () => {
  it("renders row header cells and names the row's selection after them", () => {
    const { container } = render(<Orders />);
    const rowHeaders = Array.from(container.querySelectorAll('tbody th[scope="row"]')).map((z) => z.textContent);
    expect(rowHeaders).toEqual(["A-1", "A-2", "A-3"]);
    expect(screen.getByRole("checkbox", { name: "Select A-2" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Select all" })).toBeTruthy();
  });

  it("'all' selects the filtered set and keeps the selection outside it", () => {
    render(<Orders />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select A-1" }));
    act(() => t().setSearch("A-3"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));
    expect([...t().selection.selected].sort()).toEqual(["a", "c"]);
  });
});
