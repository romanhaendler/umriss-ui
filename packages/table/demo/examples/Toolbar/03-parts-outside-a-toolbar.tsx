import { Card, CardBody, CardHeader, Stack } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, useTable } from "../../../src";

export const title = "Parts outside a toolbar";

export const lead = "Each part takes the table as `of` and stands where you put it: here in a card header at `size=\"md\"`, the card's height, with the pager above the rows.";

/* Outside a toolbar a part is `sm` unless it says otherwise. The pager stands
   before the table: placed after it, it registers only after the first frame. */

interface Incident {
  id: string;
  title: string;
  service: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "Checkout" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "Webhooks" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "Images" },
  { id: "INC-1045", title: "Search returns stale prices", service: "Search" },
  { id: "INC-1044", title: "Password reset mails late", service: "Identity" },
  { id: "INC-1043", title: "Nightly report missing a day", service: "Reporting" },
];

export default function PartsOutsideAToolbar() {
  const t = useTable(INCIDENTS, { rowKey: (i) => i.id, pageSize: 4 });
  const { Table, Column } = t;

  return (
    <Card>
      <CardHeader
        divider
        title="Incidents"
        actions={
          <Stack direction="row" gap={2} align="center" wrap>
            <Search of={t} size="md" placeholder="Search incidents" />
            <ColumnMenu of={t} size="md" />
            <Export of={t} size="md" filename="incidents.csv" />
          </Stack>
        }
      />
      <CardBody>
        <Stack gap={2}>
          <Pagination of={t} pageSizes={[4, 10]} />
          <Table ariaLabel="Incidents">
            <Column value="id" label="Incident" rowHeader />
            <Column value="title" label="Title" />
            <Column value="service" label="Service" />
          </Table>
        </Stack>
      </CardBody>
    </Card>
  );
}
