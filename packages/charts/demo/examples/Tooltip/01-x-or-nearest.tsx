import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Report every series or the nearest";
export const lead = "`mode=\"x\"` lists every series at the pointer's x; `mode=\"nearest\"` names only the closest point - the question when lines cross.";

const SEARCH = metrics("search");
const SIGN_IN = metrics("sign-in");

function Latencies({ mode }: { mode: "x" | "nearest" }) {
  return (
    <Chart data={SEARCH} height={220} ariaLabel={`Search and sign-in latency, tooltip mode ${mode}`}>
      <XAxis accessor={(d: MetricPoint) => d.t} time tickCount={4} />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="Search" />
      <Line data={SIGN_IN} accessor={(d: MetricPoint) => d.p95} name="Sign-in" />
      <Tooltip mode={mode} />
    </Chart>
  );
}

export default function XOrNearest() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">mode="x" - every series at the x position</p>
        <Latencies mode="x" />
      </div>
      <div>
        <p className="pair-caption">mode="nearest" - only the nearest point</p>
        <Latencies mode="nearest" />
      </div>
    </div>
  );
}
