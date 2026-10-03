import { Button, Stack, Switch, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Pin and size from controls of your own";
export const lead = "`t.setPin` pins a column or, with `null`, unpins it; `t.setWidth` sets a width and `undefined` takes it back. `t.pinned` and `t.widths` say how the columns stand, a dragged grip included.";

/* The minimum width comes from the application's stylesheet, so that the
   table scrolls sideways and a pinned column has something to hold against. */
const STYLE = `
.delivery-notes table {
  min-width: 1100px;
}
`;

interface Shipment {
  id: string;
  customer: string;
  town: string;
  window: string;
  weight: number;
  note: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", town: "Ashcombe", window: "08:00–10:00", weight: 23, note: "Goods entrance at the back, ring twice" },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", town: "Oakridge", window: "08:00–10:00", weight: 4, note: "Cold chain, hand over in person" },
  { id: "FP-1004236", customer: "Brixley Cycles", town: "Brixley", window: "10:00–12:00", weight: 14, note: "Leave with the neighbour at number 90 if the shop is closed" },
  { id: "FP-1004249", customer: "Tamsin's Bakery", town: "Pellham", window: "06:00–08:00", weight: 31, note: "Before opening, side door" },
];

export default function PinAndSizeFromControls() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column } = t;
  const wide = t.widths.note === 420;

  return (
    <Stack gap={3}>
      <style>{STYLE}</style>
      <Stack direction="row" gap={4} align="center" wrap>
        <Switch
          label="Keep the customer in view"
          checked={t.pinned.customer === "start"}
          onChange={(event) => t.setPin("customer", event.target.checked ? "start" : null)}
        />
        <Button size="sm" onClick={() => t.setWidth("note", wide ? undefined : 420)}>
          {wide ? "Note back to its width" : "Widen the note"}
        </Button>
        <Text size="sm" tone="secondary">
          Note: {t.widths.note} px
        </Text>
      </Stack>
      <Table className="delivery-notes" ariaLabel="Shipments with a note">
        <Column value="id" label="Shipment" rowHeader width={120} />
        <Column value="customer" label="Customer" width={200} />
        <Column value="town" label="Town" width={120} />
        <Column value="window" label="Window" width={120} />
        <Column value="weight" label="Weight (kg)" width={110} />
        <Column value="note" label="Note" resizable sortable={false} width={180} />
      </Table>
    </Stack>
  );
}
