import { Legend, Tooltip, useChart } from "../../../src";

export const title = "Show shares of a whole";
export const lead = "`normalize` makes each stack sum to 100 %, so the question moves from how long to of what; `format` still writes minutes.";

/* Minutes late across all tours per working day, by cause - two weeks, 2 to
   13 March. On the first Wednesday the loading log was not kept: a gap, not
   a zero. On the second Thursday a closed bridge takes the day. */
const DELAYS = [
  { day: "Mon 2", traffic: 61, loading: 32, access: 10 },
  { day: "Tue 3", traffic: 47, loading: 46, access: 27 },
  { day: "Wed 4", traffic: 49, loading: null, access: 22 },
  { day: "Thu 5", traffic: 40, loading: 44, access: 7 },
  { day: "Fri 6", traffic: 48, loading: 44, access: 27 },
  { day: "Mon 9", traffic: 67, loading: 41, access: 8 },
  { day: "Tue 10", traffic: 58, loading: 50, access: 13 },
  { day: "Wed 11", traffic: 58, loading: 18, access: 14 },
  { day: "Thu 12", traffic: 168, loading: 26, access: 10 },
  { day: "Fri 13", traffic: 57, loading: 18, access: 18 },
];

const minutes = (v: number) => `${v} min`;

export default function Percent() {
  const { Chart, XAxis, YAxis, Bar } = useChart(DELAYS);
  return (
    <Chart height={280} aria-label="Share of each cause in the minutes late per working day">
      <XAxis value="day" />
      <YAxis />
      <Bar value="traffic" name="Traffic" stack="delay" normalize format={minutes} />
      <Bar value="loading" name="Loading" stack="delay" normalize format={minutes} />
      <Bar value="access" name="No access" stack="delay" normalize format={minutes} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
