/* A tooltip in the plant's language: "Furnace 1 - 812 °C, 4 °C above set
   point" instead of a name and a number.

   The render prop receives the hit - the x value and one entry per series, each
   with its datum - and returns what stands in the box. The set point is not a
   series here but a field of the datum, which is exactly what the render prop
   can read and the built-in tooltip cannot know. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { TooltipHit } from "../../../src";
import { furnaceData, type FurnacePoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Content of one's own";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function PlantTooltip({ hit }: { hit: TooltipHit<FurnacePoint> }) {
  return (
    <div className="custom-tooltip">
      <strong>{timeOfDay(hit.xValue)}</strong>
      {hit.points.map((point) => {
        const off = point.yValue - point.datum.setPoint;
        return (
          <span key={point.seriesName}>
            {point.seriesName} - {point.yValue.toFixed(0)} °C, {Math.abs(off).toFixed(0)} °C{" "}
            {off >= 0 ? "above" : "below"} set point
          </span>
        );
      })}
    </div>
  );
}

export default function OwnContent() {
  return (
    <Chart data={furnaceData} height={280} ariaLabel="Two furnace temperatures with a tooltip in plant language">
      <XAxis accessor={(d: FurnacePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
      <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" />
      <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" />
      <Legend placement="top" />
      <Tooltip<FurnacePoint> mode="x" render={(hit) => <PlantTooltip hit={hit} />} />
    </Chart>
  );
}
