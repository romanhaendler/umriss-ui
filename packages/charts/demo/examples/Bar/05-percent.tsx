import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { DELAYS, type DayDelays } from "@umriss-ui/demo/worlds/logistics";

export const title = "Show shares of a whole";
export const lead = "`normalize` makes each stack sum to 100 %, so the question moves from how long to of what; `format` still writes minutes.";

const minutes = (v: number) => `${v} min`;

export default function Percent() {
  return (
    <Chart data={DELAYS} height={280} ariaLabel="Share of each cause in the minutes late per working day">
      <XAxis accessor={(d: DayDelays) => d.day} ticks={DELAYS.map((d) => d.day)} tickFormat={(v) => DELAYS[v]?.name ?? ""} />
      <YAxis accessor={(d: DayDelays) => d.traffic} />
      <Bar accessor={(d: DayDelays) => d.traffic} name="Traffic" stack="delay" normalize format={minutes} />
      <Bar accessor={(d: DayDelays) => d.loading} name="Loading" stack="delay" normalize format={minutes} />
      <Bar accessor={(d: DayDelays) => d.access} name="No access" stack="delay" normalize format={minutes} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
