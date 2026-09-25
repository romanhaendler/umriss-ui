import { Search, Toolbar, useTable } from "../../../src";

export const title = "Find a person";

export const lead = "Put a `Search` into the toolbar; it looks through every text column, and the toolbar shows how many rows still match.";

interface Person {
  name: string;
  role: string;
  team: string;
  capacity: number;
}

const PEOPLE: Person[] = [
  { name: "Maya Lindgren", role: "Product manager", team: "Web", capacity: 32 },
  { name: "Arjun Mehta", role: "Developer", team: "Web", capacity: 40 },
  { name: "Noah Fischer", role: "Designer", team: "Web", capacity: 24 },
  { name: "Hana Sato", role: "Developer", team: "Apps", capacity: 40 },
  { name: "Freya Olsen", role: "Designer", team: "Apps", capacity: 40 },
];

export default function FindAPerson() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.name });

  return (
    <Table ariaLabel="People">
      <Toolbar>
        <Search placeholder="Search people" />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="role" label="Role" />
      <Column value="team" label="Team" />
      <Column value="capacity" label="Hours a week" />
    </Table>
  );
}
