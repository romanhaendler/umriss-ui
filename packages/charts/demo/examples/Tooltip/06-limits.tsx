import { LimitBand, LimitLine, Tooltip, useChart } from "../../../src";

export const title = "Read the limits at the hit";
export const lead = "`limits` adds a row for every labelled limit on the hit's y axis, its label and value in the axis' format; a key reads the same out, and the chart's summary names them without it.";

/* Checkout's 95th percentile latency every ten minutes of a morning, in ms, as the monitor exports it. */
const LATENCY = [
  { time: "09:00", p95: 212 }, { time: "09:10", p95: 224 }, { time: "09:20", p95: 231 },
  { time: "09:30", p95: 246 }, { time: "09:40", p95: 318 }, { time: "09:50", p95: 402 },
  { time: "10:00", p95: 387 }, { time: "10:10", p95: 291 }, { time: "10:20", p95: 238 },
  { time: "10:30", p95: 229 },
].map((row, x) => ({ ...row, x }));

export default function Limits() {
  const { Chart, XAxis, YAxis, Line } = useChart(LATENCY);
  return (
    <Chart height={260} ariaLabel="Checkout's latency against its objective and its warning band">
      <XAxis value="x" tickFormat={(v) => LATENCY[Math.round(v)]?.time ?? ""} />
      <YAxis label="ms" tickFormat={(v) => `${v} ms`} />
      <LimitBand from={250} to={300} severity="warning" label="Warning band" />
      <LimitLine value={300} severity="alarm" label="Objective" />
      <Line value="p95" name="p95" />
      <Tooltip mode="x" limits />
    </Chart>
  );
}
