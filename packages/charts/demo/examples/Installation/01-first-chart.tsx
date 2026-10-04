import { Tooltip, useChart } from "../../../src";

export const title = "Draw a first chart";
export const lead = "Hand `useChart` the rows, then give its `Chart` an axis per direction and a series; each reads its value from a row through `value`.";

interface Hour {
  /** The hour's start, in milliseconds since 1970. */
  t: number;
  signIns: number;
}

const at = (hour: number) => new Date(2026, 2, 17, hour).getTime();

const SIGN_INS: Hour[] = [
  { t: at(0), signIns: 310 },
  { t: at(1), signIns: 220 },
  { t: at(2), signIns: 180 },
  { t: at(3), signIns: 170 },
  { t: at(4), signIns: 205 },
  { t: at(5), signIns: 340 },
  { t: at(6), signIns: 820 },
  { t: at(7), signIns: 1460 },
  { t: at(8), signIns: 2130 },
  { t: at(9), signIns: 2480 },
  { t: at(10), signIns: 2390 },
];

export default function FirstChart() {
  const { Chart, XAxis, YAxis, Line } = useChart(SIGN_INS);
  return (
    <Chart height={240} ariaLabel="Sign-ins per hour today">
      <XAxis value="t" time />
      <YAxis value="signIns" label="Sign-ins per hour" />
      <Line value="signIns" name="Sign-ins" />
      <Tooltip />
    </Chart>
  );
}
