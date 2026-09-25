import { Area, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { PARCELS_PER_HOUR, type DepotHour } from "@umriss-ui/demo/worlds/logistics";

export const title = "Stack areas";
export const lead = "Areas with the same `stack` stand on the ones before them: the top edge is the whole, each band one depot's part.";

export default function StackedAreas() {
  return (
    <Chart data={PARCELS_PER_HOUR} height={280} ariaLabel="Parcels loaded per hour at three depots, stacked">
      <XAxis accessor={(d: DepotHour) => d.t} time domain="data" />
      <YAxis accessor={(d: DepotHour) => d.north} label="Parcels per hour" />
      <Area accessor={(d: DepotHour) => d.north} name="North" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: DepotHour) => d.river} name="Riverside" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: DepotHour) => d.east} name="East Gate" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
