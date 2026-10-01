import { useState } from "react";
import { Badge, Button, Drawer, Grid, Meter, ModalBody, ModalFooter, ModalHeader, Stack, Stat, Switch, Text } from "../../../src";
import type { LimitSet } from "../../../src";

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

export const title = "Open a service's detail from its list";
export const lead = "The list stays in sight behind the backdrop; which service is open is your state, and the drawer only shows it.";

/** The latency objective as a rule: warn at 80 %, alarm at the objective itself. */
function latencyLimits(service: Service): LimitSet {
  return {
    limits: [
      { value: service.latencySlo * 0.8, side: "upper", severity: "warning" },
      { value: service.latencySlo, side: "upper", severity: "alarm" },
    ],
  };
}

/** How much of the month's allowed downtime is used up. */
function budgetUsed(service: Service): number {
  const allowed = MONTH_MINUTES * (1 - service.availabilityTarget / 100);
  return (DOWNTIME_MINUTES[service.id] ?? 0) / allowed;
}

export default function BesideAServiceList() {
  const [openId, setOpenId] = useState<string | null>(null);
  const service = SERVICES.find((one) => one.id === openId);
  const points = service ? metrics(service.id).slice(-24) : [];
  const used = service ? budgetUsed(service) : 0;

  return (
    <>
      <Grid minItemWidth="150px" gap={3}>
        {SERVICES.map((one) => (
          <Button key={one.id} onClick={() => setOpenId(one.id)}>
            {one.name}
          </Button>
        ))}
      </Grid>
      <Drawer open={service !== undefined} onClose={() => setOpenId(null)}>
        {service && (
          <>
            <ModalHeader title={service.name} description={`${service.team} · tier ${service.tier}`} />
            <ModalBody>
              <Stack gap={5}>
                <Stat
                  label="p95 latency, last two hours"
                  value={points.at(-1)?.p95}
                  unit="ms"
                  decimals={0}
                  limits={latencyLimits(service)}
                  history={points.map((point) => point.p95)}
                />
                <Stack gap={1}>
                  <Text size="xs" tone="muted">
                    Downtime budget used this month
                  </Text>
                  <Meter
                    value={used}
                    tone={used >= 1 ? "danger" : used >= 0.75 ? "warning" : "neutral"}
                    showLabel
                    label={`Downtime budget of ${service.name}`}
                  />
                  <Text size="xs" tone="muted">
                    {DOWNTIME_MINUTES[service.id]} min down, target {service.availabilityTarget} %
                  </Text>
                </Stack>
                <Stack gap={1} align="flex-start">
                  <Text size="xs" tone="muted">
                    Alerts
                  </Text>
                  <Badge tone={service.tier === 1 ? "accent" : "neutral"}>{service.tier === 1 ? "Pages at night" : "Waits for the morning"}</Badge>
                </Stack>
                <Switch label="Page the on-call engineer" defaultChecked={service.tier === 1} />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setOpenId(null)}>Close</Button>
              <Button variant="primary" onClick={() => setOpenId(null)}>
                Open the runbook
              </Button>
            </ModalFooter>
          </>
        )}
      </Drawer>
    </>
  );
}
