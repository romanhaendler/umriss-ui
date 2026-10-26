import { Legend, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
interface Reading {
  hour: number;
  units: number;
}

const LINES = [
  "Press 1",
  "Press 2",
  "Welding cell, body shop north",
  "Paint booth",
  "Assembly A",
  "Assembly B",
  "Final inspection and packing",
  "Dispatch",
];

/* Once, outside the component: a series' `data` is compared by reference. Units per hour of every line over a
   shift, a fixed wave of its own for each. */
const BY_LINE = LINES.map((line, l) => ({
  line,
  rows: Array.from({ length: 8 }, (_, hour): Reading => ({ hour, units: Math.round(60 + l * 9 + 14 * Math.sin((hour + l) * 0.9)) })),
}));
const READINGS: readonly Reading[] = BY_LINE.flatMap(({ rows }) => rows);

export const title = "A legend beside the plot";
export const lead =
  "`placement=\"right\"` or `\"left\"` sets the names in a column beside the plot - as wide as the longest one up to a quarter of the chart, a longer name wrapping under its own text. Where the chart is narrower than 480 px, as the last one is, the legend stands above the plot as `\"top\"` does.";

function Shift({ placement, width }: { placement: "left" | "right"; width?: number }) {
  const { Chart, XAxis, YAxis, Line } = useChart(READINGS);
  return (
    <Chart height={280} width={width} aria-label={`Units per hour of eight lines, legend ${placement}`}>
      <XAxis value="hour" />
      <YAxis label="units" />
      {BY_LINE.map(({ line, rows }) => (
        <Line key={line} data={rows} value="units" name={line} />
      ))}
      <Legend placement={placement} />
    </Chart>
  );
}

export default function BesideThePlot() {
  return (
    <div className="pair" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div>
        <p className="pair-caption">placement="right"</p>
        <Shift placement="right" />
      </div>
      <div>
        <p className="pair-caption">placement="left"</p>
        <Shift placement="left" />
      </div>
      <div>
        <p className="pair-caption">placement="right", 400 px wide - above the plot</p>
        <Shift placement="right" width={400} />
      </div>
    </div>
  );
}
