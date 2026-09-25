import { useState } from "react";
import { Badge, Card, CardBody, CardHeader, FormField, Grid, Select, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Given, Product, Quotient, Sum } from "../../src";
import { COST_RATES, DEPOTS, DRIVERS, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";

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
