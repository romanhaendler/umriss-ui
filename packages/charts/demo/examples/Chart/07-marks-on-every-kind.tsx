/* Encoding by marks on every kind in one chart: the bars take a hatch across
   their fill, the corridor a dash on its outline and a hatch in its own
   colour, the line its dash and markers, the samples their shape - each by
   its palette place, so the pairing of colour and mark is the same in every
   chart of an application. */

import { Area, Bar, Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { mixedData, type MixedPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Marks on every kind";

export default function MarksOnEveryKind() {
  return (
    <Chart data={mixedData} height={320} ariaLabel="Bars, area, line and scatter, told apart by marks" encoding="marks">
      <XAxis accessor={(d: MixedPoint) => d.t} label="Period" tickCount={7} />
      <YAxis accessor={(d: MixedPoint) => d.stock} label="Quantity" />
      <Bar accessor={(d: MixedPoint) => d.inflow} name="Inflow" />
      <Bar accessor={(d: MixedPoint) => d.outflow} name="Outflow" />
      <Area
        accessor={(d: MixedPoint) => d.corridorUpper}
        baseline={(d: MixedPoint) => d.corridorLower}
        name="Corridor"
      />
      <Line accessor={(d: MixedPoint) => d.stock} name="Stock" strokeWidth={2} />
      <Scatter accessor={(d: MixedPoint) => d.sample} name="Samples" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
