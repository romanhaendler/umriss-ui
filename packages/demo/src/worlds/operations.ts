/**
 * The operations world: Quillmere, a platform on which small businesses take
 * online bookings, run as a set of services by six teams.
 *
 * The standing cast:
 * - `SERVICES` - eight services with their team, tier, latency objective and
 *   availability target;
 * - `ENGINEERS` - the people on call, and `ONCALL`, who is primary and
 *   secondary this week;
 * - `metrics(service)` - latency and error rate every five minutes of today up
 *   to now; Checkout has a bad half hour from 09:40;
 * - `INCIDENTS` - the last week's incidents, one of them still open;
 * - `ALERT_TYPES` and `ALERTS` - what the alert list shows at 10:30;
 * - `DOWNTIME_MINUTES` - each service's downtime this month, for its
 *   availability.
 *
 * "Now" is Tuesday, 17 March 2026, 10:30 local time. Plain data and small pure
 * functions, no imports: copy the file beside an example and it runs.
 */

/** A small LCG - the same numbers on every machine. */
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
export const NOW = at(17, 10, 30);

export interface Service {
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

export const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

export interface Engineer {
  id: string;
  name: string;
  team: string;
}

export const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

export interface OnCall {
  id: string;
  engineer: string;
  rotation: "primary" | "secondary";
  from: number;
  to: number;
}

/** Monday 16 to Monday 23 March, handed over every morning at 09:00: the
    secondary of one day is the primary of the next. */
export const ONCALL: readonly OnCall[] = Array.from({ length: 7 }, (_, day) => [
  { rotation: "primary" as const, engineer: ENGINEERS[day % ENGINEERS.length]!.id },
  { rotation: "secondary" as const, engineer: ENGINEERS[(day + 1) % ENGINEERS.length]!.id },
].map(({ rotation, engineer }) => ({
  id: `${rotation}-${16 + day}`,
  engineer,
  rotation,
  from: at(16 + day, 9),
  to: at(17 + day, 9),
}))).flat();

export interface MetricPoint {
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
export function metrics(serviceId: string): MetricPoint[] {
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

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  opened: number;
  acknowledged?: number;
  resolved?: number;
  /** An engineer's id. */
  assignee: string;
}

export const INCIDENTS: readonly Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "checkout", severity: "SEV1", opened: at(17, 9, 42), acknowledged: at(17, 9, 46), assignee: "jonas" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "webhooks", severity: "SEV3", opened: at(17, 7, 15), acknowledged: at(17, 8, 2), assignee: "ines" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "images", severity: "SEV2", opened: at(16, 22, 5), acknowledged: at(16, 22, 11), resolved: at(17, 0, 40), assignee: "tomasz" },
  { id: "INC-1045", title: "Sign-in codes arrive late", service: "sign-in", severity: "SEV2", opened: at(16, 14, 20), acknowledged: at(16, 14, 24), resolved: at(16, 15, 5), assignee: "ada" },
  { id: "INC-1044", title: "Monthly report export fails", service: "reports", severity: "SEV3", opened: at(15, 10, 0), acknowledged: at(16, 9, 12), resolved: at(16, 11, 30), assignee: "felix" },
  { id: "INC-1043", title: "Search returns no results for some regions", service: "search", severity: "SEV1", opened: at(14, 18, 30), acknowledged: at(14, 18, 33), resolved: at(14, 19, 55), assignee: "leila" },
  { id: "INC-1042", title: "Duplicate reminder e-mails", service: "notifications", severity: "SEV3", opened: at(13, 8, 45), acknowledged: at(13, 9, 30), resolved: at(13, 13, 0), assignee: "sam" },
  { id: "INC-1041", title: "Invoices generated twice", service: "billing", severity: "SEV2", opened: at(12, 16, 10), acknowledged: at(12, 16, 18), resolved: at(12, 18, 40), assignee: "priya" },
];

