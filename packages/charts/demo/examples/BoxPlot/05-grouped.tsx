import { useState } from "react";
import { BoxPlot, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";

export const title = "Before and after, side by side";
export const lead = "Box series on one x axis stand beside each other, as bars do. `hidden` is your state and `onToggle` hands you the clicked entry; a hidden series leaves the drawing and the y extent.";

interface Spread {
  machine: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

const MACHINES = ["Press", "Dryer", "Kiln", "Sorter"];

/* Seconds per part, the week before and the week after the maintenance. */
const BEFORE: Spread[] = [
  { machine: 0, low: 41.2, q1: 43.8, median: 44.9, q3: 46.1, high: 49.5 },
  { machine: 1, low: 38.5, q1: 42.1, median: 44.0, q3: 47.3, high: 53.8 },
  { machine: 2, low: 44.0, q1: 45.2, median: 45.8, q3: 46.5, high: 48.1 },
  { machine: 3, low: 39.9, q1: 42.6, median: 43.7, q3: 45.0, high: 48.6 },
];
const AFTER: Spread[] = [
  { machine: 0, low: 41.8, q1: 43.5, median: 44.3, q3: 45.2, high: 47.6 },
  { machine: 1, low: 40.1, q1: 41.9, median: 42.8, q3: 43.9, high: 46.4 },
  { machine: 2, low: 44.2, q1: 45.1, median: 45.7, q3: 46.4, high: 47.9 },
  { machine: 3, low: 40.3, q1: 42.4, median: 43.5, q3: 44.6, high: 47.2 },
];

export default function Grouped() {
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const toggle = (name: string) => setHidden((h) => (h.includes(name) ? h.filter((n) => n !== name) : [...h, name]));
  return (
    <Chart data={BEFORE} height={280} ariaLabel="Cycle time per machine before and after the maintenance">
      <XAxis accessor={(d: Spread) => d.machine} ticks={[0, 1, 2, 3]} tickFormat={(v) => MACHINES[v] ?? ""} />
      <YAxis accessor={(d: Spread) => d.median} tickFormat={(v) => `${v} s`} />
      {[
        { name: "Before", data: BEFORE },
        { name: "After", data: AFTER },
      ].map((one) => (
        <BoxPlot
          key={one.name}
          name={one.name}
          data={one.data}
          hidden={hidden.includes(one.name)}
          median={(d: Spread) => d.median}
          lowerQuartile={(d: Spread) => d.q1}
          upperQuartile={(d: Spread) => d.q3}
          lowerWhisker={(d: Spread) => d.low}
          upperWhisker={(d: Spread) => d.high}
        />
      ))}
      <Legend onToggle={toggle} />
      <Tooltip />
    </Chart>
  );
}
