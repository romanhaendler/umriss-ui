import { Pagination, Toolbar, useTable } from "../../../src";

export const title = "Select a whole group";
export const lead = "The checkbox in a group header selects all its rows, on other pages and in folded groups too; a bulk action receives the list.";

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
  { id: "FP-1004249", tour: "T-01", customer: "Tamsin's Bakery", weight: 6.5 },
  { id: "FP-1004483", tour: "T-02", customer: "Northfold Office", weight: 9.8 },
  { id: "FP-1004496", tour: "T-02", customer: "Ashcombe Dental", weight: 3.2 },
  { id: "FP-1004730", tour: "T-03", customer: "Pellham Hardware", weight: 214 },
  { id: "FP-1004743", tour: "T-03", customer: "Greywick Studio", weight: 188.5 },
];

export default function WholeGroup() {
  const { Table, Column, RowActions, Action } = useTable(SHIPMENTS, {
    rowKey: (s) => s.id,
    defaultGrouping: "tour",
    pageSize: 5,
  });
  return (
    <Table ariaLabel="Shipments to reschedule" selectable>
      <Toolbar />
      <Pagination pageSizes={[5, 10]} />
      <Column value="tour" label="Tour" />
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} aggregate="sum" />
      <RowActions>
        <Action bulk onSelect={(shipments) => window.alert(`Rescheduled: ${shipments.map((s) => s.id).join(", ")}`)}>
          Reschedule
        </Action>
      </RowActions>
    </Table>
  );
}
