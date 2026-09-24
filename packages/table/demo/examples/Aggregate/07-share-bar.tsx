import { useTable } from "../../../src";

export const title = "The share bar";

/* Under a sum in a band stands a hairline of ink: the group's share of the
   filtered set's sum. Which cost centre dominates is visible without a chart.
   It is on for every `"sum"`; where a share says nothing - hours booked
   against a budget of their own - `share={false}` takes it away. */

interface Invoice {
  id: string;
  costCentre: string;
  supplier: string;
  amount: number;
  hours: number;
}

const INVOICES: Invoice[] = [
  { id: "R-4410", costCentre: "Maintenance", supplier: "Hydraulik Nord", amount: 12480, hours: 32 },
  { id: "R-4411", costCentre: "Maintenance", supplier: "Elektro Fuchs", amount: 3950, hours: 14 },
  { id: "R-4412", costCentre: "Maintenance", supplier: "Hydraulik Nord", amount: 7210, hours: 20 },
  { id: "R-4413", costCentre: "Tooling", supplier: "Werkzeugbau Lang", amount: 28900, hours: 64 },
  { id: "R-4414", costCentre: "Tooling", supplier: "Werkzeugbau Lang", amount: 6400, hours: 12 },
  { id: "R-4415", costCentre: "Quality", supplier: "Messtechnik Ost", amount: 2150, hours: 6 },
];

export default function ShareBar() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id, defaultGrouping: ["costCentre", "supplier"] });
  return (
    <Table ariaLabel="Invoices by cost centre and supplier">
      <Column value="supplier" label="Supplier" />
      <Column value="costCentre" label="Cost centre" />
      <Column value="id" label="Invoice" rowHeader />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} aggregate="sum" />
      <Column value="hours" label="Hours" aggregate="sum" share={false} />
    </Table>
  );
}
