import { Calculation, Chain, Given, Interim, Minus, Plus } from "../../../src";
import type { Metric } from "../../../src";

export const title = "Staff movement as a chain";
export const lead = "The chain works per metric too: joiners added, leavers taken away, and every interim closes with its units.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

export default function StaffMovement() {
  return (
    <Calculation aria-label="Staff movement of Carrow & Lisle since 1 January" metrics={METRICS}>
      <Chain>
        <Given label="Staff on 1 January" value={{ heads: 100, fte: 89.9 }} source="Payroll" />
        <Plus label="Joiners" value={{ heads: 5, fte: 4.6 }} />
        <Minus label="Leavers" value={{ heads: 2, fte: 1.8 }} />
        <Interim label="Under contract" />
        <Minus label="Gone on parental leave" value={{ heads: 2, fte: 1.6 }} />
        <Plus label="Back from parental leave" value={{ heads: 1, fte: 0.4 }} explanation="Back part-time, 16 hours a week." />
        <Interim label="Staff on 17 March" />
      </Chain>
    </Calculation>
  );
}
