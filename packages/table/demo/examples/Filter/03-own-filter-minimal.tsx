import { Checkbox } from "@umriss-ui/core";
import { columnFilter, useTable } from "../../../src";

export const title = "The smallest filter of one's own";

/* A filter of one's own needs three things, and two of them are one line long
   here: `matches` says whether a value satisfies the condition, `describe` names
   it in the table toolbar, and `Input` is what stands in the panel - here a
   single checkbox.

   Everything else comes from the table, for this filter as for the built-in
   ones: the funnel in the header, the panel with "Reset" and "Done", the
   condition with its cross, the ratio of matches and the way back.

   The condition here is `true` or none - `setCondition(null)` lifts it. An
   absent value satisfies no condition of one's own, and `matches` never gets to
   see it. The cutoff date is fixed so that the example looks the same every day;
   in an application `new Date()` would stand there. */

const CUTOFF = new Date(2026, 8, 20);

const overdue = columnFilter<Date, true>({
  matches: (due) => due.getTime() < CUTOFF.getTime(),
  Input: ({ condition, setCondition }) => (
    <Checkbox
      label="Overdue only"
      checked={condition === true}
      onChange={(event) => setCondition(event.target.checked ? true : null)}
    />
  ),
  describe: () => "overdue",
});

interface Order {
  number: string;
  customer: string;
  due: Date;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", due: new Date(2026, 8, 3) },
  { number: "A-2042", customer: "Keller & Sons", due: new Date(2026, 8, 12) },
  { number: "A-2043", customer: "Northworks", due: new Date(2026, 8, 24) },
  { number: "A-2044", customer: "Hofmann Drives", due: new Date(2026, 8, 18) },
  { number: "A-2045", customer: "Lindner Hydraulics", due: new Date(2026, 9, 2) },
];

export default function OwnFilterMinimal() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="due" label="Due date" format="date" filter={overdue} />
    </Table>
  );
}
