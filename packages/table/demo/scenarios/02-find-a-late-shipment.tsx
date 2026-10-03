import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { Badge, Button, ConfirmDialog, Grid, Stack, Text, useFormats } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, useTable } from "../../src";

/* Data from the logistics world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const MINUTE = 60_000;

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(10, 30);

const DEPOTS = [
  { id: "north", name: "North depot" },
  { id: "river", name: "Riverside depot" },
  { id: "east", name: "East Gate depot" },
] as const;

interface Vehicle {
  id: string;
  plate: string;
  type: "van" | "e-van" | "truck";
  /** Payload, in kg. */
  capacity: number;
  depot: string;
}

const VEHICLES: readonly Vehicle[] = [
  { id: "v1", plate: "FP 214 K", type: "van", capacity: 1200, depot: "north" },
  { id: "v2", plate: "FP 377 K", type: "e-van", capacity: 900, depot: "north" },
  { id: "v3", plate: "FP 118 R", type: "truck", capacity: 7500, depot: "north" },
  { id: "v4", plate: "FP 402 R", type: "van", capacity: 1200, depot: "river" },
  { id: "v5", plate: "FP 455 R", type: "e-van", capacity: 900, depot: "river" },
  { id: "v6", plate: "FP 290 E", type: "van", capacity: 1200, depot: "east" },
  { id: "v7", plate: "FP 311 E", type: "e-van", capacity: 900, depot: "east" },
  { id: "v8", plate: "FP 520 E", type: "truck", capacity: 7500, depot: "east" },
];

const DRIVERS = [
  { id: "d1", name: "Martin Hale", depot: "north" },
  { id: "d2", name: "Nadia Petrova", depot: "north" },
  { id: "d3", name: "Owen Carter", depot: "north" },
  { id: "d4", name: "Lucia Romero", depot: "river" },
  { id: "d5", name: "Ben Adeyemi", depot: "river" },
  { id: "d6", name: "Hanna Berg", depot: "east" },
  { id: "d7", name: "Yusuf Demir", depot: "east" },
  { id: "d8", name: "Clara Wendt", depot: "east" },
] as const;

const CUSTOMERS = [
  "Holloway Garden Supplies",
  "Marlow & Finch Books",
  "Oakridge Pharmacy",
  "Brixley Cycles",
  "Tamsin's Bakery",
  "Northfold Office",
  "Pellham Hardware",
  "Greywick Studio",
  "Juniper Lane Florist",
  "Ashcombe Dental",
] as const;

interface Stop {
  id: string;
  shipment: string;
  customer: string;
  /** The window the customer was promised, `[from, to]`. */
  window: readonly [number, number];
  /** When the tour plans to be there. */
  arrival: number;
}

interface Tour {
  id: string;
  vehicle: string;
  driver: string;
  depot: string;
  /** Leaves the depot, loaded; back at the depot. */
  from: number;
  to: number;
  /** Minutes of loading before `from`. */
  loading: number;
  km: number;
  stops: readonly Stop[];
}

/** One tour per vehicle. Stops every half hour or so, each with a two-hour
    window; every seventh arrival misses its window - the late ones a
    dispatcher looks for. */
function tour(index: number): Tour {
  const r = random(700 + index);
  const vehicle = VEHICLES[index]!;
  const truck = vehicle.type === "truck";
  const from = at(truck ? 6 : 7, index % 2 === 0 ? 0 : 30);
  const count = truck ? 5 : 8 + Math.floor(r() * 4);
  const stops: Stop[] = [];
  let arrival = from + (20 + Math.floor(r() * 15)) * MINUTE;
  for (let i = 0; i < count; i++) {
    const n = index * 20 + i;
    const slot = Math.floor((arrival - at(0)) / (2 * 60 * MINUTE)) * 2;
    /* A late stop's window closed half an hour or more before the arrival. */
    const late = i >= 2 && n % 7 === 3;
    const halfHour = 30 * MINUTE;
    const windowFrom = late ? Math.floor(arrival / halfHour) * halfHour - 5 * halfHour : at(slot);
    stops.push({
      id: `s-${index + 1}-${i + 1}`,
      shipment: `FP-${(1_004_210 + n * 13).toString()}`,
      customer: CUSTOMERS[(n * 3) % CUSTOMERS.length]!,
      window: [windowFrom, windowFrom + 2 * 60 * MINUTE],
      arrival,
    });
    arrival += (truck ? 45 : 22) * MINUTE + Math.floor(r() * 18) * MINUTE;
  }
  return {
    id: `T-${String(index + 1).padStart(2, "0")}`,
    vehicle: vehicle.id,
    driver: DRIVERS[index]!.id,
    depot: vehicle.depot,
    from,
    to: arrival + 30 * MINUTE,
    loading: truck ? 45 : 30,
    km: Math.round((truck ? 140 : 70) + r() * 40),
    stops,
  };
}

const TOURS: readonly Tour[] = VEHICLES.map((_, index) => tour(index));

interface Shipment {
  id: string;
  customer: string;
  /** In kg. */
  weight: number;
  status: "delivered" | "out for delivery" | "failed attempt";
  window: readonly [number, number];
  tour: string;
}

/** One shipment per stop. Before now, delivered - or a failed attempt, where
    nobody was in; after now, out for delivery. */
const SHIPMENTS: readonly Shipment[] = TOURS.flatMap((one) =>
  one.stops.map((stop) => {
    const n = Number(stop.shipment.slice(3));
    return {
      id: stop.shipment,
      customer: stop.customer,
      weight: Math.round((VEHICLES.find((v) => v.id === one.vehicle)!.type === "truck" ? 180 : 2) + ((n * 7919) % 230) / 10),
      status: stop.arrival > NOW ? "out for delivery" : n % 11 === 0 ? "failed attempt" : "delivered",
      window: stop.window,
      tour: one.id,
    } satisfies Shipment;
  }),
);

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
  "first-table",
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

/* A pinned column needs room beside it: on a phone it covers half the table.
   So the column sticks only where the place the screen stands in is at least
   640 px wide - measured on the place itself, not on the window, which knows
   nothing of a sidebar or a split view. Narrower, the table scrolls whole. */
function useWide(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(true);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWide(element.getBoundingClientRect().width >= 640));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, wide];
}

export default function FindALateShipment() {
  const formats = useFormats();
  const [rows, setRows] = useState(START);
  const [toArchive, setToArchive] = useState<readonly Row[]>([]);
  const [message, setMessage] = useState("No action yet.");
  const [place, wide] = useWide();

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
    <Stack ref={place} gap={3}>
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
        <RowActions pin={wide}>
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
