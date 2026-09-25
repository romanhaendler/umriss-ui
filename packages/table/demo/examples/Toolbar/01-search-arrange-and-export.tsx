import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Search, arrange and export";

export const lead = "Put the parts into a `Toolbar` inside the table; tick rows and the bulk actions and the selection count join it on the right.";

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", service: "Checkout", severity: "SEV1" },
  { id: "INC-1047", title: "Webhook deliveries delayed", service: "Webhooks", severity: "SEV3" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", service: "Image service", severity: "SEV2" },
  { id: "INC-1045", title: "Sign-in codes arrive late", service: "Sign-in", severity: "SEV2" },
];

export default function SearchArrangeAndExport() {
  const [last, setLast] = useState("Nothing closed yet.");
  const { Table, Column, RowActions, Action } = useTable(INCIDENTS, { rowKey: (i) => i.id });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Incidents">
        <Toolbar>
          <Search placeholder="Search incidents" />
          <ColumnMenu />
          <Export filename="incidents.csv" />
        </Toolbar>
        <Column value="id" label="Incident" rowHeader />
        <Column value="title" label="Title" />
        <Column value="service" label="Service" />
        <Column value="severity" label="Severity" />
        <RowActions>
          <Action bulk onSelect={(list) => setLast(`Closed: ${list.map((i) => i.id).join(", ")}`)}>
            Close
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
