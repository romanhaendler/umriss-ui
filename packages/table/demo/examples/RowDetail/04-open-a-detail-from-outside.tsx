import { Button, Grid, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Open a detail from outside the table";
export const lead = "`t.toggleRow` opens a row's detail by its key, or closes it; `t.expanded` holds the keys open now, whoever opened them - the expander or a control of the application's own.";

interface Shipment {
  id: string;
  customer: string;
  address: string;
  window: string;
  attempt: string | null;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", address: "12 Orchard Lane, Ashcombe", window: "08:00–10:00", attempt: null },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", address: "3 Market Square, Oakridge", window: "08:00–10:00", attempt: "Nobody in at 09:12, card left" },
  { id: "FP-1004236", customer: "Brixley Cycles", address: "4 Station Road, Brixley", window: "10:00–12:00", attempt: null },
  { id: "FP-1004262", customer: "Pellham Hardware", address: "88 High Street, Pellham", window: "10:00–12:00", attempt: "Shop closed at 10:40" },
];

const FAILED = SHIPMENTS.filter((s) => s.attempt !== null);

export default function OpenADetailFromOutside() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column, RowDetail } = t;
  const closedFailures = FAILED.filter((s) => !t.expanded.includes(s.id));

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Text size="sm" tone="secondary">
          {FAILED.length} failed attempts
        </Text>
        <Button size="sm" disabled={closedFailures.length === 0} onClick={() => closedFailures.forEach((s) => t.toggleRow(s.id))}>
          Open them
        </Button>
        <Button size="sm" variant="ghost" disabled={t.expanded.length === 0} onClick={() => t.expanded.forEach((key) => t.toggleRow(key))}>
          Close all details
        </Button>
      </Stack>
      <Table ariaLabel="Shipments">
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="window" label="Window" />
        <RowDetail>
          {(s) => (
            <Grid minItemWidth="160px" gap={4}>
              <Text size="sm">{s.address}</Text>
              <Text size="sm" tone="secondary">
                {s.attempt ?? "No attempt yet"}
              </Text>
            </Grid>
          )}
        </RowDetail>
      </Table>
    </Stack>
  );
}
