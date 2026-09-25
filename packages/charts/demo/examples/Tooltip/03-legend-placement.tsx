import { Chart, Legend, Line, XAxis, YAxis } from "../../../src";
import { LEDGER, type LedgerRow } from "@umriss-ui/demo/worlds/controlling";

export const title = "Legend above or below";
export const lead = "A `Legend` stands above the plot by default, `placement=\"bottom\"` puts it below; hovering an entry lifts its series.";

const MARKETING = LEDGER.filter((row) => row.costCentre === "CC-1200");
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const month = (row: LedgerRow) => Number(row.month.slice(5)) - 1;

function Marketing({ placement }: { placement?: "bottom" }) {
  return (
    <Chart data={MARKETING} height={220} ariaLabel={`Marketing's budget and forecast, legend ${placement ?? "above"}`}>
      <XAxis accessor={month} tickFormat={(v) => MONTH_NAMES[v] ?? ""} tickCount={4} />
      <YAxis accessor={(d: LedgerRow) => d.forecast} label="€" />
      <Line accessor={(d: LedgerRow) => d.budget} name="Budget" />
      <Line accessor={(d: LedgerRow) => d.forecast} name="Forecast" />
      <Legend placement={placement} />
    </Chart>
  );
}

export default function LegendPlacement() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">no placement - above, the default</p>
        <Marketing />
      </div>
      <div>
        <p className="pair-caption">placement="bottom"</p>
        <Marketing placement="bottom" />
      </div>
    </div>
  );
}
