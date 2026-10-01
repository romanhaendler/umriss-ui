/* `data-dock` names the two hosts for the screenshot and interaction suites:
   `spacious` has room for an upright dock, `flat` has not. */

import { useState } from "react";
import type { ReactNode } from "react";
import { CrossGlyph, Dock, GridGlyph, MeasureGlyph, MinusGlyph, PlusGlyph, Stack, Text } from "../../../src";
import type { DockPlace, DockTool } from "../../../src";

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

export const title = "Move the dock, and where it does not fit";
export const lead = "Above a latency chart the dock reaches all four edges; on a flat chart the two side edges refuse and show why.";

const TOOLS: readonly DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: <PlusGlyph /> },
  { id: "zoom-out", label: "Zoom out", icon: <MinusGlyph />, disabled: true },
  { id: "grid", label: "Grid", icon: <GridGlyph /> },
  { id: "measure", label: "Measure", icon: <MeasureGlyph /> },
  { id: "clear", label: "Clear the selection", icon: <CrossGlyph /> },
];

/** Which tools are modes is the application's knowledge, not the dock's. */
const MODES = new Set(["grid", "measure"]);

/* Checkout's p95 today, scaled into a 400 × 100 box: the chart the tools
   would act on, drawn as a plain line. */
const P95 = metrics("checkout").map((point) => point.p95);
const TOP = Math.max(...P95) * 1.1;
const POINTS = P95.map((value, i) => `${((i / (P95.length - 1)) * 400).toFixed(1)},${(100 - (value / TOP) * 100).toFixed(1)}`).join(" ");

function Chart({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        borderRadius: "var(--u-radius-lg)",
        overflow: "hidden",
        background:
          "repeating-linear-gradient(0deg, var(--u-hairline-strong) 0 1px, transparent 1px 24px)," +
          "repeating-linear-gradient(90deg, var(--u-hairline-strong) 0 1px, transparent 1px 24px)," +
          "var(--u-color-surface-sunken)",
        boxShadow: "var(--u-edge)",
      }}
    >
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Checkout, p95 latency today"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <polyline
          points={POINTS}
          fill="none"
          stroke="var(--u-color-accent)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </div>
  );
}

export default function RoomAndNoRoom() {
  const [place, setPlace] = useState<DockPlace>("bottom");
  const [mode, setMode] = useState("grid");
  const [last, setLast] = useState<string | null>(null);

  return (
    <Stack gap={4}>
      <div data-dock="spacious">
        <Chart height={320}>
          <Dock
            tools={TOOLS}
            place={place}
            onPlaceChange={setPlace}
            mode={mode}
            onModeChange={(id) => {
              if (MODES.has(id)) setMode(id);
            }}
            onUse={setLast}
          />
        </Chart>
      </div>
      <Text size="xs" tone="muted">
        Resting place: <code>{place}</code>, mode: <code>{mode}</code>, last used: <code>{last ?? "none"}</code>
      </Text>

      <Text size="sm" weight="medium">
        A flat chart, where the side edges refuse
      </Text>
      <div data-dock="flat">
        <Chart height={140}>
          <Dock tools={TOOLS} defaultPlace="bottom" mode="grid" />
        </Chart>
      </div>
    </Stack>
  );
}
