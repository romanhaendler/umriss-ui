import { useTable } from "../../../src";

export const title = "Group by one column";
export const lead = "`defaultGrouping` names a column; each tour gets a header row with its count and the sum under the weight column.";

interface Shipment {
  id: string;
  tour: string;
  customer: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", tour: "T-01", customer: "Holloway Garden Supplies", weight: 12.4 },
  { id: "FP-1004223", tour: "T-01", customer: "Oakridge Pharmacy", weight: 2.1 },
  { id: "FP-1004236", tour: "T-01", customer: "Brixley Cycles", weight: 18.9 },
  { id: "FP-1004470", tour: "T-02", customer: "Tamsin's Bakery", weight: 6.5 },
  { id: "FP-1004483", tour: "T-02", customer: "Northfold Office", weight: 9.8 },
  { id: "FP-1004730", tour: "T-03", customer: "Pellham Hardware", weight: 214.0 },
  { id: "FP-1004743", tour: "T-03", customer: "Greywick Studio", weight: 188.5 },
];

export default function OneLevel() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, defaultGrouping: "tour" });
  return (
    <Table ariaLabel="Shipments by tour">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="tour" label="Tour" />
      <Column value="customer" label="Customer" />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} aggregate="sum" />
    </Table>
  );
}
