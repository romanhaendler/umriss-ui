import { Button, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Open branches from controls of your own";
export const lead = "`t.unfoldAllBranches` and `t.foldAllBranches` open and close the whole tree; `t.toggleBranch` opens one branch by its key, and `t.branches` holds the keys open now - here to lead from a warning down to its unit.";

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
    budget: 3_400,
    spent: 3_560,
    children: [
      {
        id: "ops-ash",
        name: "Site Ashcombe",
        budget: 2_600,
        spent: 2_790,
        children: [
          { id: "ops-ash-press", name: "Press shop", budget: 1_500, spent: 1_720 },
          { id: "ops-ash-paint", name: "Paint shop", budget: 1_100, spent: 1_070 },
        ],
      },
      { id: "ops-log", name: "Logistics", budget: 800, spent: 770 },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    budget: 1_200,
    spent: 1_150,
    children: [
      { id: "sales-north", name: "Sales North", budget: 700, spent: 690 },
      { id: "sales-south", name: "Sales South", budget: 500, spent: 460 },
    ],
  },
  { id: "finance", name: "Finance", budget: 400, spent: 390 },
];

/** The warning the controlling system raised, with the branches above its unit. */
const WARNING = { unit: "Press shop", path: ["ops", "ops-ash"] };

export default function OpenBranchesFromControls() {
  const t = useTable(UNITS, { rowKey: (u) => u.id, childRows: (u) => u.children });
  const { Table, Column } = t;
  const closed = WARNING.path.filter((key) => !t.branches.includes(key));

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Button size="sm" onClick={t.unfoldAllBranches}>
          Open all
        </Button>
        <Button size="sm" onClick={t.foldAllBranches}>
          Close all
        </Button>
        <Text size="sm" tone="secondary">
          {WARNING.unit} is over budget.
        </Text>
        <Button size="sm" variant="ghost" disabled={closed.length === 0} onClick={() => closed.forEach((key) => t.toggleBranch(key))}>
          Show it
        </Button>
      </Stack>
      <Table ariaLabel="Budget by unit">
        <Column value="name" label="Unit" rowHeader />
        <Column value="budget" label="Budget (k€)" />
        <Column value="spent" label="Spent (k€)" />
      </Table>
    </Stack>
  );
}
