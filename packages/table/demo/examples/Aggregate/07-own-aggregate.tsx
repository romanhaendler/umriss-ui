import { useTable } from "../../../src";

export const title = "Write an aggregate of your own";
export const lead = "A function gets the values present and the group's rows and returns a value of the column's type; here a unit price weighted by quantity.";

interface Line {
  id: string;
  costCentre: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const LINES: Line[] = [
  { id: "L-1", costCentre: "Facilities", description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9 },
  { id: "L-2", costCentre: "Facilities", description: "Printer paper, box", quantity: 40, unitPrice: 21.5 },
  { id: "L-3", costCentre: "Facilities", description: "Delivery", quantity: 1, unitPrice: 35 },
  { id: "L-4", costCentre: "IT", description: "Design tool licences", quantity: 12, unitPrice: 459 },
  { id: "L-5", costCentre: "IT", description: "Onboarding session", quantity: 2, unitPrice: 890 },
];

export default function OwnAggregate() {
  const { Table, Column } = useTable(LINES, { rowKey: (l) => l.id, defaultGrouping: "costCentre" });
  return (
    <Table ariaLabel="Invoice lines by cost centre">
      <Column value="costCentre" label="Cost centre" />
      <Column value="description" label="Description" rowHeader />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column
        value="unitPrice"
        label="Unit price (€)"
        format={{ decimals: 2 }}
        aggregate={(_, lines) => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) / lines.reduce((s, l) => s + l.quantity, 0)}
      />
    </Table>
  );
}
