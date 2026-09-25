import { Search, Toolbar, useTable } from "../../../src";

export const title = "Search within groups";
export const lead = "Grouping comes after search and filters: type “pharmacy” and the tours without one disappear, the counts and sums shrink with them.";

interface Shipment {
  id: string;
  tour: string;
  customer: string;
  status: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", tour: "T-01", customer: "Holloway Garden Supplies", status: "delivered", weight: 12.4 },
  { id: "FP-1004223", tour: "T-01", customer: "Oakridge Pharmacy", status: "delivered", weight: 2.1 },
  { id: "FP-1004236", tour: "T-01", customer: "Brixley Cycles", status: "out for delivery", weight: 18.9 },
  { id: "FP-1004470", tour: "T-02", customer: "Tamsin's Bakery", status: "failed attempt", weight: 6.5 },
  { id: "FP-1004483", tour: "T-02", customer: "Northfold Office", status: "out for delivery", weight: 9.8 },
  { id: "FP-1004730", tour: "T-03", customer: "Pellham Hardware", status: "delivered", weight: 214 },
  { id: "FP-1004756", tour: "T-03", customer: "Oakridge Pharmacy", status: "out for delivery", weight: 183.2 },
];

export default function FilterAndSearch() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, defaultGrouping: "tour" });
  return (
    <Table ariaLabel="Shipments by tour, searchable">
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="tour" label="Tour" />
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="status" label="Status" filter="list" />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} aggregate="sum" />
    </Table>
  );
}
