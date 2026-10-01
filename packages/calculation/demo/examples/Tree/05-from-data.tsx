import { Calculation, Difference, Given, Product, Quotient } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();
const MINUTE = 60_000;

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

/** The month so far: 1 March 00:00 to now, in minutes. */
const MONTH_MINUTES = (NOW - at(1, 0)) / MINUTE;

/** Minutes each service was down this month. With `MONTH_MINUTES` and the
    service's target, what an availability is worked out from. */
const DOWNTIME_MINUTES: Readonly<Record<string, number>> = {
  checkout: 34,
  billing: 18,
  "sign-in": 41,
  search: 85,
  images: 120,
  notifications: 12,
  webhooks: 210,
  reports: 95,
};

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
