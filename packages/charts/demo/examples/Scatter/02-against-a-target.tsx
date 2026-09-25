import { Chart, Legend, LimitLine, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { SERVICES, TRACES, type Trace } from "@umriss-ui/demo/worlds/operations";

export const title = "Mark samples that miss a target";
export const lead = "Put the misses in a series of their own with `tone=\"alarm\"`: a scatter has one colour, and the tone is the theme's alarm red.";

const OBJECTIVE = SERVICES.find((one) => one.id === "checkout")!.latencySlo;

export default function AgainstATarget() {
  return (
    <Chart data={TRACES} height={300} ariaLabel="Traced Checkout requests against the latency objective">
      <XAxis accessor={(d: Trace) => d.t} time />
      <YAxis accessor={(d: Trace) => d.ms} label="ms" />
      <LimitLine value={OBJECTIVE} severity="warning" label="Objective" />
      {/* The two channels never both carry a value, so no trace is drawn twice. */}
      <Scatter accessor={(d: Trace) => (d.ms <= OBJECTIVE ? d.ms : null)} name="Request" radius={2.5} />
      <Scatter accessor={(d: Trace) => (d.ms > OBJECTIVE ? d.ms : null)} name="Too slow" tone="alarm" radius={4} />
      <Legend placement="top" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
