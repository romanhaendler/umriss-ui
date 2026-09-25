import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Show, hide and arrange";

export const lead = "Put a `ColumnMenu` into the toolbar; hiding or moving a column changes header, body and footer together.";

interface CostCentre {
  name: string;
  owner: string;
  budget: number;
  actual: number;
  forecast: number;
}

/* Thousands of euros, for March. */
const CENTRES: CostCentre[] = [
  { name: "Sales", owner: "Helen Marsh", budget: 142, actual: 138, forecast: 144 },
  { name: "Marketing", owner: "Rafael Ortiz", budget: 68, actual: 79, forecast: 83 },
  { name: "Engineering", owner: "Anika Sørensen", budget: 188, actual: 181, forecast: 186 },
];

export default function ShowHideAndArrange() {
  const { Table, Column } = useTable(CENTRES, { rowKey: (c) => c.name });

  return (
    <Table stickyRowHeader ariaLabel="Cost centres in March">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="name" label="Cost centre" rowHeader />
      <Column value="owner" label="Owner" />
      <Column value="budget" label="Budget (k€)" />
      <Column value="actual" label="Actual (k€)" aggregate="sum" />
      <Column value="forecast" label="Forecast (k€)" />
    </Table>
  );
}
