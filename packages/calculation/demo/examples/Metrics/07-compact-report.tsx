import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "A dense staff report";
export const lead =
  "`density=\"compact\"` closes up the head and every metric's column with the lines; a note stays beneath its label, and the figures move beneath the labels by the same measure as in a regular report.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

export default function CompactReport() {
  return (
    <Calculation aria-label="Staff of Tidewell, 17 March" metrics={METRICS} density="compact">
      <Sum label="Tidewell">
        <Sum label="Engineering">
          <Given label="Web team" value={{ heads: 31, fte: 27.5 }} />
          <Given label="Apps team" value={{ heads: 22, fte: 20 }} />
          <Given label="Platform team" value={{ heads: 18, fte: 15.8 }} source="HR system" />
          <Given label="Quality assurance" value={{ heads: 25, fte: 21.2 }} />
        </Sum>
        <Sum label="Customer service">
          <Given label="Service desk" value={{ heads: 40, fte: 31.6 }} />
          <Given label="Returns" value={{ heads: 18, fte: 14.1 }} />
          <Given label="Student staff" value={{ heads: 6, fte: null }} explanation="FTE are not recorded for student staff" />
        </Sum>
        <Given label="Administration" value={{ heads: 12, fte: 10.4 }} />
      </Sum>
    </Calculation>
  );
}
