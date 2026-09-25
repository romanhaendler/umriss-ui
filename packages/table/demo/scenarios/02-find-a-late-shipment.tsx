import { useState } from "react";
import { Badge, Button, ConfirmDialog, Grid, Stack, Text, useFormats } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../../src";
import { DEPOTS, DRIVERS, SHIPMENTS, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";

export const title = "Find a late shipment";

export const lead =
  "A dispatcher at Ferrow Parcel answers a customer's call: finds the shipment, sees whether it missed its window, and tidies the day's list.";

export const callouts = [
  "One click filters to the late shipments from outside the table: the same condition the Punctuality filter sets, shown in the toolbar and removable there.",
  "Search by shipment number or customer; the toolbar names how many of the day's shipments are found, and the footer sums their weight and names the longest delay among them.",
  "The column menu hides and orders columns, and the export writes what is shown, filtered, as CSV.",
  "Notify a customer from the row, or tick shipments and archive them with one confirmation; what happened stands here.",
];

export const builtFrom = [
  "table",
  "filter",
  "search",
  "aggregate",
  "rowdetail",
  "rowactions",
  "pagination",
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "ConfirmDialog", page: "@umriss-ui/core#confirmdialog" },
];

interface Row {
  id: string;
  customer: string;
  tour: string;
  depot: string;
  weight: number;
  status: "Delivered" | "Out for delivery" | "Failed attempt";
  window: readonly [number, number];
  arrival: number;
  /** Minutes after the window closed; `null` when inside it. */
  delay: number | null;
  driver: string;
  plate: string;
}

const STATUS = { delivered: "Delivered", "out for delivery": "Out for delivery", "failed attempt": "Failed attempt" } as const;
const TONE = { Delivered: "success", "Out for delivery": "accent", "Failed attempt": "danger" } as const;

/* The shipment, joined with its stop and its tour. */
const START: Row[] = SHIPMENTS.map((shipment) => {
  const tour = TOURS.find((t) => t.id === shipment.tour)!;
  const stop = tour.stops.find((s) => s.shipment === shipment.id)!;
  const late = stop.arrival - stop.window[1];
  return {
    id: shipment.id,
    customer: shipment.customer,
    tour: tour.id,
    depot: DEPOTS.find((d) => d.id === tour.depot)!.name,
    weight: shipment.weight,
    status: STATUS[shipment.status],
    window: stop.window,
    arrival: stop.arrival,
    delay: late > 0 ? late / 60_000 : null,
    driver: DRIVERS.find((d) => d.id === tour.driver)!.name,
    plate: VEHICLES.find((v) => v.id === tour.vehicle)!.plate,
  };
});

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

function Detail({ row }: { row: Row }) {
  const formats = useFormats();
  return (
    <Grid minItemWidth="160px" gap={4}>
      <Fact name="Window" value={`${formats.time(new Date(row.window[0]), false)}–${formats.time(new Date(row.window[1]), false)}`} />
      <Fact name="Arrival" value={formats.time(new Date(row.arrival), false)} />
      <Fact name="Driver" value={row.driver} />
      <Fact name="Vehicle" value={row.plate} />
    </Grid>
  );
}

export default function FindALateShipment() {
  const formats = useFormats();
  const [rows, setRows] = useState(START);
  const [toArchive, setToArchive] = useState<readonly Row[]>([]);
  const [message, setMessage] = useState("No action yet.");

  const t = useTable(rows, {
    rowKey: (r) => r.id,
    pageSize: 10,
    defaultSort: { column: "id", direction: "asc" },
  });
  const { Table, Column, RowDetail, RowActions, Action } = t;

  const late = rows.filter((r) => r.delay !== null).length;

  const archive = () => {
    setRows((previous) => previous.filter((r) => !toArchive.includes(r)));
    t.selection.clear();
    setMessage(`${toArchive.map((r) => r.id).join(", ")} archived`);
    setToArchive([]);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap>
        <span data-callout="1">
          <Button size="sm" onClick={() => t.setFilter("punctuality", ["Late"])}>
            {late} late
          </Button>
        </span>
        <Button size="sm" variant="ghost" onClick={() => t.setFilter("punctuality", null)}>
          All shipments
        </Button>
      </Stack>

      <Table selectable ariaLabel="Shipments">
        <Toolbar>
          <span data-callout="2">
            <Search placeholder="Shipment or customer" />
          </span>
          <span data-callout="3">
            <ColumnMenu />
          </span>
          <Export filename="shipments.csv" />
        </Toolbar>

        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="tour" label="Tour" />
        <Column value="depot" label="Depot" filter="list" />
        <Column value="weight" label="Weight (kg)" filter="range" aggregate="sum" />
        <Column value="status" label="Status" filter="list">
          {(status) => <Badge tone={TONE[status]}>{status}</Badge>}
        </Column>
        <Column id="window" label="Window" value={(r) => r.window[0]}>
          {(_, r) => `${formats.time(new Date(r.window[0]), false)}–${formats.time(new Date(r.window[1]), false)}`}
        </Column>
        <Column id="punctuality" label="Punctuality" value={(r) => (r.delay === null ? "On time" : "Late")} filter="list">
          {(word) => (word === "Late" ? <Badge tone="warning">Late</Badge> : word)}
        </Column>
        <Column value="delay" label="Delay (min)" aggregate="max" />

        <RowDetail>{(r) => <Detail row={r} />}</RowDetail>
        <RowActions>
          <Action onSelect={(r) => setMessage(`${r.id}: ${r.customer} notified`)}>Notify</Action>
          <Action bulk tone="danger" onSelect={(list) => setToArchive(list)}>
            Archive
          </Action>
        </RowActions>

        <Pagination pageSizes={[10, 25, 50]} />
      </Table>

      <span data-callout="4">
        <Text size="sm" tone="secondary" role="status">
          {message}
        </Text>
      </span>

      <ConfirmDialog
        open={toArchive.length > 0}
        onClose={() => setToArchive([])}
        onConfirm={archive}
        title={toArchive.length === 1 ? "Archive one shipment?" : `Archive ${toArchive.length} shipments?`}
        description="Archived shipments disappear from the day's list."
        confirmLabel="Archive"
        tone="danger"
      />
    </Stack>
  );
}
