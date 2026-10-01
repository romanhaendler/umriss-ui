import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Combobox,
  DateTimePicker,
  FormField,
  Grid,
  Meter,
  MultiSelect,
  NumberInput,
  Stack,
  Switch,
  Text,
  ToastProvider,
  TreeView,
  useToast,
  useTree,
} from "../../src";
import type { NodeReader } from "../../src";

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

export const title = "Dispatch a tour";

export const lead =
  "A dispatcher at Ferrow Parcel puts together an afternoon tour for the parcels that could not be delivered this morning, and sends it out.";

export const callouts = [
  "The depots and their vehicles stand in a tree; each vehicle says when it is back from its morning tour.",
  "The driver list holds only the chosen vehicle's depot, and typing narrows it.",
  "The parcels start with the morning's failed attempts; more can be added from the depot's open deliveries.",
  "The payload bar turns amber past 90 per cent and red past the vehicle's capacity, with the weight beside it.",
  "A departure before the vehicle is back and loaded is named in words, and the tour cannot be sent until it is resolved.",
];

export const builtFrom = [
  "treeview",
  "card",
  "formfield",
  "combobox",
  "datetimepicker",
  "multiselect",
  "numberinput",
  "meter",
  "switch",
  "alert",
  "toast",
];

const time = (t: number) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const kg = (n: number) => `${n.toLocaleString("en-GB")} kg`;

interface Place {
  id: string;
  name: string;
  children?: Place[];
}

/* Depot above its vehicles. A vehicle's line says what it is and when it is
   free again. */
const FLEET: Place[] = DEPOTS.map((depot) => ({
  id: depot.id,
  name: depot.name,
  children: VEHICLES.filter((one) => one.depot === depot.id).map((one) => {
    const back = TOURS.find((tour) => tour.vehicle === one.id)!.to;
    return { id: one.id, name: `${one.plate} · ${one.type}, back ${time(back)}` };
  }),
}));

const READER: NodeReader<Place> = {
  key: (node) => node.id,
  children: (node) => node.children,
  label: (node) => node.name,
};

const tourOf = (shipment: string) => TOURS.find((one) => one.id === SHIPMENTS.find((s) => s.id === shipment)!.tour)!;

/* This morning's failed attempts at a depot: where an afternoon tour starts. */
const failedAt = (depot: string | undefined) =>
  SHIPMENTS.filter((one) => one.status === "failed attempt" && tourOf(one.id).depot === depot).map((one) => one.id);

