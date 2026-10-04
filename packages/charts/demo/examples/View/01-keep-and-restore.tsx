import { useState } from "react";
import { Legend, Tooltip, useChart, type ChartView } from "../../../src";

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

export const title = "Keep and restore a view";
export const lead = "`onViewChange` reports the span in view and the hidden series as one view; keep it - here in the browser's storage, so it outlives a reload - and hand it back through `initialView`. Zoom, hide a series, keep, reload, restore.";

const SERIES = [
  { name: "Checkout", data: metrics("checkout") },
  { name: "Billing", data: metrics("billing") },
  { name: "Search", data: metrics("search") },
];

const KEPT = "umriss-charts-demo-view";

/* Storage can be missing or refuse - a private window, a blocked site. The
   view is then simply not kept. */
function readKept(): ChartView | null {
  try {
    const stored = localStorage.getItem(KEPT);
    return stored === null ? null : (JSON.parse(stored) as ChartView);
  } catch {
    return null;
  }
}

function keep(view: ChartView): void {
  try {
    localStorage.setItem(KEPT, JSON.stringify(view));
  } catch {
    /* Not kept; the chart works on regardless. */
  }
}

export default function KeepAndRestore() {
  /* The application holds the view the chart reports; handing it another one
     is all it takes to restore. */
  const [view, setView] = useState<ChartView>({});
  const [kept, setKept] = useState<ChartView | null>(readKept);
  const { Chart, XAxis, YAxis, Line } = useChart(SERIES[0]!.data, { initialView: view, onViewChange: setView });
  return (
    <>
      <Chart height={260} ariaLabel="Latency of three services today">
        <XAxis value="t" time zoomable />
        <YAxis label="ms" domain="visible" />
        {SERIES.map((one) => (
          <Line key={one.name} data={one.data} value="p95" name={one.name} />
        ))}
        <Legend />
        <Tooltip mode="x" />
      </Chart>
      <div className="demo-kept">
        <p className="pair-caption">What the application would keep</p>
        {/* JSON has no space to break at: the class lets it break anywhere. */}
        <code className="demo-view" data-role="view">
          {JSON.stringify(view)}
        </code>
      </div>
      <div className="demo-actions">
        <button
          type="button"
          className="demo-button"
          onClick={() => {
            keep(view);
            setKept(view);
          }}
          data-keep
        >
          Keep this view
        </button>
        <button type="button" className="demo-button" disabled={kept === null} onClick={() => kept && setView(kept)} data-restore>
          Restore the kept view
        </button>
        <button type="button" className="demo-button" onClick={() => setView({})} data-start-over>
          Start over
        </button>
      </div>
    </>
  );
}
