import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { COST_CENTRES, LEDGER, type LedgerRow } from "@umriss-ui/demo/worlds/controlling";

export const title = "Group bars side by side";
export const lead = "Bar series on one x axis stand beside each other; give each the same `barWidth`, and the reference a quiet `color`.";

const FEBRUARY = LEDGER.filter((row) => row.month === "2026-02");
const place = (row: LedgerRow) => COST_CENTRES.findIndex((c) => c.id === row.costCentre);

export default function Grouped() {
  return (
    <Chart data={FEBRUARY} height={280} ariaLabel="Budget and actual per cost centre in February">
      <XAxis accessor={place} ticks={COST_CENTRES.map((_, i) => i)} tickFormat={(v) => COST_CENTRES[v]?.name ?? ""} />
      <YAxis accessor={(d: LedgerRow) => d.budget} label="€" />
      {/* A token, so that it follows the colour scheme. */}
      <Bar accessor={(d: LedgerRow) => d.budget} name="Budget" color="var(--uc-color-text)" barWidth={0.7} />
      <Bar accessor={(d: LedgerRow) => d.actual} name="Actual" barWidth={0.7} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
