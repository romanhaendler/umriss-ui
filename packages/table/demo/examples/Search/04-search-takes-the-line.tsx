import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Search takes the line";

export const lead = "`<Search grow />` takes the rest of the toolbar's line; the column menu and the export stand at its end.";

interface Person {
  name: string;
  role: string;
  city: string;
}

const PEOPLE: Person[] = [
  { name: "Luis Moreno", role: "Product manager", city: "Lisbon" },
  { name: "Hana Sato", role: "Developer", city: "Osaka" },
  { name: "Freya Olsen", role: "Designer", city: "Bergen" },
];

export default function SearchTakesTheLine() {
  const { Table, Column } = useTable(PEOPLE, { rowKey: (p) => p.name });

  return (
    <Table ariaLabel="Apps team">
      <Toolbar>
        <Search grow placeholder="Search people" />
        <ColumnMenu />
        <Export filename="people.csv" />
      </Toolbar>
      <Column value="name" label="Name" rowHeader />
      <Column value="role" label="Role" />
      <Column value="city" label="City" />
    </Table>
  );
}
