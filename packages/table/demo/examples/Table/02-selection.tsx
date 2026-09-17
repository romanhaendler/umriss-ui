import { Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Selection: “all” means the filtered set";

/* `selectable` adds the selection column - nobody places it by hand.

   The box in the header selects what search and filters leave over: not the page
   and not what is rendered. What was selected outside before stays selected but
   does not count in the table toolbar - a bulk action acts on what is to be
   seen.

   To try it: search for "North", select all, clear the search. */

interface Order {
  number: string;
  customer: string;
  line: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", line: "Line 1" },
  { number: "A-2042", customer: "Northworks", line: "Line 2" },
  { number: "A-2043", customer: "Keller & Sons", line: "Line 1" },
  { number: "A-2044", customer: "Northplate", line: "Line 3" },
  { number: "A-2045", customer: "Hofmann Drives", line: "Line 2" },
  { number: "A-2046", customer: "Northworks", line: "Line 3" },
];

export default function Selection() {
  const t = useTable(ORDERS, { rowKey: (o) => o.number });
  const { Table, Column } = t;
  const inTheSet = t.filtered.filter((o) => t.selection.isSelected(o.number)).length;

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Orders">
        <Toolbar>
          <Search placeholder="Search customer" />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="line" label="Line" />
      </Table>
      <Text size="xs" tone="muted">
        {t.selection.count} selected, {inTheSet} of them in the filtered set.
      </Text>
    </Stack>
  );
}
