import { Grid, Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Detail row";

/* `RowDetail` says what stands under an expanded row. The expander is put there
   by the table itself, named after the row: "expand A-2041".

   Several rows may be open at once, and open stays open even where a search
   makes the row disappear for a moment: expanded is a state of the row key, not
   of the position. The detail row spans all visible columns. */

interface Order {
  number: string;
  customer: string;
  responsible: string;
  due: string;
  note: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", responsible: "M. Weber", due: "20 Mar 2026", note: "Part delivery possible" },
  { number: "A-2042", customer: "Keller & Sons", responsible: "J. Fontaine", due: "24 Mar 2026", note: "Enclose certificate 3.1" },
  { number: "A-2043", customer: "Northworks", responsible: "A. Novak", due: "18 Mar 2026", note: "Call-off in four lots" },
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

export default function DetailRow() {
  const { Table, Column, RowDetail } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Toolbar>
        <Search placeholder="Search customer" />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <RowDetail>
        {(o) => (
          <Grid minItemWidth="160px" gap={4}>
            <Fact name="Responsible" value={o.responsible} />
            <Fact name="Due date" value={o.due} />
            <Fact name="Note" value={o.note} />
          </Grid>
        )}
      </RowDetail>
    </Table>
  );
}
