import { Tooltip, useChart } from "../../../src";

export const title = "With outliers";
export const lead = "`outliers` returns the values beyond the whiskers, a list per box. They are drawn with their box and read in its tooltip, the first five written out; one more than three IQR beyond its box is a ring.";

interface ResponseTime {
  service: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
  outliers: number[];
}

/* Milliseconds per request over the last hour. The whiskers end at the last
   value within 1.5 IQR; the database returned everything beyond as outliers. */
const RESPONSE_TIMES: ResponseTime[] = [
  { service: "Checkout", low: 112, q1: 138, median: 149, q3: 161, high: 195, outliers: [224, 98] },
  { service: "Billing", low: 85, q1: 121, median: 140, q3: 173, high: 238, outliers: [281, 395] },
  { service: "Search", low: 140, q1: 152, median: 158, q3: 165, high: 181, outliers: [189, 214, 104] },
  { service: "Images", low: 99, q1: 126, median: 137, q3: 150, high: 186, outliers: [193, 198, 204, 210, 222, 235, 259, 71] },
];

export default function WithOutliers() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(RESPONSE_TIMES);
  return (
    <Chart height={300} ariaLabel="Response time per service over the last hour, with outliers">
      <XAxis value={(_, i) => i} ticks={[0, 1, 2, 3]} tickFormat={(v) => RESPONSE_TIMES[v]?.service ?? ""} />
      <YAxis tickFormat={(v) => `${v} ms`} />
      <BoxPlot
        name="Response time"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
        outliers="outliers"
      />
      <Tooltip />
    </Chart>
  );
}
