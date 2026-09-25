import { useTable } from "../../../src";

export const title = "Group dates by month";
export const lead = "`group=\"month\"` brings each date to the start of its month; \"day\", \"week\" and \"year\" work the same, and the cells keep the full date.";

interface Invoice {
  id: string;
  supplier: string;
  received: Date;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0102", supplier: "Pennock Energy", received: new Date(2026, 0, 9), amount: 3420 },
  { id: "INV-26-0131", supplier: "Castrel Hosting", received: new Date(2026, 0, 28), amount: 2890 },
  { id: "INV-26-0204", supplier: "Brandlow Office Supply", received: new Date(2026, 1, 4), amount: 860 },
  { id: "INV-26-0221", supplier: "Stellbrook Consulting", received: new Date(2026, 1, 21), amount: 8700 },
  { id: "INV-26-0226", supplier: "Corrin Travel", received: new Date(2026, 1, 26), amount: 8117.2 },
  { id: "INV-26-0309", supplier: "Nimbrel Software", received: new Date(2026, 2, 9), amount: 7288 },
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", received: new Date(2026, 2, 16), amount: 1951.24 },
];

export default function ByMonth() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: "received" });
  return (
    <Table ariaLabel="Invoices by month received">
      <Column value="received" label="Received" format="date" group="month" />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
    </Table>
  );
}
