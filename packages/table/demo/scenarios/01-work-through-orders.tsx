import { useState } from "react";
import { Badge, Button, ConfirmDialog, Grid, Sparkline, Stack, Text, useFormats } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../../src";

export const title = "Work through the open orders";

export const lead =
  "A clerk searches, sorts and exports the day's orders and cancels the ones that are wrong.";

export const callouts = [];

export const builtFrom = ["table", { name: "Badge", page: "@umriss-ui/core#badge" }, { name: "ConfirmDialog", page: "@umriss-ui/core#confirmdialog" }];

/* The order list this interface was built for - the sketch from the spec of
   @umriss-ui/table, running.

   Table toolbar with search, column menu and export; list filters on line and
   status, a range filter on the quantity and a quick filter that filters from
   outside; a sum and an average over the filtered set; a measured value read
   against its limits; a computed value; a history that has presentation only;
   selection, row detail, an action at the row and a bulk action; paging.

   They are not features side by side but one state. The search changes the sum,
   the selection the table toolbar, the column menu the export. Operation: a
   click on a header sorts, with Shift or the meta key a level is added.

   The field names of the limit set stay German: it is the wire format
   @umriss-ui/core and @umriss-ui/charts agree on. */

interface Order {
  number: string;
  customer: string;
  line: string;
  quantity: number;
  load: number;
  reading: number | null;
  target: number;
  status: "Open" | "In progress" | "Blocked" | "Done";
  history: number[];
  due: Date;
  responsible: string;
}

const LIMITS: LimitSet = {
  target: 12,
  limits: [
    { value: 12.4, side: "upper", severity: "warning" },
    { value: 12.6, side: "upper", severity: "alarm" },
    { value: 11.6, side: "lower", severity: "warning" },
    { value: 11.4, side: "lower", severity: "alarm" },
  ],
};

const TONE = { Open: "neutral", "In progress": "accent", Blocked: "danger", Done: "success" } as const;

const START: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", line: "Line 1", quantity: 120, load: 0.82, reading: 12.08, target: 12, status: "In progress", history: [52, 61, 58, 70, 74, 82], due: new Date(2026, 2, 20), responsible: "M. Weber" },
  { number: "A-2042", customer: "Keller & Sons", line: "Line 2", quantity: 48, load: 0.64, reading: 12.47, target: 12, status: "Open", history: [30, 34, 41, 47, 55, 64], due: new Date(2026, 2, 24), responsible: "J. Fontaine" },
  { number: "A-2043", customer: "Northworks", line: "Line 1", quantity: 1250, load: 0.97, reading: 12.71, target: 12, status: "Blocked", history: [68, 75, 83, 88, 93, 97], due: new Date(2026, 2, 18), responsible: "A. Novak" },
  { number: "A-2044", customer: "Hofmann Drives", line: "Line 3", quantity: 310, load: 0.43, reading: 11.93, target: 12, status: "Done", history: [52, 50, 47, 45, 44, 43], due: new Date(2026, 2, 16), responsible: "S. Lindgren" },
  { number: "A-2045", customer: "Northworks", line: "Line 2", quantity: 560, load: 0.71, reading: null, target: 12, status: "In progress", history: [55, 58, 62, 66, 69, 71], due: new Date(2026, 2, 26), responsible: "K. Tanaka" },
  { number: "A-2046", customer: "Lindner Hydraulics", line: "Line 3", quantity: 96, load: 0.55, reading: 11.52, target: 12, status: "Open", history: [20, 28, 35, 44, 50, 55], due: new Date(2026, 2, 30), responsible: "L. Baumann" },
  { number: "A-2047", customer: "Sauer Conveyors", line: "Line 1", quantity: 240, load: 0.88, reading: 12.02, target: 12, status: "In progress", history: [60, 66, 71, 78, 84, 88], due: new Date(2026, 2, 23), responsible: "P. Silva" },
  { number: "A-2048", customer: "Wagner & Co.", line: "Line 2", quantity: 75, load: 0.31, reading: 11.97, target: 12, status: "Done", history: [40, 38, 36, 33, 31, 31], due: new Date(2026, 2, 13), responsible: "R. Okafor" },
  { number: "A-2049", customer: "Brandt Metalworks", line: "Line 3", quantity: 180, load: 0.91, reading: 12.33, target: 12, status: "In progress", history: [70, 76, 81, 85, 88, 91], due: new Date(2026, 2, 25), responsible: "T. Morel" },
  { number: "A-2050", customer: "Thiel Precision", line: "Line 1", quantity: 64, load: 0.12, reading: 11.38, target: 12, status: "Blocked", history: [42, 38, 25, 12, 4, 12], due: new Date(2026, 2, 19), responsible: "M. Weber" },
  { number: "A-2051", customer: "Keller & Sons", line: "Line 2", quantity: 420, load: 0.76, reading: 12.11, target: 12, status: "Open", history: [58, 62, 64, 69, 73, 76], due: new Date(2026, 3, 2), responsible: "J. Fontaine" },
  { number: "A-2052", customer: "Maurer Steelworks", line: "Line 3", quantity: 150, load: 0.58, reading: 12.05, target: 12, status: "Done", history: [50, 52, 55, 57, 58, 58], due: new Date(2026, 2, 12), responsible: "A. Novak" },
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

