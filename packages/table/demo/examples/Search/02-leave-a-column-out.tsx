import { Search, Toolbar, useTable } from "../../../src";

export const title = "Leave a column out";

export const lead = "Set `searchable={false}` on a text column the search should skip – here the team, so “Web” finds the web developer and not the whole team.";

interface Person {
  name: string;
  role: string;
  team: string;
}

const PEOPLE: Person[] = [
  { name: "Maya Lindgren", role: "Product manager", team: "Web" },
  { name: "Chloe Durand", role: "Web developer", team: "Web" },
  { name: "Kofi Mensah", role: "App developer", team: "Apps" },
  { name: "David Kowalski", role: "QA engineer", team: "Apps" },
];

export default function LeaveAColumnOut() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.name });

  return (
    <Table ariaLabel="People by role">
      <Toolbar>
        <Search placeholder="Search name or role" />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="role" label="Role" />
      <Column value="team" label="Team" searchable={false} />
    </Table>
  );
}
