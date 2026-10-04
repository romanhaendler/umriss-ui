import { Tooltip, useChart } from "../../../src";

export const title = "One box per service";
export const lead = "Five numbers per row, computed wherever the caller likes. Services are positions 0, 1, 2 on the numeric x axis; `tickFormat` names them.";

interface ResponseTime {
  service: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/* Milliseconds per request over the last hour, aggregated by the database. */
const RESPONSE_TIMES: ResponseTime[] = [
  { service: "Checkout", low: 112, q1: 138, median: 149, q3: 161, high: 195 },
  { service: "Billing", low: 85, q1: 121, median: 140, q3: 173, high: 238 },
  { service: "Search", low: 140, q1: 152, median: 158, q3: 165, high: 181 },
];

export default function Minimal() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(RESPONSE_TIMES);
  return (
    <Chart height={260} ariaLabel="Response time per service over the last hour">
      <XAxis value={(_, i) => i} ticks={[0, 1, 2]} tickFormat={(v) => RESPONSE_TIMES[v]?.service ?? ""} />
      <YAxis value="median" tickFormat={(v) => `${v} ms`} />
      <BoxPlot
        name="Response time"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
      />
      <Tooltip />
    </Chart>
  );
}
