import { Button, Select, Stack } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Group and fold from controls of your own";
export const lead = "`t.setGrouping` groups by what a control of the application chooses, `[]` ungroups; `t.toggleFold` folds one group by its path, and `t.folded` holds the paths folded now.";

interface Shipment {
  id: string;
  tour: string;
  customer: string;
  status: "delivered" | "out for delivery";
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", tour: "T-01", customer: "Holloway Garden Supplies", status: "delivered", weight: 12.4 },
  { id: "FP-1004223", tour: "T-01", customer: "Oakridge Pharmacy", status: "delivered", weight: 2.1 },
  { id: "FP-1004236", tour: "T-01", customer: "Brixley Cycles", status: "delivered", weight: 18.9 },
  { id: "FP-1004470", tour: "T-02", customer: "Tamsin's Bakery", status: "delivered", weight: 6.5 },
  { id: "FP-1004483", tour: "T-02", customer: "Northfold Office", status: "out for delivery", weight: 9.8 },
  { id: "FP-1004730", tour: "T-03", customer: "Pellham Hardware", status: "delivered", weight: 214.0 },
  { id: "FP-1004743", tour: "T-03", customer: "Greywick Studio", status: "delivered", weight: 188.5 },
];

/* A fold is kept by the path of its group. */
const path = (...values: string[]) => JSON.stringify(values.map((v) => `value:${v}`));

/** The tours with nothing left to deliver - what a dispatcher folds away. */
const FINISHED = [...new Set(SHIPMENTS.map((s) => s.tour))].filter((tour) =>
  SHIPMENTS.every((s) => s.tour !== tour || s.status === "delivered"),
);

export default function GroupAndFoldFromControls() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id, defaultGrouping: "tour" });
  const { Table, Column } = t;
  const byTour = t.grouping[0] === "tour";
  const open = FINISHED.filter((tour) => !t.folded.includes(path(tour)));

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Select
          size="sm"
          aria-label="Group by"
          value={t.grouping[0] ?? ""}
          onChange={(event) => t.setGrouping(event.target.value ? [event.target.value] : [])}
        >
          <option value="tour">By tour</option>
          <option value="status">By status</option>
          <option value="">Not grouped</option>
        </Select>
        <Button size="sm" disabled={!byTour || open.length === 0} onClick={() => open.forEach((tour) => t.toggleFold(path(tour)))}>
          Fold finished tours
        </Button>
      </Stack>
      <Table ariaLabel="Shipments by tour">
        <Column value="id" label="Shipment" rowHeader />
        <Column value="tour" label="Tour" />
        <Column value="customer" label="Customer" />
        <Column value="status" label="Status" />
        <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} aggregate="sum" />
      </Table>
    </Stack>
  );
}
