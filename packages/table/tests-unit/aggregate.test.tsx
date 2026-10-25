/* `aggregate` on a column (table-grouping 02).
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

describe("a footer over 200 000 rows", () => {
  interface Reading {
    id: string;
    at: Date;
    value: number;
  }
  const READINGS: Reading[] = Array.from({ length: 200_000 }, (_, i) => ({ id: String(i), at: new Date(2026, 0, 1 + (i % 10)), value: i % 100 }));

  function Readings() {
    const { Table, Column } = useTable(READINGS, { rowKey: (r) => r.id, virtual: true });
    return (
      <Table>
        <Column value="id" label="Reading" rowHeader />
        <Column value="at" label="At" format="date" aggregate="range" />
        <Column value="value" label="Value" aggregate="sum" />
        <Column id="mean" value={(r) => r.value} label="Mean" aggregate="avg" />
      </Table>
    );
  }

  it("renders without a spread overflowing the call, and sums right", () => {
    const { container } = render(<Readings />);
    expect(footer(container, "range")).toBe("Range 01/01–10/01");
    expect(footer(container, "sum")).toBe("ΣSum 9,900,000");
    expect(footer(container, "avg")).toBe("⌀Average 49.5");
  });
});

/* A matrix whose columns come from the data: the application pivots the facts
   into rows, the table declares one computed column per year, and the footer
   gives each year's total, the row-total column's the grand total. */
describe("a matrix with row and column totals", () => {
  interface Fact {
    plant: string;
    region: string;
    year: number;
    tonnes: number;
  }
  interface Row {
    plant: string;
    region: string;
    byYear: Record<number, number>;
    total: number;
  }
  const FACTS: Fact[] = [
    { plant: "Ulm", region: "South", year: 2025, tonnes: 10 },
    { plant: "Ulm", region: "South", year: 2026, tonnes: 20 },
    { plant: "Hof", region: "South", year: 2025, tonnes: 5 },
    { plant: "Kiel", region: "North", year: 2025, tonnes: 7 },
    { plant: "Kiel", region: "North", year: 2026, tonnes: 3 },
  ];

  function pivot(facts: Fact[]) {
    const rows = new Map<string, Row>();
    for (const f of facts) {
      const row = rows.get(f.plant) ?? { plant: f.plant, region: f.region, byYear: {}, total: 0 };
      row.byYear[f.year] = (row.byYear[f.year] ?? 0) + f.tonnes;
      row.total += f.tonnes;
      rows.set(f.plant, row);
    }
    return { rows: [...rows.values()], years: [...new Set(facts.map((f) => f.year))].sort() };
  }

  function Matrix({ facts, grouped = false }: { facts: Fact[]; grouped?: boolean }) {
    const { rows, years } = pivot(facts);
    const { Table, Column } = useTable(rows, { rowKey: (r) => r.plant, defaultGrouping: grouped ? "region" : undefined });
    return (
      <Table>
        <Column value="region" label="Region" />
        <Column value="plant" label="Plant" rowHeader />
        {years.map((y) => (
          <Column key={y} id={`y${y}`} label={String(y)} value={(r: Row) => r.byYear[y]} aggregate="sum" filter="range" format={{ decimals: 0 }} />
        ))}
        <Column value="total" label="Total" aggregate="sum" />
      </Table>
    );
  }

  const heads = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("thead th"))
      .map((th) => th.textContent?.trim() ?? "")
      .filter((h) => /^(20\d\d|Total)/.test(h));
  const sums = (root: HTMLElement) =>
    Array.from(root.querySelectorAll('tfoot td[data-footer="sum"]')).map((td) => td.textContent?.replace("ΣSum", "").trim());

  it("totals each year and the grand total", () => {
    const { container } = render(<Matrix facts={FACTS} />);
    expect(heads(container)).toEqual(["2025", "2026", "Total"]);
    expect(sums(container)).toEqual(["22", "23", "45"]);
  });

  it("follows the data: a year added at each end, one removed", () => {
    const { container, rerender } = render(<Matrix facts={FACTS} />);
    const next: Fact[] = [
      { plant: "Ulm", region: "South", year: 2024, tonnes: 1 },
      { plant: "Ulm", region: "South", year: 2026, tonnes: 20 },
      { plant: "Hof", region: "South", year: 2027, tonnes: 4 },
      { plant: "Kiel", region: "North", year: 2026, tonnes: 3 },
    ];
    rerender(<Matrix facts={next} />);
    expect(heads(container)).toEqual(["2024", "2026", "2027", "Total"]);
    expect(sums(container)).toEqual(["1", "23", "4", "28"]);
  });

  it("shows subtotals in a group header", () => {
    const { container } = render(<Matrix facts={FACTS} grouped />);
    const bands = Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-line='header']"));
    const texts = bands.map((tr) => Array.from(tr.cells).map((c) => c.textContent?.trim()));
    expect(texts).toHaveLength(2);
    const south = texts.find((t) => t[0]?.includes("South"))!;
    const north = texts.find((t) => t[0]?.includes("North"))!;
    expect(south.slice(-3)).toEqual(["15", "20", "35"]);
    expect(north.slice(-3)).toEqual(["7", "3", "10"]);
  });
});
