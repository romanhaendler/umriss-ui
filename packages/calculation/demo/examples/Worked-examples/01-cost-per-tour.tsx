import { Calculation, Chain, DividedBy, Given, Interim, Plus, Product, Sum } from "../../../src";

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

export const title = "The cost per stop of a day's tours";
export const lead = "Eight tours from data, some sixty quantities: the sheet stands open, every tree in it folded, and the stale diesel price says so.";

const typeOf = (vehicleId: string) => VEHICLES.find((vehicle) => vehicle.id === vehicleId)!.type;
const hours = (tour: (typeof TOURS)[number]) => (tour.to - tour.from) / 3_600_000 + tour.loading / 60;
const DIESEL = TOURS.filter((tour) => typeOf(tour.vehicle) !== "e-van");
const ELECTRIC = TOURS.filter((tour) => typeOf(tour.vehicle) === "e-van");
const STOPS = TOURS.reduce((sum, tour) => sum + tour.stops.length, 0);

const AGES = { stale: 24 * 3_600_000, lost: 14 * 24 * 3_600_000 };
/* The price was read on Saturday at 06:00, seen from Tuesday 10:30; its
   freshness counts from page load, the tours keep their Tuesday. */
const LOADED = Date.now();
const DIESEL_READ = LOADED - (at(10, 30) - new Date(2026, 2, 14, 6, 0).getTime());

export default function CostPerTour() {
  return (
    <Calculation aria-label="Cost per stop, all tours, Tuesday">
      <Chain>
        <Product label="Drivers" unit="€" decimals={2}>
          <Sum label="Driver hours" unit="h" decimals={1}>
            {TOURS.map((tour) => (
              <Given key={tour.id} label={`Hours, ${tour.id}`} value={hours(tour)} unit="h" decimals={1} />
            ))}
          </Sum>
          <Given label="Driver rate, all in" value={COST_RATES.driverPerHour} unit="€/h" decimals={2} />
        </Product>
        <Plus>
          <Product label="Diesel" unit="€" decimals={2}>
            <Sum label="Diesel used" unit="l" decimals={1}>
              {DIESEL.map((tour) => (
                <Product key={tour.id} label={`Diesel, ${tour.id}`} unit="l" decimals={1}>
                  <Given label={`Distance, ${tour.id}`} value={tour.km} unit="km" />
                  <Given label={`Consumption, ${tour.id}`} value={COST_RATES.per100Km[typeOf(tour.vehicle)] / 100} unit="l/km" />
                </Product>
              ))}
            </Sum>
            <Given
              label="Diesel price"
              value={COST_RATES.dieselPerLitre}
              unit="€/l"
              decimals={2}
              source="Fuel card, weekly price"
              asOf={DIESEL_READ}
              ages={AGES}
            />
          </Product>
        </Plus>
        <Plus>
          <Product label="Electricity" unit="€" decimals={2}>
            <Sum label="Electricity used" unit="kWh" decimals={1}>
              {ELECTRIC.map((tour) => (
                <Product key={tour.id} label={`Electricity, ${tour.id}`} unit="kWh" decimals={1}>
                  <Given label={`Distance, ${tour.id}`} value={tour.km} unit="km" />
                  <Given label={`Consumption, ${tour.id}`} value={COST_RATES.per100Km["e-van"] / 100} unit="kWh/km" />
                </Product>
              ))}
            </Sum>
            <Given label="Electricity price" value={COST_RATES.electricityPerKwh} unit="€/kWh" decimals={2} source="Depot tariff 2026" />
          </Product>
        </Plus>
        <Plus>
          <Sum label="Vehicle days" unit="€" decimals={2}>
            {TOURS.map((tour) => (
              <Given key={tour.id} label={`Vehicle day, ${tour.id}`} value={COST_RATES.vehiclePerDay[typeOf(tour.vehicle)]} unit="€" decimals={2} />
            ))}
          </Sum>
        </Plus>
        <Interim label="Cost of the day's tours" unit="€" decimals={2} />
        <DividedBy label="Stops" value={STOPS} unit="stops" />
        <Interim
          label="Cost per stop"
          unit="€/stop"
          decimals={2}
          limits={[{ value: 30, side: "upper", severity: "warning" }]}
        />
      </Chain>
    </Calculation>
  );
}
