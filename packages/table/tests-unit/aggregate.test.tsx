/* `aggregate` on a column, and `footer` as its old name (table-grouping 02).
   The footer is the aggregate over the filtered set. */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../src";

interface Order {
  id: string;
  article: string;
  quantity: number;
  scrap: number | null;
  due: Date;
  gauge: number | null;
}

const ORDERS: Order[] = [
  { id: "A-1041", article: "Housing 40", quantity: 1200, scrap: 14, due: new Date(2026, 9, 2), gauge: 9.5 },
  { id: "A-1044", article: "Housing 60", quantity: 800, scrap: 3, due: new Date(2026, 9, 4), gauge: 12.5 },
  { id: "A-1058", article: "Housing 40", quantity: 600, scrap: null, due: new Date(2026, 9, 9), gauge: 10.3 },
];

const LIMITS: LimitSet = {
  limits: [
    { value: 10, side: "upper", severity: "warning" },
    { value: 12, side: "upper", severity: "alarm" },
  ],
};

const footer = (root: HTMLElement, kind: string) => root.querySelector(`tfoot td[data-footer="${kind}"]`)?.textContent ?? null;

afterEach(() => vi.restoreAllMocks());

describe("aggregate in the footer", () => {
  function Orders() {
    const { Table, Column, VerdictColumn } = useTable(ORDERS, { rowKey: (o) => o.id });
    return (
      <Table>
        <Column value="id" label="Order" rowHeader aggregate="count" />
        <Column value="article" label="Article" aggregate="distinct" />
        <Column value="quantity" label="Quantity" aggregate="sum" />
        <Column value="scrap" label="Scrap" aggregate="max" />
        <Column value="due" label="Due" format="date" aggregate="range" />
        <Column id="rate" value={(o) => o.scrap} label="Scrap rate" aggregate={(values, rows) => values.reduce((a, b) => a + b, 0) / rows.reduce((a, o) => a + o.quantity, 0)}>
          {(rate) => `${(rate * 100).toFixed(1)} %`}
        </Column>
        <VerdictColumn value="gauge" label="Gauge" limits={LIMITS} aggregate="worst" />
      </Table>
    );
  }

  it("writes every built-in with its word for the screen reader", () => {
    const { container } = render(<Orders />);
    expect(footer(container, "count")).toBe("Count 3");
    expect(footer(container, "distinct")).toBe("Distinct values 2");
    expect(footer(container, "sum")).toBe("ΣSum 2,600");
    expect(footer(container, "max")).toBe("maxMaximum 14");
    expect(footer(container, "range")).toBe("Range 02/10–09/10");
  });

  it("runs an aggregate of one's own through the column's presentation", () => {
    const { container } = render(<Orders />);
    // 17 scrap over 2,600 pieces – weighted, not the average of three rates.
    expect(footer(container, "own")).toBe("Aggregate 0.7 %");
  });

  it("gives a verdict column the worst verdict of its rows", () => {
    const { container } = render(<Orders />);
    expect(container.querySelector('tfoot [data-verdict="alarm"]')?.textContent).toContain("12.5");
  });
});

/* A sum and an average are computed, and their trailing digits are
   arithmetic, not information (table-aggregate-digits 01): without a format a
   sum keeps the decimals of its most precise value, an average one more. */
describe("a computed aggregate without float noise", () => {
  interface Item {
    id: string;
    hours: number | null;
    share: number;
  }
  const ITEMS: Item[] = [
    { id: "a", hours: 18, share: 0.1 },
    { id: "b", hours: 12, share: 0.2 },
    { id: "c", hours: 10, share: 0 },
    { id: "d", hours: null, share: 0 },
  ];

  function Items({ kind, of, decimals }: { kind: "sum" | "avg"; of: "hours" | "share"; decimals?: number }) {
    const { Table, Column } = useTable(ITEMS, { rowKey: (i) => i.id });
    return (
      <Table>
        <Column value="id" label="Item" rowHeader />
        <Column value={of} label="Figure" aggregate={kind} format={decimals === undefined ? undefined : { decimals }} />
      </Table>
    );
  }

  it("averages whole numbers to tenths", () => {
    const { container } = render(<Items kind="avg" of="hours" />);
    expect(footer(container, "avg")).toBe("⌀Average 13.3");
  });

  it("sums without the float's remainder", () => {
    const { container } = render(<Items kind="sum" of="share" />);
    expect(footer(container, "sum")).toBe("ΣSum 0.3");
  });

  it("sums whole numbers without decimals", () => {
    const { container } = render(<Items kind="sum" of="hours" />);
    expect(footer(container, "sum")).toBe("ΣSum 40");
  });

  it("leaves a column's own format as it is", () => {
    const { container } = render(<Items kind="avg" of="hours" decimals={2} />);
    expect(footer(container, "avg")).toBe("⌀Average 13.33");
  });
});

describe("footer, the old name", () => {
  function Old() {
    const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id });
    return (
      <Table>
        <Column value="id" label="Order" rowHeader />
        <Column value="quantity" label="Quantity" footer="sum" />
      </Table>
    );
  }

  it("keeps working and names the new prop once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Old />);
    expect(footer(container, "sum")).toBe("ΣSum 2,600");
    expect(warn.mock.calls.filter(([m]) => String(m).includes("`aggregate`"))).toHaveLength(1);
  });
});
