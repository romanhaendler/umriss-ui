/* One chart, four series kinds, shared axes: inflow and outflow as grouped bars,
   a corridor as a band area with a gap, the stock as a line and samples as a
   scatter.

   The order in the JSX decides what lies over what - and at the same time the
   palette colour. That is the whole composition rule: a series is an element,
   not an entry in a configuration object. */

import { Area, Bar, Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { mixedData, type MixedPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Mixed series kinds";

export default function Mixed() {
  return (
    <Chart data={mixedData} height={320} ariaLabel="Bars, area, line and scatter in one chart">
      <XAxis accessor={(d: MixedPoint) => d.t} label="Period" tickCount={7} />
      <YAxis accessor={(d: MixedPoint) => d.stock} label="Quantity" />
      <Bar accessor={(d: MixedPoint) => d.inflow} name="Inflow" />
      <Bar accessor={(d: MixedPoint) => d.outflow} name="Outflow" />
      <Area
        accessor={(d: MixedPoint) => d.corridorUpper}
        baseline={(d: MixedPoint) => d.corridorLower}
        name="Corridor (with a gap)"
      />
      <Line accessor={(d: MixedPoint) => d.stock} name="Stock" strokeWidth={2} />
      <Scatter accessor={(d: MixedPoint) => d.sample} name="Samples" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
