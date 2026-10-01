import { Search, Toolbar, ColumnMenu, useTable } from "../../../src";

export const title = "An uneven organisation";
export const lead = "Five levels in one division, one in the staff unit - each unit with figures of its own. The table opens the first level, sorts every level on its own, and the footer sums the top level only: a parent already holds its children. Search for “line” and the matches come with the rows above them, muted.";

interface Unit {
  id: string;
  name: string;
  budget: number;
  spent: number;
  children?: Unit[];
}

const UNITS: Unit[] = [
  {
    id: "ops",
    name: "Operations",
    budget: 4_800,
    spent: 4_950,
    children: [
      {
        id: "ops-ash",
        name: "Site Ashcombe",
        budget: 3_100,
        spent: 3_320,
        children: [
          {
            id: "ops-ash-a",
            name: "Hall A",
            budget: 1_700,
            spent: 1_910,
            children: [
              {
                id: "ops-ash-a-1",
                name: "Line 1",
                budget: 900,
                spent: 1_080,
                children: [
                  { id: "ops-ash-a-1-press", name: "Press cell", budget: 520, spent: 690 },
                  { id: "ops-ash-a-1-weld", name: "Welding cell", budget: 380, spent: 390 },
                ],
              },
              { id: "ops-ash-a-2", name: "Line 2", budget: 800, spent: 830 },
            ],
          },
          { id: "ops-ash-b", name: "Hall B", budget: 1_400, spent: 1_410 },
        ],
      },
      { id: "ops-log", name: "Logistics", budget: 1_700, spent: 1_630 },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    budget: 2_200,
    spent: 2_050,
    children: [
      { id: "sales-n", name: "Region North", budget: 1_200, spent: 1_150 },
      { id: "sales-s", name: "Region South", budget: 1_000, spent: 900 },
    ],
  },
  { id: "staff", name: "Staff unit", budget: 600, spent: 610 },
];

export default function AnUnevenOrganisation() {
  const { Table, Column } = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children, defaultBranches: 1 });
  return (
    <Table ariaLabel="Budget by unit">
      <Toolbar>
        <Search />
        <ColumnMenu />
      </Toolbar>
      <Column value="name" label="Unit" rowHeader searchable />
      <Column value="budget" label="Budget (k€)" aggregate="sum" />
      <Column value="spent" label="Spent (k€)" aggregate="sum" />
      <Column value={(u) => u.spent - u.budget} id="delta" label="Δ (k€)" />
    </Table>
  );
}
