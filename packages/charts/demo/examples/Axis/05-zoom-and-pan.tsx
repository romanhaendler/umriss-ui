/* A week of kiln temperature, one reading a minute - too long to read a shift
   in. `onDomainChange` makes the x axis zoomable: Ctrl or ⌘ with the wheel, or
   a pinch, zooms around the pointer, a drag pans, a double click shows the
   whole week again. The axis only proposes; the domain stays the caller's,
   who passes it back - and could clamp it on the way. */

import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { kilnData, type KilnPoint } from "../../data";

export const title = "Zoom and pan";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function ZoomAndPan() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <Chart data={kilnData} height={260} ariaLabel="Kiln temperature across a week, zoomable">
      <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
      <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" />
      <Line accessor={(d: KilnPoint) => d.temperature} name="Kiln" />
      <Tooltip mode="x" />
    </Chart>
  );
}
