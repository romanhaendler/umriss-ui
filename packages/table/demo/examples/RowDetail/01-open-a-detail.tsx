import { Grid, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Open a detail";

export const lead = "Put a `RowDetail` in the table and each row gets an expander; its function receives the row and returns what stands beneath it.";

interface Shipment {
  id: string;
  customer: string;
  address: string;
  window: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", address: "12 Orchard Lane, Ashcombe", window: "08:00–10:00", weight: 23 },
  { id: "FP-1004223", customer: "Brixley Cycles", address: "4 Station Road, Brixley", window: "08:00–10:00", weight: 14 },
  { id: "FP-1004236", customer: "Pellham Hardware", address: "88 High Street, Pellham", window: "10:00–12:00", weight: 4 },
];

function Fact({ name, value }: { name: string; value: string }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted">
        {name}
      </Text>
      <Text size="sm">{value}</Text>
    </Stack>
  );
}

export default function OpenADetail() {
  const { Table, Column, RowDetail } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <RowDetail>
        {(s) => (
          <Grid minItemWidth="160px" gap={4}>
            <Fact name="Address" value={s.address} />
            <Fact name="Delivery window" value={s.window} />
            <Fact name="Weight" value={`${s.weight} kg`} />
          </Grid>
        )}
      </RowDetail>
    </Table>
  );
}
