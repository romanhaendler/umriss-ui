import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { GERMAN_CHARTS_WORDING } from "../../../src/wording/de";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Read it by keyboard and screen reader";
export const lead = "A chart with a `Tooltip` is one tab stop: the keys walk its values, and a screen reader hears them; `wording` gives the German words.";

const LAST_WEEK = week("search", 5 * 60_000);

export default function KeyboardAndScreenReader() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <div>
      <Chart data={LAST_WEEK} height={200} ariaLabel="Search latency over last week">
        <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
        <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
        <Line accessor={(d: MetricPoint) => d.p50} name="p50" />
        <Tooltip mode="x" />
      </Chart>
      <Chart data={LAST_WEEK} height={200} ariaLabel="Antwortzeiten der Suche in der letzten Woche" wording={GERMAN_CHARTS_WORDING}>
        <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
        <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
        <Line accessor={(d: MetricPoint) => d.p50} name="p50" />
        <Tooltip mode="x" />
      </Chart>
    </div>
  );
}
