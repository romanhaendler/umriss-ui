import { useTable } from "../../../src";

export const title = "Without a paging bar: every row";

/* A table pages only where a `Pagination` stands. Without one it shows the whole
   filtered set - even with a `pageSize` on the hook, which takes effect only
   once there is a paging bar to page with.

   A table that stops quietly at the tenth row because nobody put a paging bar
   there is a trap. Here twelve rows stand at `pageSize: 5`. */

interface Movement {
  number: string;
  quantity: number;
}

const MOVEMENTS: Movement[] = Array.from({ length: 12 }, (_, i) => ({
  number: `B-${String(4201 + i)}`,
  quantity: 10 + ((i * 53) % 170),
}));

export default function WithoutABar() {
  const { Table, Column } = useTable(MOVEMENTS, { rowKey: (m) => m.number, pageSize: 5 });

  return (
    <Table density="compact" ariaLabel="Stock movements without a paging bar">
      <Column value="number" label="Movement" rowHeader />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}
