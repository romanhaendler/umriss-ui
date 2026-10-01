import { Calculation, Given, Sum } from "../../../src";
import type { Metric } from "../../../src";

/* Data from the planning world, written out here so the example runs on its own. */

interface Person {
  id: string;
  name: string;
  role: "Developer" | "Designer" | "Product manager" | "QA engineer";
  team: "Web" | "Apps";
  /** Hours a week they can be planned for. */
  capacity: number;
}

const PEOPLE: readonly Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", team: "Web", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", team: "Web", capacity: 40 },
  { id: "chloe", name: "Chloe Durand", role: "Developer", team: "Web", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", team: "Web", capacity: 24 },
  { id: "eva", name: "Eva Novak", role: "QA engineer", team: "Web", capacity: 40 },
  { id: "luis", name: "Luis Moreno", role: "Product manager", team: "Apps", capacity: 40 },
  { id: "hana", name: "Hana Sato", role: "Developer", team: "Apps", capacity: 40 },
  { id: "kofi", name: "Kofi Mensah", role: "Developer", team: "Apps", capacity: 32 },
  { id: "freya", name: "Freya Olsen", role: "Designer", team: "Apps", capacity: 40 },
  { id: "david", name: "David Kowalski", role: "QA engineer", team: "Apps", capacity: 20 },
];

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
