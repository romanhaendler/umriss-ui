/* The same week, opened on Wednesday afternoon, when the burner tripped. With
   `domain="visible"` the y axis fits what the x domain shows: the twenty
   minutes the kiln fell and the hour it took to climb back, not the week's
   600 to 850 °C that would press them flat. Zoom out - Ctrl or ⌘ with the
   wheel, or a double click - and the axis follows. */

import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { DAY_MS, HOUR_MS, WEEK_START, kilnData, type KilnPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "The visible domain";

const WEDNESDAY = WEEK_START + 2 * DAY_MS;

export default function VisibleDomain() {
  const [domain, setDomain] = useState<readonly [number, number]>([
    WEDNESDAY + 12 * HOUR_MS,
    WEDNESDAY + 17 * HOUR_MS,
  ]);
  return (
    <Chart data={kilnData} height={260} ariaLabel="Kiln temperature on Wednesday afternoon, the y axis fitted to it">
      <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
      <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" domain="visible" />
      <Line accessor={(d: KilnPoint) => d.temperature} name="Kiln" />
      <Tooltip mode="x" />
    </Chart>
  );
}