function Content() {
  const { toast } = useToast();
  const [vehicleId, setVehicleId] = useState<string | null>("v2");
  const [driver, setDriver] = useState<string | null>(null);
  const [departure, setDeparture] = useState<Date | null>(new Date(2026, 2, 17, 14, 0));
  const [loading, setLoading] = useState<number | null>(30);
  const [notify, setNotify] = useState(true);
  const [sent, setSent] = useState(false);

  const vehicle = VEHICLES.find((one) => one.id === vehicleId);
  const depot = vehicle?.depot;

  /* The depot's parcels that are still to go: the failed attempts first,
     then what is out on the morning tours. */
  const open = SHIPMENTS.filter((one) => one.status !== "delivered" && tourOf(one.id).depot === depot).sort(
    (a, b) => Number(b.status === "failed attempt") - Number(a.status === "failed attempt"),
  );
  const [parcels, setParcels] = useState<string[]>(() => failedAt("north"));

  const tree = useTree(FLEET, {
    reader: READER,
    defaultExpanded: DEPOTS.map((one) => one.id),
    active: vehicleId,
    onActive: (next) => {
      /* A depot is a heading, not a vehicle. */
      if (next === null || VEHICLES.some((one) => one.id === next)) {
        const nextDepot = VEHICLES.find((one) => one.id === next)?.depot;
        if (nextDepot !== depot) {
          setDriver(null);
          setParcels(failedAt(nextDepot));
        }
        setVehicleId(next);
        setSent(false);
      }
    },
  });

  const weight = parcels.reduce((sum, id) => sum + SHIPMENTS.find((one) => one.id === id)!.weight, 0);
  const load = vehicle === undefined ? 0 : weight / vehicle.capacity;
  const back = vehicle === undefined ? null : TOURS.find((one) => one.vehicle === vehicle.id)!.to;
  const ready = back === null ? null : back + (loading ?? 0) * MINUTE;
  const tooEarly = departure !== null && ready !== null && departure.getTime() < ready;
  const complete = vehicle !== undefined && driver !== null && departure !== null && parcels.length > 0;

  const dispatch = () => {
    setSent(true);
    toast({
      title: `Tour sent with ${vehicle!.plate}`,
      description: `${parcels.length} parcels, leaving ${time(departure!.getTime())}${notify ? "; customers get their new window by text" : ""}.`,
      tone: "success",
    });
  };

  return (
    <Stack direction="row" gap={4} align="flex-start" wrap>
      <Card style={{ flex: "1 1 240px", maxWidth: 320 }}>
        <CardHeader title="Fleet" />
        <CardBody>
          <div data-callout="1">
            <TreeView tree={tree} ariaLabel="Depots and vehicles">
              {(entry) => entry.node.name}
            </TreeView>
          </div>
        </CardBody>
      </Card>

      <Card style={{ flex: "3 1 420px" }}>
        <CardHeader
          title="Afternoon tour"
          actions={
            <Button variant="primary" size="sm" disabled={!complete || tooEarly || sent} onClick={dispatch}>
              {sent ? "Sent" : "Send the tour"}
            </Button>
          }
        />
        <CardBody>
          <Stack gap={4}>
            <Grid minItemWidth="220px" gap={4}>
              <FormField label="Vehicle">
                <Text size="sm">{vehicle === undefined ? "Choose one in the fleet" : `${vehicle.plate} · ${vehicle.type}, ${kg(vehicle.capacity)}`}</Text>
              </FormField>
              <FormField label="Driver" required data-callout="2">
                <Combobox
                  value={driver}
                  onChange={setDriver}
                  clearable
                  disabled={vehicle === undefined}
                  placeholder="Type a name"
                  options={DRIVERS.filter((one) => one.depot === depot).map((one) => ({ value: one.id, label: one.name }))}
                />
              </FormField>
              <FormField label="Departure" required>
                <DateTimePicker value={departure} onChange={setDeparture} />
              </FormField>
              <FormField label="Loading" hint="Minutes at the depot before departure.">
                <NumberInput value={loading} onChange={setLoading} min={0} step={5} decimals={0} suffix="min" />
              </FormField>
            </Grid>

            <FormField label="Parcels" hint="Failed attempts first, then the depot's open deliveries." data-callout="3">
              <MultiSelect
                value={parcels}
                onChange={setParcels}
                placeholder="Choose parcels"
                disabled={vehicle === undefined}
                options={open.map((one) => ({
                  value: one.id,
                  label: `${one.id} · ${one.customer}, ${kg(one.weight)}${one.status === "failed attempt" ? " (failed attempt)" : ""}`,
                }))}
              />
            </FormField>

            <Stack gap={1} data-callout="4">
              <Text size="xs" tone="muted">
                Payload: {kg(weight)} of {vehicle === undefined ? "-" : kg(vehicle.capacity)}
              </Text>
              <Meter
                value={load}
                tone={load > 1 ? "danger" : load > 0.9 ? "warning" : undefined}
                showLabel
                label="Payload against the vehicle's capacity"
              />
            </Stack>

            {tooEarly && (
              <div data-callout="5">
                <Alert tone="warning" title="The vehicle is not ready by then">
                  {vehicle!.plate} is back from its morning tour at {time(back!)} and needs {loading} minutes of loading: the
                  earliest departure is {time(ready!)}.
                </Alert>
              </div>
            )}

            <Switch label="Text customers their new delivery window" checked={notify} onChange={(event) => setNotify(event.target.checked)} />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

/* `useToast` needs a `ToastProvider` above it; at the root of an application
   one provider serves every screen. */
export default function DispatchATour() {
  return (
    <ToastProvider>
      <Content />
    </ToastProvider>
  );
}
