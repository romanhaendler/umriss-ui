import { useMemo } from "react";
import { useTable } from "../../../src";

export const title = "Totals that stay in view";
export const lead = "With `stickyHeader` the footer of totals sticks to the bottom of the scroll area, as the head sticks to the top - over virtual rows and beside pinned columns.";

const STYLE = `
.totals-log table {
  min-width: 900px;
}
`;

interface Order {
  id: string;
  customer: string;
  region: string;
  units: number;
  amount: number;
}

const CUSTOMERS = ["Nordwind", "Lindqvist", "Kessler & Sohn", "Alder", "Brandt", "Costa"] as const;
const REGIONS = ["North", "South", "East", "West"] as const;

const orders: Order[] = Array.from({ length: 5_000 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(5, "0")}`,
  customer: CUSTOMERS[i % CUSTOMERS.length]!,
  region: REGIONS[(i * 7) % REGIONS.length]!,
  units: 1 + ((i * 13) % 40),
  amount: 20 + ((i * 37) % 900),
}));

export default function AFooterThatStays() {
  const rows = useMemo(() => orders, []);
  const t = useTable(rows, { rowKey: (r) => r.id, virtual: true });
  const { Table, Column } = t;
  return (
    <>
      <style>{STYLE}</style>
      <Table className="totals-log" stickyHeader maxHeight="300px" aria-label="Orders">
        <Column value="id" label="Order" rowHeader pin="start" width={130} />
        <Column value="customer" label="Customer" width={160} />
        <Column value="region" label="Region" width={120} />
        <Column value="units" label="Units" aggregate="sum" width={110} />
        <Column value="amount" label="Amount" format={{ decimals: 0 }} aggregate="sum" width={130} pin="end" />
      </Table>
    </>
  );
}
