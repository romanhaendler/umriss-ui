import { Chart, Matrix, Tooltip, XAxis, YAxis } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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

interface SuccessCell {
  hour: number;
  /** The row: the service's place in `SERVICES`. */
  service: number;
  /** Requests that succeeded, in per cent; `null` where there were none. */
  success: number | null;
}

/** Yesterday, per service and hour: the share of requests that succeeded.
    Webhooks has a bad late morning, 03:00 is bad everywhere (a DNS change),
    and Reporting takes no requests before 06:00 - no requests, no share. */
const SUCCESS_BY_HOUR: readonly SuccessCell[] = (() => {
  const r = random(23);
  const cells: SuccessCell[] = [];
  SERVICES.forEach((one, service) => {
    for (let hour = 0; hour < 24; hour++) {
      let success: number | null = 99.2 + r() * 0.8;
      if (one.id === "webhooks" && hour >= 9 && hour < 14) success = 96 + r() * 1.5;
      if (hour === 3) success = 97.4 + r() * 1;
      if (one.id === "reports" && hour < 6) success = null;
      cells.push({ hour, service, success: success === null ? null : Math.round(success * 100) / 100 });
    }
  });
  return cells;
})();


export const title = "Colour cells by their limits";
export const lead = "With `coloring` of kind `assessment` a cell takes the tone its limits give it: a bad hour everywhere reads differently from one bad service. `format` writes the value in the tooltip, while the y axis writes the row.";

export default function ByLimits() {
  return (
    <Chart data={SUCCESS_BY_HOUR} height={280} ariaLabel="Successful requests per service and hour yesterday, by limits">
      <XAxis accessor={(d: SuccessCell) => d.hour} ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
      <YAxis accessor={(d: SuccessCell) => d.service} ticks={SERVICES.map((_, i) => i)} tickFormat={(v) => SERVICES[v]?.name ?? ""} />
      <Matrix
        accessor={(d: SuccessCell) => d.service}
        value={(d: SuccessCell) => d.success}
        coloring={{
          kind: "assessment",
          limits: {
            limits: [
              { value: 99, side: "lower", severity: "warning" },
              { value: 98, side: "lower", severity: "alarm" },
            ],
          },
        }}
        name="Success rate"
        format={(v) => `${v.toFixed(2)} %`}
      />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
