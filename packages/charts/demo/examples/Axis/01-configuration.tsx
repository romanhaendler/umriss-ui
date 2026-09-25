/* A fixed domain [0, 100], a tickFormat of its own, markers `always`, a custom
   tooltip through the render prop, mode `nearest`.

   The explicit type argument on `Tooltip<Point>` is what makes the hit fully
   typed in the render prop - without it the callback would take the widest
   shape the container can offer. */

import { useMemo } from "react";
import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { TooltipHit } from "../../../src";
import { configData, type Point } from "@umriss-ui/demo/worlds/plant";

export const title = "Domain, ticks and tooltip";

function CustomTooltip({ hit }: { hit: TooltipHit<Point> }) {
  const point = hit.points[0];
  return (
    <div className="custom-tooltip">
      <strong>Index {hit.xValue}</strong>
      {point === undefined ? null : (
        <span>
          {point.seriesName}: {point.yValue.toFixed(2)}
        </span>
      )}
    </div>
  );
}

export default function Configuration() {
  const configFormat = useMemo(() => (v: number) => `${v.toFixed(0)} pt`, []);

  return (
    <Chart
      data={configData}
      height={280}
      padding={{ top: 12, right: 16, bottom: 8, left: 8 }}
      ariaLabel="Configured course with a fixed domain"
    >
      <XAxis accessor={(d: Point) => d.t} label="Index" tickCount={6} />
      <YAxis accessor={(d: Point) => d.a} domain={[0, 100]} tickFormat={configFormat} label="Points" />
      <Line accessor={(d: Point) => d.a} name="Series A" markers="always" strokeWidth={2} />
      <Line accessor={(d: Point) => d.b} name="Series B" markers="always" color="#7c3aed" />
      <Legend placement="bottom" />
      <Tooltip<Point> mode="nearest" render={(hit) => <CustomTooltip hit={hit} />} />
    </Chart>
  );
}
