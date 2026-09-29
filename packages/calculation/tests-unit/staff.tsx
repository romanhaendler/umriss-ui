/* The lead case of the metrics spec: staff by team, area and business line,
   in headcount and full-time equivalents. Shared by the tests. */

import { Given, Sum } from "../src";
import type { Metric } from "../src";

export const STAFF: readonly Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC", decimals: 0 },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

export function staff({ students = null as number | null } = {}) {
  return (
    <Sum label="Industry">
      <Sum label="Production">
        <Given label="Assembly" value={{ heads: 31, fte: 27.5 }} />
        <Given label="Paint shop" value={{ heads: 22, fte: 20.0 }} />
        <Given label="Quality" value={{ heads: 18, fte: 15.8 }} source="HR system" />
        <Given label="Maintenance" value={{ heads: 25, fte: 21.2 }} />
      </Sum>
      <Sum label="Logistics">
        <Given label="Warehouse" value={{ heads: 40, fte: 31.6 }} />
        <Given label="Dispatch" value={{ heads: 18, fte: 14.1 }} />
        <Given label="Student staff" value={{ heads: 6, fte: students }} explanation="FTE are not recorded for student staff" />
      </Sum>
    </Sum>
  );
}
