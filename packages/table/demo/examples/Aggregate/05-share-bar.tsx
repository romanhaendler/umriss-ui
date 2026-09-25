import { useTable } from "../../../src";

export const title = "Show each group's share";
export const lead = "Under a group's sum stands a thin bar for its share of the whole; `share={false}` takes it away where a share says nothing.";

interface Invoice {
  id: string;
  costCentre: string;
  supplier: string;
  amount: number;
  lines: number;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", costCentre: "Facilities", supplier: "Brandlow Office Supply", amount: 1951.24, lines: 3 },
  { id: "INV-26-0312", costCentre: "Facilities", supplier: "Hartwell Cleaning", amount: 2400, lines: 1 },
  { id: "INV-26-0301", costCentre: "Facilities", supplier: "Brandlow Office Supply", amount: 860, lines: 1 },
  { id: "INV-26-0317", costCentre: "Marketing", supplier: "Kettering & Shaw Events", amount: 15_110, lines: 2 },
  { id: "INV-26-0296", costCentre: "Marketing", supplier: "Lumen Print", amount: 1940, lines: 4 },
  { id: "INV-26-0309", costCentre: "IT", supplier: "Nimbrel Software", amount: 7288, lines: 2 },
];

export default function ShareBar() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: ["costCentre", "supplier"] });
  return (
    <Table ariaLabel="Invoices by cost centre and supplier">
      <Column value="supplier" label="Supplier" />
      <Column value="costCentre" label="Cost centre" />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
      <Column value="lines" label="Lines" aggregate="sum" share={false} />
    </Table>
  );
}
