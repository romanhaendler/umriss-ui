import { Tooltip, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

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

interface MetricPoint {
  t: number;
  /** Median and 95th percentile latency, in ms. */
  p50: number;
  p95: number;
  /** Failed requests, in per cent. */
  errorRate: number;
  /** Requests per minute. */
  requests: number;
}

/** Requests per minute at the busiest hour, by tier. */
const VOLUME = { 1: 900, 2: 400, 3: 120 } as const;

/** A service's latency and error rate every five minutes of today, from
    midnight up to now. Busy by day, quiet at night; Checkout's 95th percentile
    climbs well past its objective from 09:40 to 10:10, and its errors with it. */
function metrics(serviceId: string): MetricPoint[] {
  const index = SERVICES.findIndex((one) => one.id === serviceId);
  const service = SERVICES[index];
  if (service === undefined) throw new Error(`No service "${serviceId}".`);
  const r = random(1000 + index * 37);
  const points: MetricPoint[] = [];
  let drift = 0;
  for (let t = at(17, 0); t <= NOW; t += 5 * MINUTE) {
    const hour = (t - at(17, 0)) / (60 * MINUTE);
    const load = 0.35 + 0.65 * Math.max(0, Math.sin((Math.PI * (hour - 5)) / 16));
    drift = 0.8 * drift + (r() - 0.5) * 0.08;
    const base = service.latencySlo * (0.45 + 0.2 * load + drift);
    const surge = serviceId === "checkout" && t >= at(17, 9, 40) && t < at(17, 10, 10) ? 1.9 : 1;
    const p95 = Math.round(base * surge * (1 + r() * 0.08));
    points.push({
      t,
      p50: Math.round(p95 * (0.42 + r() * 0.06)),
      p95,
      errorRate: Math.round((0.05 + r() * 0.12 + (surge > 1 ? 2.4 + r() : 0)) * 100) / 100,
      requests: Math.round(VOLUME[service.tier] * load * (1 + (r() - 0.5) * 0.1)),
    });
  }
  return points;
}

export const title = "A box per hour on a time axis";
export const lead = "Checkout's median latency, every five minutes, gathered into one box per hour. The quartiles and the whisker rule are the caller's - here the last value within 1.5 IQR - and the library draws what it is given.";

const HOUR = 3_600_000;

interface HourBox {
  hour: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/** The value at share p of the sorted values, between neighbours. */
function quantile(sorted: readonly number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  return (sorted[lo] as number) + ((sorted[Math.ceil(at)] as number) - (sorted[lo] as number)) * (at - lo);
}

function hourBoxes(): HourBox[] {
  const byHour = new Map<number, number[]>();
  for (const point of metrics("checkout")) {
    const hour = Math.floor(point.t / HOUR) * HOUR;
    byHour.set(hour, [...(byHour.get(hour) ?? []), point.p50]);
  }
  return [...byHour].map(([hour, values]) => {
    const sorted = values.sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const reach = 1.5 * (q3 - q1);
    const inside = sorted.filter((v) => v >= q1 - reach && v <= q3 + reach);
    return { hour, low: inside[0] as number, q1, median: quantile(sorted, 0.5), q3, high: inside[inside.length - 1] as number };
  });
}

const BOXES = hourBoxes();

export default function OverTime() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(BOXES);
  return (
    <Chart height={280} ariaLabel="Checkout median latency per hour today">
      <XAxis value="hour" time />
      <YAxis tickFormat={(v) => `${v} ms`} />
      <BoxPlot
        name="Checkout p50"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
      />
      <Tooltip />
    </Chart>
  );
}
