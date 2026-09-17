import { Pagination, useTable } from "../../../src";

export const title = "Paging";

/* `Pagination` puts a paging bar under the table, wherever it stands in the
   JSX. The page size comes from `pageSize` on the hook, the selectable ones from
   `pageSizes`. Search, filters, sorting and a new page size reset to page one,
   and a page that no longer exists after a filter is clamped to the last one. */

interface Movement {
  number: string;
  item: string;
  quantity: number;
}

const ITEMS = ["Flange DN 50", "Bearing cap", "Shaft Ø 32", "Bush 20/25", "Key 8×7"];

const MOVEMENTS: Movement[] = Array.from({ length: 23 }, (_, i) => ({
  number: `B-${String(4101 + i)}`,
  item: ITEMS[i % ITEMS.length]!,
  quantity: 10 + ((i * 37) % 190),
}));

export default function Paging() {
  const { Table, Column } = useTable(MOVEMENTS, { rowKey: (m) => m.number, pageSize: 5 });

  return (
    <Table ariaLabel="Stock movements">
      <Column value="number" label="Movement" rowHeader />
      <Column value="item" label="Item" />
      <Column value="quantity" label="Quantity" />
      <Pagination pageSizes={[5, 10, 25]} />
    </Table>
  );
}
