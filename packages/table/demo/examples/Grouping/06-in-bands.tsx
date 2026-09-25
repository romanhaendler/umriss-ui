import { useTable } from "../../../src";

export const title = "Group numbers in bands";
export const lead = "`groupValue` says what to group by instead of the value, here an amount band; bands stand small before large, and cells keep the amount.";

interface Invoice {
  id: string;
  supplier: string;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", amount: 1951.24 },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", amount: 15_110 },
  { id: "INV-26-0309", supplier: "Nimbrel Software", amount: 7288 },
  { id: "INV-26-0302", supplier: "Fenwright Legal", amount: 3770 },
  { id: "INV-26-0296", supplier: "Lumen Print", amount: 640 },
  { id: "INV-26-0290", supplier: "Pennock Energy", amount: 3180 },
  { id: "INV-26-0284", supplier: "Orla Ads", amount: 480 },
];

const band = (amount: number) => (amount < 1000 ? "Small (under €1,000)" : amount < 10_000 ? "Medium (€1,000–9,999)" : "Large (€10,000 and more)");

export default function InBands() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: "size" });
  return (
    <Table ariaLabel="Invoices by size">
      <Column id="size" value={(i) => i.amount} label="Size" groupValue={band} format={{ decimals: 2 }} />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
    </Table>
  );
}
