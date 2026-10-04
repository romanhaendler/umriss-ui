import { Badge, Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { Legend, LimitLine, Tooltip, useChart } from "../../src";

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

interface Incident {
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

const INCIDENTS: readonly Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "checkout", severity: "SEV1", opened: at(17, 9, 42), acknowledged: at(17, 9, 46), assignee: "jonas" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "webhooks", severity: "SEV3", opened: at(17, 7, 15), acknowledged: at(17, 8, 2), assignee: "ines" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "images", severity: "SEV2", opened: at(16, 22, 5), acknowledged: at(16, 22, 11), resolved: at(17, 0, 40), assignee: "tomasz" },
  { id: "INC-1045", title: "Sign-in codes arrive late", service: "sign-in", severity: "SEV2", opened: at(16, 14, 20), acknowledged: at(16, 14, 24), resolved: at(16, 15, 5), assignee: "ada" },
  { id: "INC-1044", title: "Monthly report export fails", service: "reports", severity: "SEV3", opened: at(15, 10, 0), acknowledged: at(16, 9, 12), resolved: at(16, 11, 30), assignee: "felix" },
  { id: "INC-1043", title: "Search returns no results for some regions", service: "search", severity: "SEV1", opened: at(14, 18, 30), acknowledged: at(14, 18, 33), resolved: at(14, 19, 55), assignee: "leila" },
  { id: "INC-1042", title: "Duplicate reminder e-mails", service: "notifications", severity: "SEV3", opened: at(13, 8, 45), acknowledged: at(13, 9, 30), resolved: at(13, 13, 0), assignee: "sam" },
  { id: "INC-1041", title: "Invoices generated twice", service: "billing", severity: "SEV2", opened: at(12, 16, 10), acknowledged: at(12, 16, 18), resolved: at(12, 18, 40), assignee: "priya" },
];

export const title = "Watch latency against its objective";

export const lead =
  "An on-call engineer keeps this dashboard open: every service's latency against its own objective, and the one that breached it in detail.";

export const callouts = [
  "Each tile is one service's 95th percentile latency now, read against that service's objective; the sparkline is the last two hours.",
  "The open incident stands beside the service it is about, so the chart below is read with it in mind.",
  "The objective is a limit line: Checkout crossed it at 09:40 and came back under it at 10:10.",
  "The error rate shares the pointer with the latency chart: hover one and both draw their crosshair at the same minute.",
];

export const builtFrom = [
  "line",
  "limitline",
  "tooltip",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const CHECKOUT = SERVICES.find((one) => one.id === "checkout")!;
const DETAIL = metrics(CHECKOUT.id);
const TODAY: readonly [number, number] = [DETAIL[0]!.t, NOW];
const OPEN = INCIDENTS.find((one) => one.service === CHECKOUT.id && one.resolved === undefined);

/* An alert fires above 2 % failed requests (the world's alert types). */
const ERROR_ALERT = 2;

const objective = (latencySlo: number): LimitSet => ({
  limits: [
    { value: latencySlo * 0.8, side: "upper", severity: "warning" },
    { value: latencySlo, side: "upper", severity: "alarm" },
  ],
});

/* The last two hours, every five minutes. */
const TILES = SERVICES.map((service) => {
  const points = metrics(service.id);
  return { service, now: points.at(-1)!.p95, history: points.slice(-24).map((one) => one.p95) };
});

export default function WatchLatency() {
  const { Chart, XAxis, YAxis, Line } = useChart(DETAIL);
  return (
    <Stack gap={4}>
      <Grid minItemWidth="11rem" gap={3} data-callout="1">
        {TILES.map(({ service, now, history }) => (
          <Stat
            key={service.id}
            label={`${service.name} · p95`}
            value={now}
            unit="ms"
            decimals={0}
            limits={objective(service.latencySlo)}
            history={history}
          />
        ))}
      </Grid>
      <Card data-callout="3">
        <CardHeader
          eyebrow={`${CHECKOUT.team} · tier ${CHECKOUT.tier}`}
          title={`${CHECKOUT.name} latency today`}
          actions={
            OPEN && (
              <Badge tone="danger" data-callout="2">
                {OPEN.id} {OPEN.severity} open
              </Badge>
            )
          }
        />
        <CardBody>
          <Chart height={260} syncId="checkout" ariaLabel="Checkout latency today against its objective">
            <XAxis value="t" time domain={TODAY} />
            {/* Tick labels as wide as the error rate's keep the two crosshairs in one column. */}
            <YAxis value="p95" label="ms" />
            <LimitLine value={CHECKOUT.latencySlo} severity="alarm" label={`Objective ${CHECKOUT.latencySlo} ms`} inExtent />
            <Line value="p50" name="p50" color="var(--uc-color-text)" strokeWidth={1} />
            <Line value="p95" name="p95" strokeWidth={1.75} />
            <Legend placement="top" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title={`${CHECKOUT.name} failed requests`} />
        <CardBody>
          <Chart height={140} syncId="checkout" ariaLabel="Checkout error rate today">
            <XAxis value="t" time domain={TODAY} />
            <YAxis value="errorRate" label="%" tickCount={3} tickFormat={(v) => v.toFixed(1)} />
            <LimitLine value={ERROR_ALERT} severity="alarm" label={`Alert at ${ERROR_ALERT} %`} inExtent />
            <Line value="errorRate" name="Error rate" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
