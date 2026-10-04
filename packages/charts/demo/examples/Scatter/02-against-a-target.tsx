import { Legend, LimitLine, Tooltip, useChart } from "../../../src";

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

interface Trace {
  t: number;
  /** How long the request took, end to end, in ms. */
  ms: number;
}

/** Single Checkout requests traced end to end this morning, one every few
    minutes from 06:00 - individual measurements, nothing in between. Slow
    during the bad half hour, and now and then on their own. */
const TRACES: readonly Trace[] = (() => {
  const r = random(4040);
  const traces: Trace[] = [];
  for (let t = at(17, 6, 2); t <= NOW; t += Math.round(1 + r() * 4) * MINUTE) {
    const bad = t >= at(17, 9, 40) && t < at(17, 10, 10);
    const ms = 150 + r() * 90 + (bad ? 110 + r() * 120 : r() < 0.05 ? 150 : 0);
    traces.push({ t, ms: Math.round(ms) });
  }
  return traces;
})();

export const title = "Mark samples that miss a target";
export const lead = "Put the misses in a series of their own with `tone=\"alarm\"`: a scatter has one colour, and the tone is the theme's alarm red.";

const OBJECTIVE = SERVICES.find((one) => one.id === "checkout")!.latencySlo;

export default function AgainstATarget() {
  const { Chart, XAxis, YAxis, Scatter } = useChart(TRACES);
  return (
    <Chart height={300} ariaLabel="Traced Checkout requests against the latency objective">
      <XAxis value="t" time />
      <YAxis value="ms" label="ms" />
      <LimitLine value={OBJECTIVE} severity="warning" label="Objective" />
      {/* The two channels never both carry a value, so no trace is drawn twice. */}
      <Scatter value={(d) => (d.ms <= OBJECTIVE ? d.ms : null)} name="Request" radius={2.5} />
      <Scatter value={(d) => (d.ms > OBJECTIVE ? d.ms : null)} name="Too slow" tone="alarm" radius={4} />
      <Legend placement="top" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
