import { useTable } from "../../../src";

export const title = "Employees in the detail";
export const lead = "When the bottom of the hierarchy is records of another kind, the tree carries the summarising columns and a leaf's `RowDetail` holds a table of its own - with every column the employees have, and its own sort.";

interface Employee {
  id: string;
  name: string;
  role: string;
  since: string;
  hours: number;
}

interface Team {
  id: string;
  name: string;
  headcount: number;
  hours: number;
  employees?: Employee[];
  children?: Team[];
}

const TEAMS: Team[] = [
  {
    id: "it",
    name: "IT",
    headcount: 5,
    hours: 196,
    children: [
      {
        id: "it-ops",
        name: "IT Operations",
        headcount: 3,
        hours: 118,
        employees: [
          { id: "e1", name: "Ada Brenner", role: "Lead", since: "2016", hours: 40 },
          { id: "e2", name: "Jonas Kessler", role: "Administrator", since: "2021", hours: 40 },
          { id: "e3", name: "Mira Otto", role: "Administrator", since: "2024", hours: 38 },
        ],
      },
      {
        id: "it-dev",
        name: "Development",
        headcount: 2,
        hours: 78,
        employees: [
          { id: "e4", name: "Lena Vogt", role: "Developer", since: "2019", hours: 40 },
          { id: "e5", name: "Tom Weiss", role: "Developer", since: "2023", hours: 38 },
        ],
      },
    ],
  },
];

function Employees({ team }: { team: Team }) {
  const { Table, Column } = useTable(team.employees ?? [], { rowKey: (e) => e.id, defaultSort: { column: "name", direction: "asc" } });
  return (
    <Table ariaLabel={`Employees of ${team.name}`} density="compact">
      <Column value="name" label="Employee" rowHeader />
      <Column value="role" label="Role" />
      <Column value="since" label="Since" />
      <Column value="hours" label="Hours" />
    </Table>
  );
}

export default function EmployeesInTheDetail() {
  const { Table, Column, RowDetail } = useTable(TEAMS, { rowKey: (t) => t.id, childRows: (t) => t.children, defaultBranches: 1 });
  return (
    <Table ariaLabel="Teams">
      <Column value="name" label="Team" rowHeader />
      <Column value="headcount" label="Headcount" />
      <Column value="hours" label="Hours a week" />
      <RowDetail>{(team) => (team.employees ? <Employees team={team} /> : null)}</RowDetail>
    </Table>
  );
}
