import { useTable } from "../../../src";

export const title = "Fit long values";
export const lead = "Long text wraps in its cell; give a column a `width` to start from, and a table wider than its place scrolls in its own frame.";

interface Shipment {
  id: string;
  customer: string;
  address: string;
  instructions: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  {
    id: "FP-1004210",
    customer: "Holloway Garden Supplies and Landscaping Cooperative",
    address: "Unit 14, Riverside Trading Estate, Old Weir Lane",
    instructions: "Deliver to the goods entrance at the back; ring twice, the bell in front is out of order.",
    weight: 18.4,
  },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", address: "2 Market Square", instructions: "", weight: 2.1 },
  {
    id: "FP-1004236",
    customer: "Brixley Cycles",
    address: "88 Canal Street",
    instructions: "Leave with the neighbour at number 90 if closed.",
    weight: 23.7,
  },
];

export default function LongValues() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments with delivery instructions">
      <Column value="id" label="Shipment" rowHeader width={120} />
      <Column value="customer" label="Customer" width={200} />
      <Column value="address" label="Address" width={200} />
      <Column value="instructions" label="Instructions" width={280} sortable={false} />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} width={110} />
    </Table>
  );
}
