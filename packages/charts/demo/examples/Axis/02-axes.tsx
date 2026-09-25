import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { LOAD_TEST, type LoadTestPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Add axes for other magnitudes";
export const lead = "Several y axes stack outwards on their side, and a series picks its axes by `yAxisId` and `xAxisId`; only the first axis draws a grid.";

export default function Axes() {
  return (
    <Chart data={LOAD_TEST} height={340} ariaLabel="A load test: CPU, throughput and latency on three y axes">
      <XAxis accessor={(d: LoadTestPoint) => d.minute} label="Minute of the test" />
      <XAxis id="seconds" position="top" accessor={(d: LoadTestPoint) => d.minute * 60} label="Seconds into the test" />
      <YAxis id="cpu" position="left" label="CPU %" accessor={(d: LoadTestPoint) => d.cpu} />
      <YAxis id="requests" position="right" label="Requests/h" accessor={(d: LoadTestPoint) => d.requestsPerHour} />
      <YAxis id="latency" position="right" label="p95 ms" accessor={(d: LoadTestPoint) => d.p95} />
      <Line accessor={(d: LoadTestPoint) => d.cpu} yAxisId="cpu" name="CPU" />
      <Line accessor={(d: LoadTestPoint) => d.requestsPerHour} xAxisId="seconds" yAxisId="requests" name="Throughput" dash={[4, 4]} />
      <Line accessor={(d: LoadTestPoint) => d.p95} yAxisId="latency" name="p95" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