/** A kind of alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
export interface AlertType {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
}

export const ALERT_TYPES: readonly AlertType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2 %", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

/** One alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
export type Alert = {
  id: string;
  type: string;
  lifecycle: "active-unacknowledged" | "active-acknowledged" | "resolved-unacknowledged" | "resolved-acknowledged";
  raised: number;
  resolved?: number;
  acknowledgedAt?: number;
} & (
  | { availability?: "in-service" | "suppressed" | "disabled"; snooze?: undefined }
  | { availability: "snoozed"; snooze: { until: number; by: string } }
);

/** The alerts as they stand at 10:30. */
export const ALERTS: readonly Alert[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "search-latency", lifecycle: "resolved-acknowledged", raised: at(17, 8, 5), resolved: at(17, 8, 9), acknowledgedAt: at(17, 8, 6) },
  { id: "a-6", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-7", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

/** The month so far: 1 March 00:00 to now, in minutes. */
export const MONTH_MINUTES = (NOW - at(1, 0)) / MINUTE;

/** Minutes each service was down this month. With `MONTH_MINUTES` and the
    service's target, what an availability is worked out from. */
export const DOWNTIME_MINUTES: Readonly<Record<string, number>> = {
  checkout: 34,
  billing: 18,
  "sign-in": 41,
  search: 85,
  images: 120,
  notifications: 12,
  webhooks: 210,
  reports: 95,
};

/* ---------------------------------------------------------------------------
   For @umriss-ui/charts: last week at any resolution, a load test, single
   traced requests, the autoscaler's log, the expected range and yesterday's
   success rates.
   --------------------------------------------------------------------------- */

const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Monday, 9 March 2026, 00:00 - the start of last week. */
export const LAST_WEEK = at(9, 0);

/** Search returned nothing for some regions (INC-1043): Saturday, 18:30 to 19:55. */
const SEARCH_OUTAGE = [at(14, 18, 30) - LAST_WEEK, at(14, 19, 55) - LAST_WEEK] as const;

/** A service's last week, Monday to Monday, one point every `step`
    milliseconds: busy by day, quieter at the weekend. During INC-1043 Search's
    95th percentile more than doubles and its errors climb. The hour is counted,
    not asked of a Date - a week of seconds is 604,800 points. */
export function week(serviceId: string, step: number): MetricPoint[] {
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

/** When this morning's load test of Search began. */
export const LOAD_TEST_START = at(17, 6);

export interface LoadTestPoint {
  /** Minutes since the test began. */
  minute: number;
  /** CPU load of the busiest node, in per cent. */
  cpu: number;
  requestsPerHour: number;
  /** 95th percentile latency, in ms. */
  p95: number;
}

/** An hour of load test, minute by minute: three magnitudes far apart. */
export const LOAD_TEST: readonly LoadTestPoint[] = (() => {
  const r = random(99);
  let cpu = 21;
  let requestsPerHour = 128_000;
  let p95 = 640;
  return Array.from({ length: 60 }, (_, minute) => {
    cpu += (r() - 0.5) * 0.9;
    requestsPerHour += (r() - 0.5) * 9000;
    p95 += (r() - 0.5) * 40;
    return { minute, cpu, requestsPerHour, p95 };
  });
})();

export interface Trace {
  t: number;
  /** How long the request took, end to end, in ms. */
  ms: number;
}

/** Single Checkout requests traced end to end this morning, one every few
    minutes from 06:00 - individual measurements, nothing in between. Slow
    during the bad half hour, and now and then on their own. */
export const TRACES: readonly Trace[] = (() => {
  const r = random(4040);
  const traces: Trace[] = [];
  for (let t = at(17, 6, 2); t <= NOW; t += Math.round(1 + r() * 4) * MINUTE) {
    const bad = t >= at(17, 9, 40) && t < at(17, 10, 10);
    const ms = 150 + r() * 90 + (bad ? 110 + r() * 120 : r() < 0.05 ? 150 : 0);
    traces.push({ t, ms: Math.round(ms) });
  }
  return traces;
})();

export interface ReplicaChange {
  t: number;
  /** Checkout's instances from here on; `null` while the autoscaler was paused. */
  replicas: number | null;
}

/** Checkout's instances today, logged only when the autoscaler changes them.
    It was paused for a database upgrade from 03:00 to 04:00; the last entry,
    at now, closes the hold. */
export const REPLICAS: readonly ReplicaChange[] = [
  { t: at(17, 0), replicas: 4 },
  { t: at(17, 3), replicas: null },
  { t: at(17, 4), replicas: 3 },
  { t: at(17, 6, 30), replicas: 5 },
  { t: at(17, 8), replicas: 8 },
  { t: at(17, 9, 45), replicas: 12 },
  { t: at(17, 10, 15), replicas: 9 },
  { t: NOW, replicas: 9 },
];

export interface ExpectedPoint {
  t: number;
  /** The range the requests per minute are expected in; `null` where the
      job that computes it did not run. */
  low: number | null;
  high: number | null;
}

/** The range a service's requests per minute are expected in today, every
    five minutes - the day's usual curve, give or take 15 %. The job that
    computes it skipped 03:00 to 04:00. */
export function expected(serviceId: string): ExpectedPoint[] {
  const service = SERVICES.find((one) => one.id === serviceId);
  if (service === undefined) throw new Error(`No service "${serviceId}".`);
  const points: ExpectedPoint[] = [];
  for (let t = at(17, 0); t <= NOW; t += 5 * MINUTE) {
    const hour = (t - at(17, 0)) / HOUR;
    const usual = VOLUME[service.tier] * (0.35 + 0.65 * Math.max(0, Math.sin((Math.PI * (hour - 5)) / 16)));
    const skipped = hour >= 3 && hour < 4;
    points.push({ t, low: skipped ? null : Math.round(usual * 0.85), high: skipped ? null : Math.round(usual * 1.15) });
  }
  return points;
}

export interface SuccessCell {
  hour: number;
  /** The row: the service's place in `SERVICES`. */
  service: number;
  /** Requests that succeeded, in per cent; `null` where there were none. */
  success: number | null;
}

/** Yesterday, per service and hour: the share of requests that succeeded.
    Webhooks has a bad late morning, 03:00 is bad everywhere (a DNS change),
    and Reporting takes no requests before 06:00 - no requests, no share. */
export const SUCCESS_BY_HOUR: readonly SuccessCell[] = (() => {
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
