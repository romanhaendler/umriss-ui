/* Three charts of one kiln, stacked: its temperature, the flue gas and the gas
   it burns. `syncId` gives them one pointer - hover one, and the other two draw
   their crosshair at the same instant; the tooltip stays where the pointer is.
   Zoom is not shared by the library: the three pass one controlled domain
   between them, so a zoom in any of them zooms all three. Each plot begins
   where its own y axis ends; labels of one width - three figures here - keep
   the three crosshairs in one column. */

import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { kilnData, type KilnPoint } from "../../data";

export const title = "Cursor sync";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const CHANNELS = [
  { name: "Kiln", unit: "°C", value: (d: KilnPoint) => d.temperature },
  { name: "Flue gas", unit: "°C", value: (d: KilnPoint) => d.flue },
  { name: "Gas", unit: "m³/h", value: (d: KilnPoint) => d.gas },
] as const;

export default function CursorSync() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <div>
      {CHANNELS.map((c) => (
        <Chart key={c.name} data={kilnData} height={140} syncId="kiln" ariaLabel={`${c.name} across a week`}>
          <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
          <YAxis accessor={c.value} label={c.unit} domain="visible" tickCount={4} />
          <Line accessor={c.value} name={c.name} />
          <Tooltip mode="x" />
        </Chart>
      ))}
    </div>
  );
}