function Detail({ order }: { order: Order }) {
  const formats = useFormats();
  return (
    <Grid minItemWidth="160px" gap={4}>
      <Fact name="Due date" value={formats.date(order.due)} />
      <Fact name="Target" value={`${formats.number(order.target, 2)} mm`} />
      <Fact name="Responsible" value={order.responsible} />
    </Grid>
  );
}

export default function Demonstration() {
  const [orders, setOrders] = useState(START);
  const [toArchive, setToArchive] = useState<readonly Order[]>([]);
  const [message, setMessage] = useState("No action yet.");

  const t = useTable(orders, {
    rowKey: (o) => o.number,
    pageSize: 5,
    defaultSort: { column: "number", direction: "asc" },
  });
  const { Table, Column, VerdictColumn, RowDetail, RowActions, Action } = t;

  const blocked = orders.filter((o) => o.status === "Blocked").length;

  const archive = () => {
    setOrders((previous) => previous.filter((o) => !toArchive.includes(o)));
    t.selection.clear();
    setMessage(`${toArchive.map((o) => o.number).join(", ")} archived`);
    setToArchive([]);
  };

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Orders">
        <Toolbar>
          <Search placeholder="Order or customer" />
          <ColumnMenu />
          <Export filename="orders.csv" />
        </Toolbar>

        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="line" label="Line" filter="list" />
        <Column value="quantity" label="Quantity" filter="range" aggregate="sum" />
        <VerdictColumn value="reading" label="Reading" limits={LIMITS} format={{ decimals: 2 }} />
        <Column value="status" label="Status" filter="list">
          {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
        </Column>
        <Column
          id="deviation"
          label="Deviation"
          value={(o) => (o.reading === null ? null : o.reading - o.target)}
          format={{ decimals: 2 }}
          aggregate="avg"
        />
        <Column id="trend" label="Trend" value={(o) => o.history}>
          {(history) => <Sparkline data={history} width={72} />}
        </Column>

        <RowDetail>{(o) => <Detail order={o} />}</RowDetail>
        <RowActions>
          <Action onSelect={(o) => setMessage(`${o.number} opened`)}>Open</Action>
          <Action bulk tone="danger" onSelect={(list) => setToArchive(list)}>
            Archive
          </Action>
        </RowActions>

        <Pagination pageSizes={[5, 10, 25]} />
      </Table>


      {/* A quick filter filters from outside: `t.setFilter` sets the same
          condition the filter in the header sets, and it appears in the table
          toolbar. */}
      <Stack direction="row" gap={2} wrap>
        <Button size="sm" onClick={() => t.setFilter("status", ["Blocked"])}>
          {blocked} blocked
        </Button>
        <Button size="sm" variant="ghost" onClick={() => t.setFilter("status", null)}>
          All statuses
        </Button>
      </Stack>

      <Text size="sm" tone="secondary" role="status">
        {message}
      </Text>

      {/* A bulk action always receives a list: three orders are one
          confirmation, not three. */}
      <ConfirmDialog
        open={toArchive.length > 0}
        onClose={() => setToArchive([])}
        onConfirm={archive}
        title={toArchive.length === 1 ? "Archive one order?" : `Archive ${toArchive.length} orders?`}
        description="Archived orders disappear from this list."
        confirmLabel="Archive"
        tone="danger"
      />
    </Stack>
  );
}
