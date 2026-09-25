import { DOWNTIME_MINUTES, MONTH_MINUTES, SERVICES } from "@umriss-ui/demo/worlds/operations";
import { Calculation, Difference, Given, Product, Quotient } from "../../../src";

export const title = "Build operands from data";
export const lead = "`.map` inside an operator works; folded, a line with more than four operands says how many it holds instead of a long formula.";

/* The services a booking passes through, in order. */
const PATH = ["sign-in", "search", "checkout", "billing", "notifications"];

export default function FromData() {
  return (
    <Calculation aria-label="Availability of a booking, March so far">
      <Product label="Availability of a booking" format="percent" decimals={2}>
        {SERVICES.filter((service) => PATH.includes(service.id)).map((service) => (
          <Quotient key={service.id} label={`Availability, ${service.name}`} format="percent" decimals={2}>
            <Difference label={`Minutes up, ${service.name}`} unit="min">
              <Given label="Minutes this month" value={MONTH_MINUTES} unit="min" />
              <Given label={`Minutes down, ${service.name}`} value={DOWNTIME_MINUTES[service.id]} unit="min" />
            </Difference>
            <Given label="Minutes this month" value={MONTH_MINUTES} unit="min" />
          </Quotient>
        ))}
      </Product>
    </Calculation>
  );
}
