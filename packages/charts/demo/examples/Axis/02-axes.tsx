import { Legend, Tooltip, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** When this morning's load test of Search began. */
interface LoadTestPoint {
  /** Minutes since the test began. */
  minute: number;
  /** CPU load of the busiest node, in per cent. */
  cpu: number;
  requestsPerHour: number;
  /** 95th percentile latency, in ms. */
  p95: number;
}

/** An hour of load test, minute by minute: three magnitudes far apart. */
const LOAD_TEST: readonly LoadTestPoint[] = (() => {
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

export const title = "Add axes for other magnitudes";
export const lead = "Several y axes stack outwards on their side, and a series picks its axes by `yAxisId` and `xAxisId`; only the first axis draws a grid.";

export default function Axes() {
  const { Chart, XAxis, YAxis, Line } = useChart(LOAD_TEST);
  return (
    <Chart height={340} ariaLabel="A load test: CPU, throughput and latency on three y axes">
      <XAxis value="minute" label="Minute of the test" />
      <XAxis id="seconds" position="top" value={(d) => d.minute * 60} label="Seconds into the test" />
      <YAxis id="cpu" position="left" label="CPU %" value="cpu" />
      <YAxis id="requests" position="right" label="Requests/h" value="requestsPerHour" />
      <YAxis id="latency" position="right" label="p95 ms" value="p95" />
      <Line value="cpu" yAxisId="cpu" name="CPU" />
      <Line value="requestsPerHour" xAxisId="seconds" yAxisId="requests" name="Throughput" dash={[4, 4]} />
      <Line value="p95" yAxisId="latency" name="p95" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
