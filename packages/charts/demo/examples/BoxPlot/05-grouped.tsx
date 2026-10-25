import { Legend, Tooltip, useChart } from "../../../src";

export const title = "Before and after, side by side";
export const lead = "Box series on one x axis stand beside each other, as bars do. A click in the legend hides one; it leaves the drawing and the y extent.";

interface Spread {
  service: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/* Milliseconds per request, the week before and the week after the release. */
const BEFORE: Spread[] = [
  { service: "Checkout", low: 112, q1: 138, median: 149, q3: 161, high: 195 },
  { service: "Billing", low: 85, q1: 121, median: 140, q3: 173, high: 238 },
  { service: "Search", low: 140, q1: 152, median: 158, q3: 165, high: 181 },
  { service: "Images", low: 99, q1: 126, median: 137, q3: 150, high: 186 },
];
const AFTER: Spread[] = [
  { service: "Checkout", low: 118, q1: 135, median: 143, q3: 152, high: 176 },
  { service: "Billing", low: 101, q1: 119, median: 128, q3: 139, high: 164 },
  { service: "Search", low: 142, q1: 151, median: 157, q3: 164, high: 179 },
  { service: "Images", low: 103, q1: 124, median: 135, q3: 146, high: 172 },
];

export default function Grouped() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(BEFORE);
  return (
    <Chart height={280} aria-label="Response time per service before and after the release">
      <XAxis value="service" />
      <YAxis tickFormat={(v) => `${v} ms`} />
      {[
        { name: "Before", data: BEFORE },
        { name: "After", data: AFTER },
      ].map((one) => (
        <BoxPlot
          key={one.name}
          name={one.name}
          data={one.data}
          median="median"
          lowerQuartile="q1"
          upperQuartile="q3"
          lowerWhisker="low"
          upperWhisker="high"
        />
      ))}
      <Legend />
      <Tooltip />
    </Chart>
  );
}
