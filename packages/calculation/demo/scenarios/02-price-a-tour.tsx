import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Given, Product, Quotient, Sum } from "../../src";

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

/** What a tour costs, per unit - the inputs of a cost per tour. */
const COST_RATES = {
  /** Diesel, per litre; electricity, per kWh. */
  dieselPerLitre: 1.68,
  electricityPerKwh: 0.31,
  /** Consumption per 100 km. */
  per100Km: { van: 9.5, truck: 24, "e-van": 22 },
  /** A driver's hour, all in. */
  driverPerHour: 34.5,
  /** Lease, insurance and upkeep, per day. */
  vehiclePerDay: { van: 58, truck: 145, "e-van": 72 },
} as const;

export const title = "Price a tour";

export const lead =
  "A dispatcher at Ferrow Parcel prices a day's tour - energy, driver and vehicle - to see what each stop costs before quoting a customer.";

export const callouts = [
  "The tour is chosen here; vehicle, driver and depot come with it.",
  "The hours run from the start of loading to the return to the depot - the figure the driver's cost starts from.",
  "Late stops are counted beside the stops: a cheap tour that misses its windows is no bargain.",
  "The cost per stop, worked out in full: the tour's cost divided by its stops. Energy, driver and vehicle each fold open to the numbers they come from, and each number names its source.",
  "The rates the calculation uses, as the fleet office keeps them; a changed price is found here and in the line where it enters.",
];

export const builtFrom = [
  "calculation",
  "tree",
  "given",
  { name: "Select", page: "@umriss-ui/core#select" },
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const TYPE_NAME = { van: "Van", "e-van": "Electric van", truck: "Truck" } as const;
const time = (at: number) => new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function PriceATour() {
  const [tourId, setTourId] = useState(TOURS[0]!.id);
  const tour = TOURS.find((one) => one.id === tourId) ?? TOURS[0]!;
  const vehicle = VEHICLES.find((one) => one.id === tour.vehicle)!;
  const driver = DRIVERS.find((one) => one.id === tour.driver)!;
  const depot = DEPOTS.find((one) => one.id === tour.depot)!;
  const electric = vehicle.type === "e-van";
  const hours = Math.round(((tour.to - tour.from) / 3_600_000 + tour.loading / 60) * 100) / 100;
  const late = tour.stops.filter((stop) => stop.arrival > stop.window[1]).length;

  return (
    <Stack gap={4}>
      <Stack direction="row" gap={4} align="end" wrap>
        <FormField label="Tour" data-callout="1">
          <Select value={tourId} onChange={(event) => setTourId(event.target.value)}>
            {TOURS.map((one) => (
              <option key={one.id} value={one.id}>
                {one.id} · {VEHICLES.find((v) => v.id === one.vehicle)!.plate}
              </option>
            ))}
          </Select>
        </FormField>
        <Text size="sm" tone="muted">
          {TYPE_NAME[vehicle.type]} {vehicle.plate} · {driver.name} · {depot.name} · {time(tour.from)} to {time(tour.to)}
        </Text>
      </Stack>

      <Grid minItemWidth="180px" gap={4}>
        <Stat label="Distance" value={tour.km} unit="km" />
        <Stat label="Hours at work" value={hours} unit="h" decimals={1} data-callout="2" />
        <Stack gap={2} data-callout="3">
          <Stat label="Stops" value={tour.stops.length} />
          {late > 0 && (
            <Badge tone="warning">
              {late} {late === 1 ? "stop" : "stops"} outside the window
            </Badge>
          )}
        </Stack>
      </Grid>

      <Grid minItemWidth="320px" gap={4}>
        <Card>
          <CardHeader title="Cost of the tour" />
          <CardBody data-callout="4">
            <Calculation aria-label={`Cost per stop, tour ${tour.id}`}>
              <Quotient label="Cost per stop" unit="€" decimals={2}>
                <Sum label="Cost of the tour" unit="€" decimals={2}>
                  <Product label="Energy" unit="€" decimals={2}>
                    <Quotient label={electric ? "Kilowatt hours" : "Litres"} unit={electric ? "kWh" : "l"} decimals={1}>
                      <Product label="Distance × consumption" unit={electric ? "kWh·km/100 km" : "l·km/100 km"}>
                        <Given label="Distance" value={tour.km} unit="km" source="Route planner" />
                        <Given
                          label="Consumption"
                          value={COST_RATES.per100Km[vehicle.type]}
                          unit={electric ? "kWh/100 km" : "l/100 km"}
                          source="Fleet data"
                        />
                      </Product>
                      <Given label="Per 100 km" value={100} unit="km" />
                    </Quotient>
                    <Given
                      label={electric ? "Electricity price" : "Diesel price"}
                      value={electric ? COST_RATES.electricityPerKwh : COST_RATES.dieselPerLitre}
                      unit={electric ? "€/kWh" : "€/l"}
                      source="Energy contract, March"
                    />
                  </Product>
                  <Product label="Driver" unit="€" decimals={2}>
                    <Given label="Hours, loading to return" value={hours} unit="h" source="Tour plan" />
                    <Given label="Driver's hour, all in" value={COST_RATES.driverPerHour} unit="€/h" source="Payroll rates 2026" />
                  </Product>
                  <Given label="Vehicle, per day" value={COST_RATES.vehiclePerDay[vehicle.type]} unit="€" source="Lease and upkeep" />
                </Sum>
                <Given label="Stops" value={tour.stops.length} source="Tour plan" />
              </Quotient>
            </Calculation>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Rates" />
          <CardBody data-callout="5">
            <Stack gap={2}>
              <Text size="sm">
                Diesel {COST_RATES.dieselPerLitre.toFixed(2)} €/l · electricity {COST_RATES.electricityPerKwh.toFixed(2)} €/kWh
              </Text>
              <Text size="sm">
                Per 100 km: van {COST_RATES.per100Km.van} l · truck {COST_RATES.per100Km.truck} l · electric van{" "}
                {COST_RATES.per100Km["e-van"]} kWh
              </Text>
              <Text size="sm">Driver's hour, all in: {COST_RATES.driverPerHour.toFixed(2)} €</Text>
              <Text size="sm">
                Vehicle per day: van {COST_RATES.vehiclePerDay.van} € · truck {COST_RATES.vehiclePerDay.truck} € · electric van{" "}
                {COST_RATES.vehiclePerDay["e-van"]} €
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
