import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Name the row";
export const lead = "`rowHeader` makes a column the row's name: it cannot be hidden, and the row's checkbox and actions are read out with it.";

interface Incident {
  id: string;
  title: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out" },
  { id: "INC-1047", title: "Webhook deliveries delayed" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads" },
];

export default function RowHeader() {
  const [last, setLast] = useState("Nothing opened yet.");
  const { Table, Column, RowActions, Action } = useTable(INCIDENTS, { rowKey: (i) => i.id });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Incidents">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <Column value="id" label="Incident" rowHeader />
        <Column value="title" label="Title" />
        <RowActions>
          <Action onSelect={(i) => setLast(`${i.id} opened`)}>Open</Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
