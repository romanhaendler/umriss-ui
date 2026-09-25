import { Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Download a file";

export const lead = "Put an `Export` into the toolbar: the file holds what the user sees – the filtered, sorted rows of every page, in the visible columns.";

interface Shipment {
  id: string;
  customer: string;
  parcels: number;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", parcels: 3, weight: 23.5 },
  { id: "FP-1004223", customer: "Northgate Florists", parcels: 6, weight: 41.25 },
  { id: "FP-1004236", customer: "Pellham Hardware", parcels: 1, weight: 4 },
  { id: "FP-1004249", customer: "Northbay Books", parcels: 2, weight: 18.4 },
];

export default function DownloadAFile() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments">
      <Toolbar>
        <Search placeholder="Search customer" />
        <Export filename="shipments.csv" />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="parcels" label="Parcels" />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 2 }} />
    </Table>
  );
}
