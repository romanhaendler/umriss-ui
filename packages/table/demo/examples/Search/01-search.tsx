import { Search, Toolbar, useTable } from "../../../src";

export const title = "The search";

/* `Search` searches the columns whose value is text - without a statement
   exactly those; `searchable` on a column says it differently. What is searched
   is the value, not the presentation.

   A search term resets to page one. It does not appear as a condition - the
   field shows it already - but it counts: on the right of the table toolbar
   stands, as long as it restricts, the ratio of matches to the whole set and
   "Reset". */

interface Part {
  number: string;
  description: string;
  location: string;
  stock: number;
}

const PARTS: Part[] = [
  { number: "T-1180", description: "Flange DN 50", location: "Rack 4", stock: 240 },
  { number: "T-1204", description: "Shaft Ø 32 × 410", location: "Rack 1", stock: 18 },
  { number: "T-1311", description: "Bearing cap", location: "Rack 4", stock: 1065 },
  { number: "T-1320", description: "Flange DN 80", location: "Rack 2", stock: 96 },
];

export default function SearchExample() {
  const { Table, Column } = useTable(PARTS, { rowKey: (p) => p.number });

  return (
    <Table ariaLabel="Parts">
      <Toolbar>
        <Search placeholder="Search part" />
      </Toolbar>
      <Column value="number" label="Part" rowHeader />
      <Column value="description" label="Description" />
      <Column value="location" label="Location" searchable={false} />
      <Column value="stock" label="Stock" />
    </Table>
  );
}
