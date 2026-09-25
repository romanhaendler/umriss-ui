import { Chart, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { TOURS } from "@umriss-ui/demo/worlds/logistics";

export const title = "Plot single measurements";
export const lead = "A `Scatter` draws each reading as a point and joins nothing: here every stop of today's tours, late above zero.";

interface Arrival {
  t: number;
  /** Minutes after the delivery window closed; below zero, in time. */
  late: number;
}

const ARRIVALS: Arrival[] = TOURS.flatMap((tour) =>
  tour.stops.map((stop) => ({ t: stop.arrival, late: Math.round((stop.arrival - stop.window[1]) / 60_000) })),
).sort((a, b) => a.t - b.t);

export default function Arrivals() {
  return (
    <Chart data={ARRIVALS} height={260} ariaLabel="Every stop of today's tours: minutes after its window closed">
      <XAxis accessor={(d: Arrival) => d.t} time label="Arrival" />
      <YAxis accessor={(d: Arrival) => d.late} label="Minutes late" />
      <Scatter accessor={(d: Arrival) => d.late} name="Stop" radius={4} />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
