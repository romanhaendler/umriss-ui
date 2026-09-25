import { Badge, Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { Chart, Legend, LimitLine, Line, Tooltip, XAxis, YAxis } from "../../src";
import { INCIDENTS, NOW, SERVICES, metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

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
          <Chart data={DETAIL} height={260} syncId="checkout" ariaLabel="Checkout latency today against its objective">
            <XAxis accessor={(d: MetricPoint) => d.t} time domain={TODAY} />
            {/* Tick labels as wide as the error rate's keep the two crosshairs in one column. */}
            <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
            <LimitLine value={CHECKOUT.latencySlo} severity="alarm" label={`Objective ${CHECKOUT.latencySlo} ms`} inExtent />
            <Line accessor={(d: MetricPoint) => d.p50} name="p50" color="var(--uc-color-text)" strokeWidth={1} />
            <Line accessor={(d: MetricPoint) => d.p95} name="p95" strokeWidth={1.75} />
            <Legend placement="top" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title={`${CHECKOUT.name} failed requests`} />
        <CardBody>
          <Chart data={DETAIL} height={140} syncId="checkout" ariaLabel="Checkout error rate today">
            <XAxis accessor={(d: MetricPoint) => d.t} time domain={TODAY} />
            <YAxis accessor={(d: MetricPoint) => d.errorRate} label="%" tickCount={3} tickFormat={(v) => v.toFixed(1)} />
            <LimitLine value={ERROR_ALERT} severity="alarm" label={`Alert at ${ERROR_ALERT} %`} inExtent />
            <Line accessor={(d: MetricPoint) => d.errorRate} name="Error rate" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
