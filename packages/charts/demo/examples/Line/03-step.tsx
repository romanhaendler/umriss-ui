import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { REPLICAS, metrics, type MetricPoint, type ReplicaChange } from "@umriss-ui/demo/worlds/operations";

export const title = "Hold a value until it changes";
export const lead = "A value logged only when it changes holds until the next entry; `step` draws it so, and a gap ends the hold.";

const CHECKOUT = metrics("checkout");

export default function StepLine() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's requests and the instances serving them today">
      <XAxis accessor={(d: { t: number }) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} label="Requests/min" />
      <YAxis id="instances" position="right" accessor={(d: ReplicaChange) => d.replicas ?? 0} domain={[0, 15]} label="Instances" />
      <Line accessor={(d: MetricPoint) => d.requests} name="Requests" />
      <Line data={REPLICAS} accessor={(d: ReplicaChange) => d.replicas} yAxisId="instances" name="Instances" step strokeWidth={2} />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}
