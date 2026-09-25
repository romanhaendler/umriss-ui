import { useState } from "react";
import { Chart, Line, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Size a chart by its container";
export const lead = "Without `width` a chart takes its container's width and follows it; `height` is always yours. Drag the corner, or collapse the pair.";

const SIGN_IN = metrics("sign-in");

function Requests({ width, height }: { width?: number; height: number }) {
  return (
    <Chart data={SIGN_IN} width={width} height={height} ariaLabel="Sign-in requests per minute today">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} />
      <Line accessor={(d: MetricPoint) => d.requests} name="Requests per minute" />
    </Chart>
  );
}

export default function InItsContainer() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      {/* `resize: horizontal` on the host - the chart measures what it finds. */}
      <div className="resizable">
        <Requests height={200} />
      </div>
      <button className="demo-button" onClick={() => setCollapsed((v) => !v)}>
        {collapsed ? "Expand" : "Collapse"}
      </button>
      {!collapsed && (
        <div className="side-by-side">
          <Requests width={420} height={180} />
          <div className="narrow">
            <Requests height={180} />
          </div>
        </div>
      )}
    </>
  );
}
