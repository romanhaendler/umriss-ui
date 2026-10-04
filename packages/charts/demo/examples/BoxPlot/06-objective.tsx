import { Legend, LimitLine, Tooltip, useChart } from "../../../src";

export const title = "Against the objective";
export const lead = "A `LimitLine` shows what was promised. Whether a box breaks it is your judgement, not the library's: this week's whiskers reach past the objective in every region, so its series carries `tone=\"alarm\"`.";

interface Spread {
  region: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

const REGIONS = ["Europe", "Americas", "Asia"];

/* Checkout's 95th percentile per five minutes, in ms, per region and week. */
const LAST_WEEK: Spread[] = [
  { region: 0, low: 182, q1: 204, median: 216, q3: 229, high: 262 },
  { region: 1, low: 191, q1: 213, median: 226, q3: 240, high: 276 },
  { region: 2, low: 176, q1: 199, median: 211, q3: 224, high: 258 },
];
const THIS_WEEK: Spread[] = [
  { region: 0, low: 196, q1: 231, median: 249, q3: 268, high: 318 },
  { region: 1, low: 205, q1: 242, median: 262, q3: 283, high: 339 },
  { region: 2, low: 190, q1: 226, median: 244, q3: 263, high: 311 },
];

export default function AgainstTheObjective() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(LAST_WEEK);
  return (
    <Chart height={280} ariaLabel="Checkout 95th percentile per region and week against its objective">
      <XAxis value="region" ticks={[0, 1, 2]} tickFormat={(v) => REGIONS[v] ?? ""} />
      <YAxis value="median" tickFormat={(v) => `${v} ms`} />
      <BoxPlot
        name="Last week"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
      />
      <BoxPlot
        name="This week"
        data={THIS_WEEK}
        tone="alarm"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
      />
      <LimitLine value={300} severity="alarm" label="Objective" />
      <Legend />
      <Tooltip />
    </Chart>
  );
}
