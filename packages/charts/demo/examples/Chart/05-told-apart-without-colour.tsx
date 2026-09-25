import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { LEDGER, type LedgerRow } from "@umriss-ui/demo/worlds/controlling";

export const title = "Tell series apart without colour";
export const lead = "With `encoding=\"marks\"` each series also carries a dash and a marker shape by its palette place, for readers and printouts without colour.";

const CENTRES = [
  { id: "CC-1100", name: "Sales" },
  { id: "CC-1200", name: "Marketing" },
  { id: "CC-3100", name: "Customer service" },
  { id: "CC-4400", name: "Facilities" },
];

const month = (row: LedgerRow) => Number(row.month.slice(5)) - 1;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Forecasts({ encoding }: { encoding?: "marks" }) {
  return (
    <Chart data={LEDGER} height={240} ariaLabel="Forecast of four cost centres per month" encoding={encoding}>
      <XAxis accessor={month} tickFormat={(v) => MONTH_NAMES[v] ?? ""} tickCount={6} />
      <YAxis accessor={(d: LedgerRow) => d.forecast} label="€" />
      {CENTRES.map((c) => (
        <Line
          key={c.id}
          data={LEDGER.filter((row) => row.costCentre === c.id)}
          accessor={(d: LedgerRow) => d.forecast}
          name={c.name}
        />
      ))}
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function ToldApartWithoutColour() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">by colour - the default</p>
        <Forecasts />
      </div>
      <div>
        <p className="pair-caption">encoding="marks"</p>
        <Forecasts encoding="marks" />
      </div>
    </div>
  );
}
