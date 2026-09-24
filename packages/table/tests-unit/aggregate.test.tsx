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
    expect(footer(container, "range")).toBe("Range 02/10/2026–09/10/2026");
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
