import { useState } from "react";
import { Badge, Button, Card, Grid, Sparkline, Splitter, Stack, Stat, Text } from "../../../src";

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

/** A kind of alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
interface AlertType {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
}

const ALERT_TYPES: readonly AlertType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2\u00a0%", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

/** One alert, shaped as `@umriss-ui/table`'s alarm list reads it. */
type Alert = {
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
const ALERTS: readonly Alert[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "search-latency", lifecycle: "resolved-acknowledged", raised: at(17, 8, 5), resolved: at(17, 8, 9), acknowledgedAt: at(17, 8, 6) },
  { id: "a-6", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-7", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

export const title = "Three panes";
export const lead = "Nest a splitter in a pane for a list, its detail and the detail's alerts; name each separator after the pane it sizes.";

const TIER_ONE = SERVICES.filter((service) => service.tier === 1);

export default function ThreePanes() {
  const [chosen, setChosen] = useState("checkout");
  const service = TIER_ONE.find((s) => s.id === chosen) ?? TIER_ONE[0]!;
  const p95 = metrics(service.id).map((point) => point.p95);
  const alerts = ALERTS.filter(
    (alert) => alert.type.startsWith(`${service.id}-`) && alert.lifecycle.startsWith("active"),
  );

  return (
    <Card style={{ height: 340 }}>
      <Splitter defaultValue={26} min={20} max={45} separatorLabel="Services" style={{ height: "100%" }}>
        <Stack gap={1} style={{ padding: 12 }}>
          <Text size="xs" tone="muted" style={{ padding: "0 8px 4px" }}>
            Tier 1
          </Text>
          {TIER_ONE.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={s.id === chosen ? "secondary" : "ghost"}
              aria-pressed={s.id === chosen}
              onClick={() => setChosen(s.id)}
            >
              {s.name}
            </Button>
          ))}
        </Stack>
        <Splitter orientation="vertical" defaultValue={62} min={30} max={75} separatorLabel={`${service.name} latency`} style={{ height: "100%" }}>
          <Grid minItemWidth="180px" gap={4} style={{ padding: 16 }}>
            <Stat
              label={`${service.name} · p95`}
              value={p95[p95.length - 1]}
              unit="ms"
              limits={{ limits: [{ value: service.latencySlo, side: "upper", severity: "warning" }] }}
            />
            <Stack gap={2}>
              <Text size="xs" tone="muted">
                Today
              </Text>
              <Sparkline data={p95} width={180} height={48} />
            </Stack>
          </Grid>
          <Stack gap={2} style={{ padding: 16 }}>
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Stack key={alert.id} direction="row" gap={2} align="center">
                  <Badge tone="warning">Active</Badge>
                  <Text size="sm">{ALERT_TYPES.find((type) => type.id === alert.type)?.label}</Text>
                </Stack>
              ))
            ) : (
              <Text size="sm" tone="muted">
                No active alerts for {service.name}.
              </Text>
            )}
          </Stack>
        </Splitter>
      </Splitter>
    </Card>
  );
}
