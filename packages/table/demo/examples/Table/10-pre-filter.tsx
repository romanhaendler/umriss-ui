import { useState } from "react";
import { Select, Stack } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";

export const title = "The pre-filter: which rows the table has";

/* `preFilter` restricts which rows a table has at all - here by plant, elsewhere
   by permission. It may stand in the call.

   It is invisible: no condition, no reset, not in the view. The ratio beside a
   search counts only the orders of the chosen plant, and the list filter "Line"
   offers only lines that occur there - a filter that offered the lines of the
   other plant would give away what the user is not meant to see. A plant without
   orders is empty: nothing was filtered away, so there is nothing to reset
   either.

   A change of plant leaves the page standing, and the table clamps it. Whoever
   wants to begin at page one calls `t.setPage(1)`. */

interface Order {
  number: string;
  plant: string;
  line: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", plant: "North", line: "Line 1", customer: "Brandt Metalworks" },
  { number: "A-2042", plant: "South", line: "Line 3", customer: "Keller & Sons" },
  { number: "A-2043", plant: "North", line: "Line 2", customer: "Northworks" },
  { number: "A-2044", plant: "South", line: "Line 4", customer: "Hofmann Drives" },
  { number: "A-2045", plant: "North", line: "Line 1", customer: "Northworks" },
  { number: "A-2046", plant: "South", line: "Line 3", customer: "Lindner Hydraulics" },
  { number: "A-2047", plant: "North", line: "Line 2", customer: "Sauer Conveyors" },
];

const PLANTS = ["North", "South", "East"];

export default function PreFilter() {
  const [plant, setPlant] = useState("North");
  const { Table, Column } = useTable(ORDERS, {
    rowKey: (o) => o.number,
    pageSize: 3,
    preFilter: (o) => o.plant === plant,
  });

  return (
    <Stack gap={3}>
      <Select selectSize="sm" value={plant} onChange={(event) => setPlant(event.target.value)} aria-label="Plant">
        {PLANTS.map((p) => (
          <option key={p} value={p}>
            Plant {p}
          </option>
        ))}
      </Select>
      <Table ariaLabel="Orders of the plant" empty="This plant has no orders.">
        <Toolbar>
          <Search placeholder="Order or customer" />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="line" label="Line" filter="list" />
        <Column value="customer" label="Customer" />
        <Pagination pageSizes={[3, 10]} />
      </Table>
    </Stack>
  );
}
