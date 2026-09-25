import { useState } from "react";
import { Select, Stack } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";

export const title = "Restrict which rows a table has";
export const lead = "`preFilter` decides the rows at all, here by depot, elsewhere by permission; it is invisible, never reset, and not in the view.";

interface Shipment {
  id: string;
  depot: string;
  tour: string;
  customer: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", depot: "North depot", tour: "T-01", customer: "Holloway Garden Supplies" },
  { id: "FP-1004223", depot: "Riverside depot", tour: "T-04", customer: "Oakridge Pharmacy" },
  { id: "FP-1004236", depot: "North depot", tour: "T-02", customer: "Brixley Cycles" },
  { id: "FP-1004249", depot: "Riverside depot", tour: "T-05", customer: "Tamsin's Bakery" },
  { id: "FP-1004262", depot: "North depot", tour: "T-01", customer: "Pellham Hardware" },
  { id: "FP-1004275", depot: "Riverside depot", tour: "T-04", customer: "Greywick Studio" },
  { id: "FP-1004288", depot: "North depot", tour: "T-03", customer: "Juniper Lane Florist" },
];

const DEPOTS = ["North depot", "Riverside depot", "East Gate depot"];

export default function PreFilter() {
  const [depot, setDepot] = useState("North depot");
  const { Table, Column } = useTable(SHIPMENTS, {
    rowKey: (s) => s.id,
    pageSize: 3,
    preFilter: (s) => s.depot === depot,
  });

  return (
    <Stack gap={3}>
      <Select selectSize="sm" value={depot} onChange={(event) => setDepot(event.target.value)} aria-label="Depot">
        {DEPOTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <Table ariaLabel="Shipments of the depot" empty="This depot has no shipments today.">
        <Toolbar>
          <Search placeholder="Shipment or customer" />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="tour" label="Tour" filter="list" />
        <Column value="customer" label="Customer" />
        <Pagination pageSizes={[3, 10]} />
      </Table>
    </Stack>
  );
}
