import { RadioGroup } from "@umriss-ui/core";
import { columnFilter, useTable } from "../../../src";

export const title = "Offer conditions of your own";
export const lead = "A filter from `columnFilter<number, …>` fits every number column of every table; an absent value matches none of its conditions.";

type Load = "part-time" | "full-time";

const LOADS = [
  { value: "part-time", label: "Part-time – under 32 h" },
  { value: "full-time", label: "Full-time – 32 h and more" },
] as const;

const workload = columnFilter<number, Load>({
  matches: (hours, load) => (load === "part-time" ? hours < 32 : hours >= 32),
  Input: ({ condition, setCondition, column }) => (
    <RadioGroup aria-label={column.label} size="sm" options={LOADS} value={condition} onChange={(load) => setCondition(load)} />
  ),
  describe: (load) => load,
});

interface Person {
  id: string;
  name: string;
  role: string;
  capacity: number | null;
}

const PEOPLE: Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", capacity: 24 },
  { id: "kofi", name: "Kofi Mensah", role: "Developer", capacity: 32 },
  { id: "david", name: "David Kowalski", role: "QA engineer", capacity: 20 },
  { id: "new", name: "Starts in April", role: "Developer", capacity: null },
];

export default function OwnFilter() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.id });

  return (
    <Table ariaLabel="Team">
      <Column value="name" label="Person" rowHeader />
      <Column value="role" label="Role" />
      <Column value="capacity" label="Hours a week" filter={workload} />
    </Table>
  );
}
