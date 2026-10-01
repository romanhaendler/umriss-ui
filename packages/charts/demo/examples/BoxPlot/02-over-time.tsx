import { BoxPlot, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics } from "@umriss-ui/demo/worlds/operations";

export const title = "A box per hour on a time axis";
export const lead = "Checkout's median latency, every five minutes, gathered into one box per hour. The quartiles and the whisker rule are the caller's - here the last value within 1.5 IQR - and the library draws what it is given.";

const HOUR = 3_600_000;

interface HourBox {
  hour: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/** The value at share p of the sorted values, between neighbours. */
function quantile(sorted: readonly number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  return (sorted[lo] as number) + ((sorted[Math.ceil(at)] as number) - (sorted[lo] as number)) * (at - lo);
}

function hourBoxes(): HourBox[] {
  const byHour = new Map<number, number[]>();
  for (const point of metrics("checkout")) {
    const hour = Math.floor(point.t / HOUR) * HOUR;
    byHour.set(hour, [...(byHour.get(hour) ?? []), point.p50]);
  }
  return [...byHour].map(([hour, values]) => {
    const sorted = values.sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const q3 = quantile(sorted, 0.75);
    const reach = 1.5 * (q3 - q1);
    const inside = sorted.filter((v) => v >= q1 - reach && v <= q3 + reach);
    return { hour, low: inside[0] as number, q1, median: quantile(sorted, 0.5), q3, high: inside[inside.length - 1] as number };
  });
}

const BOXES = hourBoxes();

export default function OverTime() {
  return (
    <Chart data={BOXES} height={280} ariaLabel="Checkout median latency per hour today">
      <XAxis accessor={(d: HourBox) => d.hour} time />
      <YAxis accessor={(d: HourBox) => d.median} tickFormat={(v) => `${v} ms`} />
      <BoxPlot
        name="Checkout p50"
        median={(d: HourBox) => d.median}
        lowerQuartile={(d: HourBox) => d.q1}
        upperQuartile={(d: HourBox) => d.q3}
        lowerWhisker={(d: HourBox) => d.low}
        upperWhisker={(d: HourBox) => d.high}
      />
      <Tooltip />
    </Chart>
  );
}
