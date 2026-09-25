import { Bar, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { COST_CENTRES, LEDGER } from "@umriss-ui/demo/worlds/controlling";

export const title = "Show bars above and below zero";
export const lead = "A bar's foot is 0, not the bottom of the axis, so one series carries both signs - here the year's forecast against budget.";

interface Deviation {
  place: number;
  euros: number;
}

const DEVIATION: Deviation[] = COST_CENTRES.map((centre, place) => {
  const rows = LEDGER.filter((row) => row.costCentre === centre.id);
  const sum = (pick: (row: (typeof rows)[number]) => number) => rows.reduce((total, row) => total + pick(row), 0);
  return { place, euros: sum((row) => row.forecast) - sum((row) => row.budget) };
});

const signed = (v: number) => (v > 0 ? `+${(v / 1000).toFixed(0)}k` : `${(v / 1000).toFixed(0)}k`);

export default function Deviation() {
  return (
    <Chart data={DEVIATION} height={280} ariaLabel="Forecast against budget for the year, per cost centre">
      <XAxis accessor={(d: Deviation) => d.place} ticks={COST_CENTRES.map((_, i) => i)} tickFormat={(v) => COST_CENTRES[v]?.name ?? ""} />
      <YAxis accessor={(d: Deviation) => d.euros} tickFormat={signed} label="€" />
      <Bar accessor={(d: Deviation) => d.euros} name="Over budget" />
      <Tooltip mode="x" />
    </Chart>
  );
}
