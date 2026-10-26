/* Sums from the server: `totals` fill the footer's aggregates over every
   match; the rows on the page do not enter them. */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTable } from "../src";
import type { TableRequest } from "../src";

interface Row {
  id: string;
  amount: number;
  day: Date;
}

const rows: Row[] = [
  { id: "a", amount: 1, day: new Date(2026, 0, 5) },
  { id: "b", amount: 2, day: new Date(2026, 0, 9) },
];

function Server({ totals, loading, answers }: { totals?: Record<string, unknown>; loading?: boolean; answers?: TableRequest }) {
  const t = useTable(rows, {
    rowKey: (r) => r.id,
    server: true,
    rowCount: 100,
    onRequest: () => {},
    ...(totals ? { totals } : {}),
    ...(answers ? { answers } : {}),
  });
  const { Table: Frame, Column } = t;
  return (
    <Frame aria-label="Orders" loading={loading}>
      <Column value="id" label="Id" rowHeader aggregate="count" />
      <Column value="amount" label="Amount" aggregate="sum" />
      <Column value="day" label="Day" format="date" aggregate="range" />
    </Frame>
  );
}

const cell = (kind: string) => document.querySelector(`tfoot [data-footer="${kind}"]`) as HTMLElement | null;

describe("totals", () => {
  it("shows no footer without totals", () => {
    render(<Server />);
    expect(document.querySelector("tfoot")).toBeNull();
  });

  it("writes the server's values, not the page's", () => {
    render(<Server totals={{ id: 100, amount: 1234.5, day: [new Date(2026, 0, 1), new Date(2026, 5, 30)] }} />);
    expect(cell("sum")?.textContent).toContain("1,234.5");
    expect(cell("count")?.textContent).toContain("100");
    expect(cell("range")?.textContent).toContain("01/01–30/06");
    expect(cell("sum")?.textContent).toContain("All matches");
  });

  it("shows a missing key as absent", () => {
    render(<Server totals={{ id: 100 }} />);
    expect(cell("sum")?.textContent).toContain("No value");
  });

  it("is skeleton while busy, never the old sums", () => {
    render(<Server totals={{ id: 100, amount: 99 }} loading />);
    expect(cell("sum")?.textContent).not.toContain("99");
    expect(cell("sum")?.querySelector("[class*=skeleton]")).not.toBeNull();
    expect(screen.queryByText(/99/)).toBeNull();
  });
});
