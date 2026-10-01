import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";

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

const HOUR = 60 * MINUTE;

const DAY = 24 * HOUR;

/** Monday, 9 March 2026, 00:00 - the start of last week. */
const LAST_WEEK = at(9, 0);

/** Search returned nothing for some regions (INC-1043): Saturday, 18:30 to 19:55. */
const SEARCH_OUTAGE = [at(14, 18, 30) - LAST_WEEK, at(14, 19, 55) - LAST_WEEK] as const;

/** A service's last week, Monday to Monday, one point every `step`
    milliseconds: busy by day, quieter at the weekend. During INC-1043 Search's
    95th percentile more than doubles and its errors climb. The hour is counted,
    not asked of a Date - a week of seconds is 604,800 points. */
function week(serviceId: string, step: number): MetricPoint[] {
  const index = SERVICES.findIndex((one) => one.id === serviceId);
  const service = SERVICES[index];
  if (service === undefined) throw new Error(`No service "${serviceId}".`);
  const r = random(2000 + index * 37);
  const n = Math.floor((7 * DAY) / step);
  const points = new Array<MetricPoint>(n);
  /* The drift wanders at the same pace whatever the step. */
  const keep = Math.pow(0.8, step / (5 * MINUTE));
  const kick = 0.08 * Math.sqrt(1 - keep * keep) / 0.6;
  let drift = 0;
  for (let i = 0; i < n; i++) {
    const offset = i * step;
    const day = Math.floor(offset / DAY);
    const hour = (offset % DAY) / HOUR;
    const load = (day >= 5 ? 0.85 : 1) * (0.35 + 0.65 * Math.max(0, Math.sin((Math.PI * (hour - 5)) / 16)));
    drift = keep * drift + (r() - 0.5) * kick;
    const outage = serviceId === "search" && offset >= SEARCH_OUTAGE[0] && offset < SEARCH_OUTAGE[1];
    const p95 = Math.round(service.latencySlo * (0.45 + 0.2 * load + drift) * (outage ? 2.3 : 1) * (1 + r() * 0.08));
    points[i] = {
      t: LAST_WEEK + offset,
      p50: Math.round(p95 * (0.42 + r() * 0.06)),
      p95,
      errorRate: Math.round((0.05 + r() * 0.12 + (outage ? 3 : 0)) * 100) / 100,
      requests: Math.round(VOLUME[service.tier] * load * (1 + (r() - 0.5) * 0.1)),
    };
  }
  return points;
}

export const title = "Align a second axis to the grid";
export const lead = "With `alignTicks` a further y axis widens its domain until its ticks, in 1-2-5 steps, fall on the first axis' grid lines.";

const SEARCH_WEEK = week("search", 5 * 60_000);

export default function AlignedTicks() {
  return (
    <Chart data={SEARCH_WEEK} height={260} ariaLabel="Search requests and latency over last week on one grid">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} label="Requests/min" />
      <YAxis id="latency" position="right" accessor={(d: MetricPoint) => d.p95} label="ms" alignTicks />
      <Line accessor={(d: MetricPoint) => d.requests} name="Requests" />
      <Line accessor={(d: MetricPoint) => d.p95} yAxisId="latency" name="p95" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
