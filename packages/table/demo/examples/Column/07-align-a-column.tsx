import { Badge, Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Align a column";
export const lead =
  "`align` sets the side of the whole column - head label with its tools, values, footer - to `\"start\"`, `\"center\"` or `\"end\"`. `numeric` keeps deciding the figures: a number column can stand left or centred in tabular figures, a text column flush right without them. A centred value or label wider than its column is cut at the end.";

interface Part {
  sku: string;
  state: "OK" | "LOW" | "OUT";
  bin: string;
  stock: number;
  lot: number;
  supplier: string;
}

const TONE = { OK: "success", LOW: "warning", OUT: "danger" } as const;

const PARTS: Part[] = [
  { sku: "BR-2041", state: "OK", bin: "A1", stock: 120, lot: 40871, supplier: "Holloway Garden Supplies" },
  { sku: "BR-2042", state: "LOW", bin: "A12", stock: 4, lot: 40872, supplier: "Oakridge Pharmacy" },
  { sku: "BR-2057", state: "OK", bin: "C3", stock: 38, lot: 40873, supplier: "Brixley Cycles" },
  { sku: "BR-2063", state: "OUT", bin: "D14", stock: 0, lot: 40874, supplier: "Nimbrel Software" },
];

export default function AlignAColumn() {
  const { Table, Column } = useTable(PARTS, { rowKey: (p) => p.sku });
  return (
    <Stack gap={3}>
      <Table aria-label="Parts">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <Column value="sku" label="Part" rowHeader />
        <Column value="state" label="State" align="center" width={110} sortable filter="list">
          {(s) => <Badge tone={TONE[s]}>{s}</Badge>}
        </Column>
        <Column value="bin" label="Bin" align="center" sortable={false} />
        <Column value="stock" label="Stock" numeric align="center" sortable aggregate="sum" />
        <Column value="lot" label="Lot" align="start" />
        <Column value="supplier" label="Supplier" align="end" width={120} sortable />
      </Table>
      <Text size="xs" tone="muted">
        State and Bin stand centred, Stock centred in tabular figures, Lot is a number that stands left, Supplier is text flush right and cut at its width.
      </Text>
    </Stack>
  );
}
