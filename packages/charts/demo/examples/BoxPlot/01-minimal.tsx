import { BoxPlot, Chart, Tooltip, XAxis, YAxis } from "../../../src";

export const title = "One box per machine";
export const lead = "Five numbers per row, computed wherever the caller likes. Machines are positions 0, 1, 2 on the numeric x axis; `tickFormat` names them.";

interface CycleTime {
  machine: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/* Seconds per part over the last shift, aggregated by the database. */
const CYCLE_TIMES: CycleTime[] = [
  { machine: "Press", low: 41.2, q1: 43.8, median: 44.9, q3: 46.1, high: 49.5 },
  { machine: "Dryer", low: 38.5, q1: 42.1, median: 44.0, q3: 47.3, high: 53.8 },
  { machine: "Kiln", low: 44.0, q1: 45.2, median: 45.8, q3: 46.5, high: 48.1 },
];

export default function Minimal() {
  return (
    <Chart data={CYCLE_TIMES} height={260} ariaLabel="Cycle time per machine over the last shift">
      <XAxis accessor={(_: CycleTime, i) => i} ticks={[0, 1, 2]} tickFormat={(v) => CYCLE_TIMES[v]?.machine ?? ""} />
      <YAxis accessor={(d: CycleTime) => d.median} tickFormat={(v) => `${v} s`} />
      <BoxPlot
        name="Cycle time"
        median={(d: CycleTime) => d.median}
        lowerQuartile={(d: CycleTime) => d.q1}
        upperQuartile={(d: CycleTime) => d.q3}
        lowerWhisker={(d: CycleTime) => d.low}
        upperWhisker={(d: CycleTime) => d.high}
      />
      <Tooltip />
    </Chart>
  );
}
