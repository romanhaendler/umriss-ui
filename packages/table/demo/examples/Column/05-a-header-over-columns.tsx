import { ColumnGroup, ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "A header over columns";
export const lead = "`ColumnGroup` wraps `Column`s and puts its `label` over them in a second head row: \"Q1\" over Jan, Feb and Mar. The cell spans the group's visible columns and disappears with the last of them; a column cannot leave its group by reordering, a group split by pinning shows its label over each part, and an export writes \"Q1 · Jan\".";

interface Sales {
  region: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
}

const SALES: Sales[] = [
  { region: "North", jan: 120, feb: 135, mar: 150, apr: 160, may: 155, jun: 170 },
  { region: "South", jan: 90, feb: 95, mar: 110, apr: 105, may: 120, jun: 125 },
  { region: "West", jan: 70, feb: 85, mar: 80, apr: 95, may: 100, jun: 98 },
];

export default function HeaderOverColumns() {
  const { Table, Column } = useTable(SALES, { rowKey: (s) => s.region });

  return (
    <Table aria-label="Sales by month" stickyHeader>
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="region" label="Region" rowHeader />
      <ColumnGroup label="Q1">
        <Column value="jan" label="Jan" numeric />
        <Column value="feb" label="Feb" numeric />
        <Column value="mar" label="Mar" numeric />
      </ColumnGroup>
      <ColumnGroup label="Q2">
        <Column value="apr" label="Apr" numeric />
        <Column value="may" label="May" numeric />
        <Column value="jun" label="Jun" numeric />
      </ColumnGroup>
    </Table>
  );
}
