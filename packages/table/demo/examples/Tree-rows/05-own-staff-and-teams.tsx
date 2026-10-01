import { useTable } from "../../../src";

export const title = "Own staff and teams";
export const lead = "A unit can have people of its own and teams beneath it. Its fold opens both: first its own staff on the rail, then its teams a level deeper - one chevron for everything that stands under the row. A unit without staff of its own opens only its teams; a team without teams only its staff.";

interface Employee {
  id: string;
  name: string;
  role: string;
  hours: number;
}

interface Unit {
  id: string;
  name: string;
  headcount: number;
  hours: number;
  /** The people the unit has itself - not those of its teams. */
  staff?: Employee[];
  children?: Unit[];
}

const UNITS: Unit[] = [
  {
    id: "it",
    name: "IT",
    headcount: 6,
    hours: 236,
    staff: [{ id: "e0", name: "Nora Albers", role: "Head of IT", hours: 40 }],
    children: [
      {
        id: "it-ops",
        name: "IT Operations",
        headcount: 3,
        hours: 118,
        staff: [
          { id: "e1", name: "Ada Brenner", role: "Lead", hours: 40 },
          { id: "e2", name: "Jonas Kessler", role: "Administrator", hours: 40 },
          { id: "e3", name: "Mira Otto", role: "Administrator", hours: 38 },
        ],
      },
      {
        id: "it-dev",
        name: "Development",
        headcount: 2,
        hours: 78,
        staff: [
          { id: "e4", name: "Lena Vogt", role: "Developer", hours: 40 },
          { id: "e5", name: "Tom Weiss", role: "Developer", hours: 38 },
        ],
      },
    ],
  },
  {
    id: "fin",
    name: "Finance",
    headcount: 2,
    hours: 72,
    children: [
      {
        id: "fin-ctl",
        name: "Controlling",
        headcount: 2,
        hours: 72,
        staff: [
          { id: "e6", name: "Paula Hartmann", role: "Controller", hours: 40 },
          { id: "e7", name: "Ben Lindner", role: "Analyst", hours: 32 },
        ],
      },
    ],
  },
];

function Staff({ unit }: { unit: Unit }) {
  const { Table, Column } = useTable(unit.staff ?? [], { rowKey: (e) => e.id });
  return (
    <Table ariaLabel={`Staff of ${unit.name}`} density="compact">
      <Column value="name" label="Employee" rowHeader />
      <Column value="role" label="Role" />
      <Column value="hours" label="Hours" />
    </Table>
  );
}

export default function OwnStaffAndTeams() {
  const { Table, Column, RowDetail } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children, defaultBranches: ["it"] });
  return (
    <Table ariaLabel="Units with their staff">
      <Column value="name" label="Unit" rowHeader />
      <Column value="headcount" label="Headcount" />
      <Column value="hours" label="Hours a week" />
      <RowDetail>{(unit) => (unit.staff ? <Staff unit={unit} /> : null)}</RowDetail>
    </Table>
  );
}
