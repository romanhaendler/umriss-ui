/* The output of three lines over a day, stacked: the upper edge is the plant's
   output, each band a line's part of it. Every Area with the same `stack`
   stands on the ones registered before it.

   Line 3 stands at night and reports 0 - its band closes to a line, and the
   plant's edge drops with it. A stacked band carries a quantity, so the fill
   is stronger than a lone area's and the outline thin: the edges are the
   boundaries between parts, not courses of their own. */

import { Area, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { lineOutputData, type LineOutput } from "../../data";

export const title = "Stacked areas";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function StackedAreas() {
  return (
    <Chart data={lineOutputData} height={280} ariaLabel="Output of three lines over a day, stacked">
      <XAxis accessor={(d: LineOutput) => d.t} time domain="data" />
      <YAxis accessor={(d: LineOutput) => d.line1} label="Pieces per hour" />
      <Area accessor={(d: LineOutput) => d.line1} name="Line 1" stack="plant" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: LineOutput) => d.line2} name="Line 2" stack="plant" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: LineOutput) => d.line3} name="Line 3" stack="plant" fillOpacity={0.5} strokeWidth={1} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
