import { useTable } from "../../../src";

export const title = "A first table";
export const lead = "`useTable` binds the row kind once; its `Column` offers exactly the fields a person has, and `rowKey` names each row.";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
  capacity: number;
}

const PEOPLE: Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", team: "Web", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", team: "Web", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", team: "Web", capacity: 24 },
  { id: "hana", name: "Hana Sato", role: "Developer", team: "Apps", capacity: 40 },
  { id: "david", name: "David Kowalski", role: "QA engineer", team: "Apps", capacity: 20 },
];

export default function FirstTable() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <Table ariaLabel="Team">
      <Column value="name" label="Name" rowHeader />
      <Column value="role" label="Role" />
      <Column value="team" label="Team" />
      <Column value="capacity" label="Hours a week" />
    </Table>
  );
}
