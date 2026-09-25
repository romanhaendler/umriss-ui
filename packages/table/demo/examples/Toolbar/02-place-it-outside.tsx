import { Stack } from "@umriss-ui/core";
import { Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Place it outside the table";

export const lead = "Keep what `useTable` returns and pass it as `of` to the toolbar and to each part in it; put the toolbar before the table.";

interface Incident {
  id: string;
  title: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out" },
  { id: "INC-1047", title: "Webhook deliveries delayed" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads" },
];

export default function PlaceItOutside() {
  const t = useTable(INCIDENTS, { rowKey: (i) => i.id });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Toolbar of={t}>
        <Search of={t} placeholder="Search incidents" />
        <Export of={t} filename="incidents.csv" />
      </Toolbar>
      <Table ariaLabel="Incidents">
        <Column value="id" label="Incident" rowHeader />
        <Column value="title" label="Title" />
      </Table>
    </Stack>
  );
}
