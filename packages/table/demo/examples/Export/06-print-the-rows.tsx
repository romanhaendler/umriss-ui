import { Button, Stack } from "@umriss-ui/core";
import { Pagination, Search, Toolbar, useTable } from "../../../src";

export const title = "Print the rows";
export const lead =
  "Nothing to set: a printed table is its rows. The toolbar, the pager, the selection column and the row actions stay off the sheet, the head repeats on every page, and a paged or fitted table prints the page it shows - a virtualised one the rows it has rendered.";

interface Shipment {
  id: string;
  customer: string;
  parcels: number;
  weight: number;
}

const CUSTOMERS = ["Holloway Garden Supplies", "Northgate Florists", "Pellham Hardware", "Northbay Books", "Brixley Cycles"];

const SHIPMENTS: Shipment[] = Array.from({ length: 60 }, (_, i) => ({
  id: `FP-${1004210 + i * 13}`,
  customer: CUSTOMERS[i % CUSTOMERS.length]!,
  parcels: (i % 6) + 1,
  weight: 4 + ((i * 7) % 40) + 0.25,
}));

export default function PrintTheRows() {
  const { Table, Column, RowActions, Action } = useTable(SHIPMENTS, { rowKey: (s) => s.id, pageSize: 40 });

  return (
    <Stack gap={3}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <Table selectable aria-label="Shipments to print">
        <Toolbar>
          <Search placeholder="Search customer" />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="parcels" label="Parcels" />
        <Column value="weight" label="Weight (kg)" format={{ decimals: 2 }} />
        <RowActions>
          <Action onSelect={() => undefined}>Open</Action>
        </RowActions>
        <Pagination pageSizes={[40, 60]} />
      </Table>
    </Stack>
  );
}
