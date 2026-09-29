import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "A number one metric does not have";
export const lead = "`null` for one metric makes absent only what depends on it in that metric, with the reason; the other metric sums on.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

export default function NotRecorded() {
  return (
    <Calculation aria-label="Staff of customer service" metrics={METRICS}>
      <Sum label="Customer service">
        <Given label="Service desk" value={{ heads: 7, fte: 5.9 }} />
        <Given label="Returns" value={{ heads: 3, fte: 2.5 }} />
        <Given
          label="Working students"
          value={{ heads: 4, fte: null }}
          explanation="Paid by the hour; no contracted hours to count."
        />
      </Sum>
    </Calculation>
  );
}
