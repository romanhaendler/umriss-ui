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
  TreeView,
  useToast,
  useTree,
} from "../../src";
import type { NodeReader } from "../../src";
import { DEPOTS, DRIVERS, SHIPMENTS, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";

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

const MINUTE = 60_000;
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

export default function DispatchATour() {
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
