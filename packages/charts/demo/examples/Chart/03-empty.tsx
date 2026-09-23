/* A chart with nothing to show says so. No data, only gaps, or every series
   hidden: the axes and the frame stay where they are, and the plot area says
   "No data" - or whatever the caller puts into `empty`, in any language. An
   empty frame that says nothing looks like a chart of a line that stood
   still. */

import { Chart, Line, XAxis, YAxis } from "../../../src";
export const title = "Nothing to show";

interface Reading {
  t: number;
  celsius: number;
}

const nothing: Reading[] = [];

function Furnace({ empty }: { empty?: string }) {
  return (
    <Chart data={nothing} height={220} ariaLabel="A furnace without readings" empty={empty}>
      <XAxis accessor={(d: Reading) => d.t} time />
      <YAxis accessor={(d: Reading) => d.celsius} label="°C" />
      <Line accessor={(d: Reading) => d.celsius} name="Furnace 1" />
    </Chart>
  );
}

export default function Empty() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">no empty - the default</p>
        <Furnace />
      </div>
      <div>
        <p className="pair-caption">empty="Furnace 1 is not reporting"</p>
        <Furnace empty="Furnace 1 is not reporting" />
      </div>
    </div>
  );
}
