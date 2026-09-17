import { Badge } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { Table } from "../../../src";

export const title = "A wrapper with of";

/* Where a preset does not suffice - the column brings a presentation with it -
   it becomes a component. It receives the table as `of`, typed with a
   particular row kind, and fetches its `Column` from there. That way the
   compiler checks the wrapper like any other column.

   Two routes do not work, and the wrapper here takes neither. A wrapper generic
   over its rows does not compile:

     function PriorityColumn<R extends { priority: string }>({ of }: { of: Table<R> }) {
       return <of.Column value="priority" label="Priority" />;
       // Error: TypeScript does not resolve the overloads against an open R
     }

   And a wrapper without `of`, which gets its `Column` by some other route, does
   compile but is unchecked. */

interface Order {
  number: string;
  priority: "high" | "normal";
}

const ORDERS: Order[] = [
  { number: "A-2041", priority: "normal" },
  { number: "A-2042", priority: "high" },
  { number: "A-2043", priority: "normal" },
];

function PriorityColumn({ of }: { of: Table<Order> }) {
  return (
    <of.Column value="priority" label="Priority">
      {(priority) => <Badge tone={priority === "high" ? "warning" : "neutral"}>{priority}</Badge>}
    </of.Column>
  );
}

export default function Wrapper() {
  const t = useTable(ORDERS, { rowKey: (o) => o.number });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <PriorityColumn of={t} />
    </Table>
  );
}
