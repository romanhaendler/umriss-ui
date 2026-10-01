import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

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

export const title = "Show the worst in the footer";

export const lead = "Set `aggregate=\"worst\"` and the footer names the worst verdict among the rows – whether anyone in the team is overbooked.";

/* Hours booked this week, per person. */
const BOOKED: Record<string, number> = {
  maya: 30, arjun: 44, chloe: 38, noah: 26, eva: 36, luis: 40, hana: 39, kofi: 35, freya: 22, david: 20,
};

/* Booked hours against the person's capacity. */
const BOOKING: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 1.1, side: "upper", severity: "alarm" },
  ],
};

export default function ShowTheWorst() {
  const { Table, Column, VerdictColumn } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <Table ariaLabel="Booked hours this week">
      <Column value="name" label="Name" rowHeader />
      <Column value="team" label="Team" />
      <Column value="capacity" label="Capacity (h)" />
      <VerdictColumn
        id="booked"
        label="Booked"
        value={(p) => (BOOKED[p.id] ?? 0) / p.capacity}
        limits={BOOKING}
        format="percent"
        aggregate="worst"
      />
    </Table>
  );
}
