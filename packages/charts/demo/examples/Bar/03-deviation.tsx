import { Tooltip, useChart } from "../../../src";

export const title = "Show bars above and below zero";
export const lead = "A bar's foot is 0, not the bottom of the axis, so one series carries both signs - here the year's forecast against budget.";

/* The year's forecast less its budget per cost centre, in euros - summed
   where the ledger lives, before the chart. */
const DEVIATION = [
  { costCentre: "Sales", euros: 60 },
  { costCentre: "Marketing", euros: 118_840 },
  { costCentre: "Engineering", euros: 1_440 },
  { costCentre: "Design", euros: 720 },
  { costCentre: "Customer service", euros: 980 },
  { costCentre: "Finance", euros: -1_940 },
  { costCentre: "People", euros: -1_480 },
  { costCentre: "IT", euros: -112_560 },
  { costCentre: "Facilities", euros: -2_240 },
];

const signed = (v: number) => (v > 0 ? `+${(v / 1000).toFixed(0)}k` : `${(v / 1000).toFixed(0)}k`);

export default function Deviation() {
  const { Chart, XAxis, YAxis, Bar } = useChart(DEVIATION);
  return (
    <Chart height={280} aria-label="Forecast against budget for the year, per cost centre">
      <XAxis value="costCentre" />
      <YAxis tickFormat={signed} label="€" />
      <Bar value="euros" name="Over budget" />
      <Tooltip mode="x" />
    </Chart>
  );
}
