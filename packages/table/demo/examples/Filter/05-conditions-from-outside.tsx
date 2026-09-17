import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Conditions from outside: setFilter and the view";

/* The filter in the column header is not the only route to a condition.
   `t.setFilter(column, condition)` sets the same one from outside - out of a
   quick filter, a key figure, a link the application interprets itself - and
   `null` lifts it. What is set appears in the table toolbar like any other
   condition and can be lifted there again.

   It is typed against the row's field, not against the column: the columns stand
   in the JSX, and the hook does not see them. For a text field the condition is
   a list of its values, for numbers and points in time a range as well; an id
   that is no field name takes any condition.

   It is read back through `t.filter`. In `t.view.conditions` the same stands as
   part of the view an application can keep - `initialView` gives it back on the
   first render, without the unfiltered table flashing up. */

const TONE = { Open: "neutral", "In progress": "accent", Blocked: "danger", Done: "success" } as const;

type Status = keyof typeof TONE;

interface Order {
  number: string;
  customer: string;
  status: Status;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", status: "In progress" },
  { number: "A-2042", customer: "Keller & Sons", status: "Open" },
  { number: "A-2043", customer: "Northworks", status: "Blocked" },
  { number: "A-2044", customer: "Hofmann Drives", status: "Done" },
  { number: "A-2045", customer: "Lindner Hydraulics", status: "Blocked" },
  { number: "A-2046", customer: "Sauer Conveyors", status: "Open" },
];

const QUICK_FILTERS: readonly Status[] = ["Open", "Blocked"];

export default function ConditionsFromOutside() {
  const t = useTable(ORDERS, { rowKey: (o) => o.number });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        {QUICK_FILTERS.map((status) => (
          <Button key={status} size="sm" onClick={() => t.setFilter("status", [status])}>
            {ORDERS.filter((o) => o.status === status).length} {status.toLowerCase()}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => t.setFilter("status", null)}>
          All statuses
        </Button>
      </Stack>

      <Table ariaLabel="Orders">
        <Toolbar>
          <Search placeholder="Order or customer" />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
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
