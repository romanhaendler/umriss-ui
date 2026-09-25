import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { DELAYS, type DayDelays } from "@umriss-ui/demo/worlds/logistics";

export const title = "Stack bars";
export const lead = "Bars with the same `stack` stand on the ones before them; a missing part stacks as nothing, and the tooltip names what is there.";

export default function Stacked() {
  return (
    <Chart data={DELAYS} height={280} ariaLabel="Minutes late per working day, by cause">
      <XAxis accessor={(d: DayDelays) => d.day} ticks={DELAYS.map((d) => d.day)} tickFormat={(v) => DELAYS[v]?.name ?? ""} />
      <YAxis accessor={(d: DayDelays) => d.traffic} label="Minutes late" />
      <Bar accessor={(d: DayDelays) => d.traffic} name="Traffic" stack="delay" />
      <Bar accessor={(d: DayDelays) => d.loading} name="Loading" stack="delay" />
      <Bar accessor={(d: DayDelays) => d.access} name="No access" stack="delay" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
