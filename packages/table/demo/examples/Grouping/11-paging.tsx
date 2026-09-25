import { Pagination, useTable } from "../../../src";

export const title = "Page through groups";
export const lead = "A page counts header rows and rows alike; a page that begins inside a group repeats its header, marked as continued. Turn to page two.";

interface Invoice {
  id: string;
  costCentre: string;
  supplier: string;
  amount: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", costCentre: "Facilities", supplier: "Brandlow Office Supply", amount: 1056.24 },
  { id: "INV-26-0301", costCentre: "Facilities", supplier: "Brandlow Office Supply", amount: 860 },
  { id: "INV-26-0312", costCentre: "Facilities", supplier: "Hartwell Cleaning", amount: 2400 },
  { id: "INV-26-0290", costCentre: "Facilities", supplier: "Pennock Energy", amount: 3180 },
  { id: "INV-26-0262", costCentre: "Facilities", supplier: "Pennock Energy", amount: 3420 },
  { id: "INV-26-0231", costCentre: "Facilities", supplier: "Pennock Energy", amount: 3610 },
  { id: "INV-26-0309", costCentre: "IT", supplier: "Castrel Hosting", amount: 2890 },
  { id: "INV-26-0299", costCentre: "IT", supplier: "Kestrel Security", amount: 1200 },
  { id: "INV-26-0293", costCentre: "IT", supplier: "Nimbrel Software", amount: 5508 },
  { id: "INV-26-0271", costCentre: "IT", supplier: "Nimbrel Software", amount: 1780 },
];

export default function Paging() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: ["costCentre", "supplier"], pageSize: 5 });
  return (
    <Table ariaLabel="Invoices, five lines per page">
      <Pagination pageSizes={[5, 10, 25]} />
      <Column value="supplier" label="Supplier" />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="costCentre" label="Cost centre" />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
    </Table>
  );
}
