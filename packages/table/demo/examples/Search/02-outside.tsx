import { Card, CardBody, CardHeader, Stack } from "@umriss-ui/core";
import { Search, useTable } from "../../../src";

export const title = "The search at another place";

/* The application's page layout decides where a search stands - not the table.
   Here it stands in the header of a card, far away from the table, and takes the
   table as `of`. The ratio of matches and "Reset" appear at the table all the
   same, because they belong to what is being restricted: where no table toolbar
   stands, the table puts one there as soon as a search is connected to it. */

interface Part {
  number: string;
  description: string;
}

const PARTS: Part[] = [
  { number: "T-1180", description: "Flange DN 50" },
  { number: "T-1204", description: "Shaft Ø 32 × 410" },
  { number: "T-1311", description: "Bearing cap" },
];

export default function SearchOutside() {
  const t = useTable(PARTS, { rowKey: (part) => part.number });
  const { Table, Column } = t;

  return (
    <Card>
      <CardHeader divider title="Stores" actions={<Search of={t} placeholder="Search part" aria-label="Search the stores" />} />
      <CardBody>
        <Stack gap={3}>
          <Table ariaLabel="Stores">
            <Column value="number" label="Part" rowHeader />
            <Column value="description" label="Description" />
          </Table>
        </Stack>
      </CardBody>
    </Card>
  );
}
