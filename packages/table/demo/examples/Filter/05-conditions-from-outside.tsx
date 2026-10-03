import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Set a condition from outside the table";
export const lead = "`t.setFilter` sets a condition from a quick filter or a link, `null` lifts it; `t.view` carries it for `initialView` to restore.";

const TONE = { delivered: "success", "out for delivery": "accent", "failed attempt": "danger" } as const;

type Status = keyof typeof TONE;

interface Shipment {
  id: string;
  customer: string;
  status: Status;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", status: "delivered" },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", status: "failed attempt" },
  { id: "FP-1004236", customer: "Brixley Cycles", status: "out for delivery" },
  { id: "FP-1004249", customer: "Tamsin's Bakery", status: "delivered" },
  { id: "FP-1004262", customer: "Pellham Hardware", status: "failed attempt" },
  { id: "FP-1004275", customer: "Greywick Studio", status: "out for delivery" },
];

const QUICK_FILTERS: readonly Status[] = ["out for delivery", "failed attempt"];

/* The table holds the condition; the buttons only ask it to change and read
   `t.filter` to show which one stands. That is why the column's funnel, the
   chip in the toolbar, "Reset" and `t.view` all agree with them without a
   line of synchronisation. `setFilter` takes the
   condition of the column's filter - for `filter="list"` the chosen values -
   and passes over a column that has none, with a warning in development.
   Something the user may lift belongs here; `preFilter` is for rows the user
   may not see at all. A restriction by no column, or by several fields at
   once, is a row filter (the examples below). */
export default function ConditionsFromOutside() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        {QUICK_FILTERS.map((status) => {
          const active = JSON.stringify(t.filter.status) === JSON.stringify([status]);
          return (
            <Button
              key={status}
              size="sm"
              variant={active ? "primary" : "secondary"}
              aria-pressed={active}
              onClick={() => t.setFilter("status", [status])}
            >
              {SHIPMENTS.filter((s) => s.status === status).length} {status}
            </Button>
          );
        })}
        <Button size="sm" variant="ghost" onClick={() => t.setFilter("status", null)}>
          All statuses
        </Button>
      </Stack>

      <Table ariaLabel="Shipments">
        <Toolbar>
          <Search placeholder="Shipment or customer" />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="status" label="Status" filter="list">
          {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
        </Column>
      </Table>

      <Stack gap={1}>
        <Text as="span" size="sm" tone="secondary">
          What the application would keep
        </Text>
        <Text as="code" size="sm" mono>
          {JSON.stringify(t.view)}
        </Text>
      </Stack>
    </Stack>
  );
}
