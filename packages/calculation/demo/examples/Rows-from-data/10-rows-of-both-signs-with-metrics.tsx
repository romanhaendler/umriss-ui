import { Calculation, Chain, Given, Interim, Plus, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "Rows of both signs with metrics";
export const lead =
  "With metrics a line has one operator and a number per metric. Where they all point the same way, the line shows its contribution as everywhere else; a metric that is zero or missing does not count. Where they point in different directions – a part-timer joins: one more head, half a position less – the line keeps its written operator and every number its sign.";

const STAFF: readonly Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC", decimals: 0 },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

/* The quarter's movements from the HR system. */
const MOVEMENTS = [
  { id: "sales", name: "Transferred to sales", heads: -4, fte: -3.5 },
  { id: "hours", name: "Hours reduced", heads: 0, fte: -1.5 },
  { id: "part-time", name: "Full-timer replaced by two part-timers", heads: 1, fte: -0.5 },
  { id: "joiners", name: "Joiners", heads: 6, fte: 5.8 },
];

export default function RowsOfBothSignsWithMetrics() {
  return (
    <Calculation aria-label="Staff movement, logistics, third quarter" metrics={STAFF}>
      <Chain>
        <Given label="Staff on 30 June" value={{ heads: 64, fte: 48.9 }} />
        <Plus>
          <Sum label="Movements">
            {MOVEMENTS.map((movement) => (
              <Given key={movement.id} label={movement.name} value={{ heads: movement.heads, fte: movement.fte }} />
            ))}
          </Sum>
        </Plus>
        <Interim label="Staff on 30 September" />
      </Chain>
    </Calculation>
  );
}
