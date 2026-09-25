import { COST_RATES, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";
import { Calculation, Chain, DividedBy, Given, Interim, Plus, Product, Sum } from "../../../src";

export const title = "The cost per stop of a day's tours";
export const lead = "Eight tours from data, some sixty quantities: the sheet stands open, every tree in it folded, and the stale diesel price says so.";

const typeOf = (vehicleId: string) => VEHICLES.find((vehicle) => vehicle.id === vehicleId)!.type;
const hours = (tour: (typeof TOURS)[number]) => (tour.to - tour.from) / 3_600_000 + tour.loading / 60;
const DIESEL = TOURS.filter((tour) => typeOf(tour.vehicle) !== "e-van");
const ELECTRIC = TOURS.filter((tour) => typeOf(tour.vehicle) === "e-van");
const STOPS = TOURS.reduce((sum, tour) => sum + tour.stops.length, 0);

const AGES = { stale: 24 * 3_600_000, lost: 14 * 24 * 3_600_000 };

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
              asOf={new Date(2026, 2, 14, 6, 0)}
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
