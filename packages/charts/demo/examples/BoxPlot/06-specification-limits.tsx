import { BoxPlot, Chart, Legend, LimitLine, Tooltip, XAxis, YAxis } from "../../../src";

export const title = "Against the specification";
export const lead = "`LimitLine`s show what the customer accepts. Whether a box is out of it is your judgement, not the library's: here the late shift's whiskers reach past the upper limit, so its series carries `tone=\"alarm\"`.";

interface Spread {
  die: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

const DIES = ["Die A", "Die B", "Die C"];

/* Tile length after firing, in mm, per press die and shift. */
const EARLY: Spread[] = [
  { die: 0, low: 598.6, q1: 599.4, median: 599.8, q3: 600.2, high: 601.0 },
  { die: 1, low: 598.9, q1: 599.6, median: 600.0, q3: 600.4, high: 601.2 },
  { die: 2, low: 598.4, q1: 599.2, median: 599.7, q3: 600.1, high: 600.9 },
];
const LATE: Spread[] = [
  { die: 0, low: 599.1, q1: 600.3, median: 600.9, q3: 601.6, high: 602.9 },
  { die: 1, low: 599.4, q1: 600.6, median: 601.2, q3: 601.9, high: 603.4 },
  { die: 2, low: 598.9, q1: 600.1, median: 600.8, q3: 601.4, high: 602.7 },
];

const mm = (v: number) => `${v.toFixed(1)} mm`;

export default function SpecificationLimits() {
  return (
    <Chart data={EARLY} height={280} ariaLabel="Tile length per die and shift against the specification">
      <XAxis accessor={(d: Spread) => d.die} ticks={[0, 1, 2]} tickFormat={(v) => DIES[v] ?? ""} />
      <YAxis accessor={(d: Spread) => d.median} tickFormat={mm} />
      <BoxPlot
        name="Early shift"
        median={(d: Spread) => d.median}
        lowerQuartile={(d: Spread) => d.q1}
        upperQuartile={(d: Spread) => d.q3}
        lowerWhisker={(d: Spread) => d.low}
        upperWhisker={(d: Spread) => d.high}
      />
      <BoxPlot
        name="Late shift"
        data={LATE}
        tone="alarm"
        median={(d: Spread) => d.median}
        lowerQuartile={(d: Spread) => d.q1}
        upperQuartile={(d: Spread) => d.q3}
        lowerWhisker={(d: Spread) => d.low}
        upperWhisker={(d: Spread) => d.high}
      />
      <LimitLine value={602.5} severity="alarm" label="USL" />
      <LimitLine value={597.5} severity="alarm" label="LSL" />
      <Legend />
      <Tooltip />
    </Chart>
  );
}
