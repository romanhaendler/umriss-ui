import { Area, Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { expected, metrics, type ExpectedPoint, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Fill a range between two edges";
export const lead = "Give `baseline` the lower edge and the area becomes a range; where either edge is missing, the fill has a hole.";

const CHECKOUT = metrics("checkout");
const EXPECTED = expected("checkout");

export default function Corridor() {
  return (
    <Chart data={CHECKOUT} height={280} ariaLabel="Checkout's requests inside the range they are expected in">
      <XAxis accessor={(d: { t: number }) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} label="Requests/min" />
      {/* A range has two edges, so it gets no outline. */}
      <Area
        data={EXPECTED}
        accessor={(d: ExpectedPoint) => d.high}
        baseline={(d: ExpectedPoint) => d.low}
        name="Expected range"
        strokeWidth={0}
      />
      <Line accessor={(d: MetricPoint) => d.requests} name="Requests" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
