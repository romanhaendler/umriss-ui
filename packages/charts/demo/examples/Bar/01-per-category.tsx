import { Bar, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { COST_CENTRES, LEDGER, type LedgerRow } from "@umriss-ui/demo/worlds/controlling";

export const title = "One bar per category";
export const lead = "Categories are positions 0, 1, 2 … on the numeric x axis: `ticks` puts a tick under every bar, `tickFormat` names it (ADR-0002).";

const FEBRUARY = LEDGER.filter((row) => row.month === "2026-02");
const place = (row: LedgerRow) => COST_CENTRES.findIndex((c) => c.id === row.costCentre);

export default function PerCategory() {
  return (
    <Chart data={FEBRUARY} height={260} ariaLabel="Actual spend per cost centre in February">
      <XAxis accessor={place} ticks={COST_CENTRES.map((_, i) => i)} tickFormat={(v) => COST_CENTRES[v]?.name ?? ""} />
      <YAxis accessor={(d: LedgerRow) => d.budget} label="€" />
      <Bar accessor={(d: LedgerRow) => d.actual} name="Actual" />
      <Tooltip mode="x" />
    </Chart>
  );
}
