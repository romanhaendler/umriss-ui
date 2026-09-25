import type { ReactNode } from "react";
import { Alert, Button, EmptyState, Stack } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Show loading, empty, failed and no match";
export const lead = "`loading` shows placeholder rows, `empty` what stands without rows, a failed load too; that nothing matches the table recognises itself.";

interface Incident {
  id: string;
  title: string;
  severity: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", severity: "SEV1" },
  { id: "INC-1047", title: "Webhook deliveries delayed", severity: "SEV3" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", severity: "SEV2" },
];

const NONE: Incident[] = [];

function Incidents({ rows, label, ...props }: { rows: Incident[]; label: string; loading?: boolean; empty?: ReactNode; search?: string }) {
  const { Table, Column } = useTable(rows, { rowKey: (i) => i.id, initialView: props.search ? { search: props.search } : undefined });
  return (
    <Table ariaLabel={label} loading={props.loading} empty={props.empty}>
      {props.search !== undefined && (
        <Toolbar>
          <Search placeholder="Search incidents" />
        </Toolbar>
      )}
      <Column value="id" label="Incident" rowHeader />
      <Column value="title" label="Title" />
      <Column value="severity" label="Severity" />
    </Table>
  );
}

export default function States() {
  return (
    <Stack gap={5}>
      <Incidents rows={NONE} label="Incidents are loading" loading />
      <Incidents
        rows={NONE}
        label="Open incidents"
        empty={<EmptyState title="No open incidents" description="New incidents appear here as soon as an alert opens one." />}
      />
      <Incidents
        rows={NONE}
        label="Incidents, not loaded"
        empty={
          <Alert tone="danger" title="The incidents could not be loaded" actions={<Button size="sm">Try again</Button>}>
            The status service did not answer within 10 seconds.
          </Alert>
        }
      />
      <Incidents rows={INCIDENTS} label="Incidents, searched" search="database" />
    </Stack>
  );
}
