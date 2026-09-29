import { PEOPLE } from "@umriss-ui/demo/worlds/planning";
import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

export const title = "Headcount and full-time equivalents";
export const lead = "`metrics` puts several numbers on every line, each in its own column; every `value` is then an object with a number per metric.";

const METRICS: Metric[] = [
  { id: "heads", label: "Headcount", unit: "HC" },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

/* A full-time week is 40 hours. */
const staffOf = (team: "Web" | "Apps") => {
  const people = PEOPLE.filter((person) => person.team === team);
  return { heads: people.length, fte: people.reduce((sum, person) => sum + person.capacity, 0) / 40 };
};

export default function TwoTeams() {
  return (
    <Calculation aria-label="Staff of Tidewell" metrics={METRICS}>
      <Sum label="Tidewell">
        <Given label="Web team" value={staffOf("Web")} />
        <Given label="Apps team" value={staffOf("Apps")} />
      </Sum>
    </Calculation>
  );
}
