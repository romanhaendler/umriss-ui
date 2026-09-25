/* Four courses a reader has to tell apart - and colour is not enough for
   every reader, nor for a grey printout. With `encoding="marks"` each series
   carries a dash pattern and a marker shape as well as its colour, chosen by
   the same palette place: the first stays solid with circles, the second is
   dashed with squares, the third dotted with triangles, and so on. The legend's
   chips show the same.

   Left without it, as every chart is by default; right with it. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { configData, type Point } from "@umriss-ui/demo/worlds/plant";

export const title = "Told apart without colour";

function Courses({ encoding }: { encoding?: "marks" }) {
  return (
    <Chart data={configData} height={240} ariaLabel="Four courses" encoding={encoding}>
      <XAxis accessor={(d: Point) => d.t} label="Hour" />
      <YAxis accessor={(d: Point) => d.a} />
      <Line accessor={(d: Point) => d.a} name="Line A" />
      <Line accessor={(d: Point) => d.b} name="Line B" />
      <Line accessor={(d: Point) => d.c} name="Line C" />
      <Line accessor={(d: Point) => d.d} name="Line D" />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function ToldApartWithoutColour() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">by colour - the default</p>
        <Courses />
      </div>
      <div>
        <p className="pair-caption">encoding="marks"</p>
        <Courses encoding="marks" />
      </div>
    </div>
  );
}
