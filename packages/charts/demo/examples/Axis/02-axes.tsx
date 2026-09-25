import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { LOAD_TEST, LOAD_TEST_START, type LoadTestPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Add axes for other magnitudes";
export const lead = "Several y axes stack outwards on their side, and a series picks its axes by `yAxisId` and `xAxisId`; only the first axis draws a grid.";

const clock = (v: number) => new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Axes() {
  return (
    <Chart data={LOAD_TEST} height={340} ariaLabel="A load test: CPU, throughput and latency on three y axes">
      <XAxis accessor={(d: LoadTestPoint) => d.minute} label="Minute of the test" />
      <XAxis id="clock" position="top" accessor={(d: LoadTestPoint) => LOAD_TEST_START + d.minute * 60_000} tickFormat={clock} label="Time of day" />
      <YAxis id="cpu" position="left" label="CPU %" accessor={(d: LoadTestPoint) => d.cpu} />
      <YAxis id="requests" position="right" label="Requests/h" accessor={(d: LoadTestPoint) => d.requestsPerHour} />
      <YAxis id="latency" position="right" label="p95 ms" accessor={(d: LoadTestPoint) => d.p95} />
      <Line accessor={(d: LoadTestPoint) => d.cpu} yAxisId="cpu" name="CPU" />
      <Line accessor={(d: LoadTestPoint) => d.requestsPerHour} xAxisId="clock" yAxisId="requests" name="Throughput" dash={[4, 4]} />
      <Line accessor={(d: LoadTestPoint) => d.p95} yAxisId="latency" name="p95" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
