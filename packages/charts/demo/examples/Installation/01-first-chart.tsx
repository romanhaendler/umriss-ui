import { Tooltip, useChart } from "../../../src";

export const title = "Draw a first chart";
export const lead = "Hand `useChart` the rows as they come, then give its `Chart` an axis per direction and a series; the x axis and the series read a row through `value`. With `time` the axis reads the instants an API sends as text.";

/* Sign-ins per hour, as the API sends them: the hour's start in local time. */
const SIGN_INS = [
  { t: "2026-03-17T00:00", signIns: 310 },
  { t: "2026-03-17T01:00", signIns: 220 },
  { t: "2026-03-17T02:00", signIns: 180 },
  { t: "2026-03-17T03:00", signIns: 170 },
  { t: "2026-03-17T04:00", signIns: 205 },
  { t: "2026-03-17T05:00", signIns: 340 },
  { t: "2026-03-17T06:00", signIns: 820 },
  { t: "2026-03-17T07:00", signIns: 1460 },
  { t: "2026-03-17T08:00", signIns: 2130 },
  { t: "2026-03-17T09:00", signIns: 2480 },
  { t: "2026-03-17T10:00", signIns: 2390 },
];

export default function FirstChart() {
  const { Chart, XAxis, YAxis, Line } = useChart(SIGN_INS);
  return (
    <Chart height={240} ariaLabel="Sign-ins per hour today">
      <XAxis value="t" time />
      <YAxis label="Sign-ins per hour" />
      <Line value="signIns" name="Sign-ins" />
      <Tooltip />
    </Chart>
  );
}
