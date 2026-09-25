import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { TooltipHit } from "../../../src";

export const title = "Fix the domain and name the ticks";
export const lead = "A fixed `domain` holds the axis still, `tickFormat` writes the labels, and a typed `Tooltip` renders its own content.";

interface Week {
  week: number;
  /** Share of the team's capacity booked on client work, in per cent. */
  web: number;
  apps: number;
}

const BOOKED: Week[] = [
  { week: 1, web: 62, apps: 71 },
  { week: 2, web: 74, apps: 78 },
  { week: 3, web: 81, apps: 76 },
  { week: 4, web: 79, apps: 69 },
  { week: 5, web: 86, apps: 72 },
  { week: 6, web: 91, apps: 80 },
  { week: 7, web: 88, apps: 84 },
  { week: 8, web: 70, apps: 88 },
  { week: 9, web: 77, apps: 93 },
  { week: 10, web: 83, apps: 90 },
  { week: 11, web: 85, apps: 82 },
  { week: 12, web: 80, apps: 86 },
];

const percent = (v: number) => `${v.toFixed(0)} %`;

function WeekTooltip({ hit }: { hit: TooltipHit<Week> }) {
  const point = hit.points[0];
  return (
    <div className="custom-tooltip">
      <strong>Week {hit.xValue}</strong>
      {point === undefined ? null : (
        <span>
          {point.seriesName}: {percent(point.yValue)} booked
        </span>
      )}
    </div>
  );
}

export default function Configuration() {
  return (
    <Chart data={BOOKED} height={280} padding={{ top: 12, right: 16, bottom: 8, left: 8 }} ariaLabel="Share of capacity booked per team and week">
      <XAxis accessor={(d: Week) => d.week} label="Week" tickCount={6} />
      <YAxis accessor={(d: Week) => d.web} domain={[0, 100]} tickFormat={percent} label="Booked" />
      <Line accessor={(d: Week) => d.web} name="Web" markers="always" strokeWidth={2} />
      <Line accessor={(d: Week) => d.apps} name="Apps" markers="always" color="#7c3aed" />
      <Legend placement="bottom" />
      {/* The type argument makes the hit fully typed in the render prop. */}
      <Tooltip<Week> mode="nearest" render={(hit) => <WeekTooltip hit={hit} />} />
    </Chart>
  );
}
