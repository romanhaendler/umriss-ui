import { useTable } from "../../../src";

export const title = "Show absent values";
export const lead = "`null`, `undefined` and `NaN` show a muted dash, sort last and count in no total: the average is over the three estimates given.";

interface WorkItem {
  id: string;
  name: string;
  estimate: number | null;
}

const WORK: WorkItem[] = [
  { id: "w-101", name: "Sign-in with e-mail code", estimate: 18 },
  { id: "w-102", name: "Profile page", estimate: null },
  { id: "w-103", name: "Session handling", estimate: 12 },
  { id: "w-105", name: "Change of address form", estimate: Number.NaN },
  { id: "w-108", name: "Test plan for sign-in", estimate: 10 },
];

export default function AbsentValues() {
  const { Table, Column } = useTable(WORK, { rowKey: (w) => w.id });

  return (
    <Table ariaLabel="Work items">
      <Column value="id" label="Item" rowHeader />
      <Column value="name" label="Title" />
      <Column value="estimate" label="Estimate" aggregate="avg">
        {(hours) => `${hours} h`}
      </Column>
    </Table>
  );
}
