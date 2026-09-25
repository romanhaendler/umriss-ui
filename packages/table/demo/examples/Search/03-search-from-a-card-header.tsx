import { Card, CardBody, CardHeader } from "@umriss-ui/core";
import { Search, useTable } from "../../../src";

export const title = "Search from a card header";

export const lead = "Pass the table as `of` and the search can stand anywhere; the match count and “Reset” still appear at the table.";

interface Person {
  name: string;
  role: string;
}

const PEOPLE: Person[] = [
  { name: "Luis Moreno", role: "Product manager" },
  { name: "Hana Sato", role: "Developer" },
  { name: "Freya Olsen", role: "Designer" },
];

export default function SearchFromACardHeader() {
  const t = useTable(PEOPLE, { rowKey: (p) => p.name });
  const { Table, Column } = t;

  return (
    <Card>
      <CardHeader divider title="Apps team" actions={<Search of={t} placeholder="Search people" aria-label="Search the Apps team" />} />
      <CardBody>
        <Table ariaLabel="Apps team">
          <Column value="name" label="Name" rowHeader />
          <Column value="role" label="Role" />
        </Table>
      </CardBody>
    </Card>
  );
}
