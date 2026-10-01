import { useTable } from "../../../src";

export const title = "A small tree";
export const lead = "Name the children of a row with `childRows`: the table shows the roots, and every row with children gets a fold in the first column that opens the next level beneath it.";

interface Unit {
  id: string;
  name: string;
  headcount: number;
  children?: Unit[];
}

const UNITS: Unit[] = [
  {
    id: "sales",
    name: "Sales",
    headcount: 42,
    children: [
      { id: "sales-north", name: "Sales North", headcount: 18 },
      { id: "sales-south", name: "Sales South", headcount: 24 },
    ],
  },
  { id: "finance", name: "Finance", headcount: 11 },
  {
    id: "operations",
    name: "Operations",
    headcount: 96,
    children: [
      { id: "site", name: "Site Ashcombe", headcount: 81 },
      { id: "logistics", name: "Logistics", headcount: 15 },
    ],
  },
];

export default function ASmallTree() {
  const { Table, Column } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children });
  return (
    <Table ariaLabel="Organisation">
      <Column value="name" label="Unit" rowHeader />
      <Column value="headcount" label="Headcount" />
    </Table>
  );
}
