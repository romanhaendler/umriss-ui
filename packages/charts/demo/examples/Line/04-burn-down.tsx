import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { BURNDOWN, type BurndownPoint } from "@umriss-ui/demo/worlds/planning";

export const title = "Compare progress with a plan";
export const lead = "A sprint's burn-down: the ideal as a quiet dashed line, the hours left as the course, which stops where the days to come begin.";

const day = (v: number) => new Date(v).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });

export default function BurnDown() {
  return (
    <Chart data={BURNDOWN} height={260} ariaLabel="Sprint 14: hours left against the ideal">
      <XAxis accessor={(d: BurndownPoint) => d.t} ticks={BURNDOWN.map((d) => d.t)} tickFormat={day} />
      <YAxis accessor={(d: BurndownPoint) => d.ideal} label="Hours left" />
      <Line accessor={(d: BurndownPoint) => d.ideal} name="Ideal" color="var(--uc-color-text)" dash={[4, 4]} />
      <Line accessor={(d: BurndownPoint) => d.remaining} name="Remaining" markers="always" strokeWidth={2} />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}
