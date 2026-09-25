import { Stack } from "@umriss-ui/core";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Switch grouping off";
export const lead = "`groupable={false}` on a column keeps it out of the grouping choice; on the `Table` it keeps a fixed report from being grouped at all.";

interface Incident {
  id: string;
  service: string;
  severity: string;
  minutes: number;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", service: "Checkout", severity: "SEV1", minutes: 48 },
  { id: "INC-1046", service: "Image service", severity: "SEV2", minutes: 155 },
  { id: "INC-1045", service: "Sign-in", severity: "SEV2", minutes: 45 },
  { id: "INC-1042", service: "Notifications", severity: "SEV3", minutes: 255 },
];

export default function SwitchedOff() {
  const list = useTable(INCIDENTS, { rowKey: (i) => i.id });
  const report = useTable(INCIDENTS, { rowKey: (i) => i.id });
  return (
    <Stack gap={4}>
      <list.Table ariaLabel="Incidents, groupable but not by id">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <list.Column value="id" label="Incident" rowHeader groupable={false} />
        <list.Column value="service" label="Service" />
        <list.Column value="severity" label="Severity" />
        <list.Column value="minutes" label="Minutes to resolve" groupable={false} aggregate="sum" />
      </list.Table>
      <report.Table ariaLabel="Incident report, never grouped" groupable={false}>
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <report.Column value="id" label="Incident" rowHeader />
        <report.Column value="service" label="Service" />
        <report.Column value="severity" label="Severity" />
        <report.Column value="minutes" label="Minutes to resolve" aggregate="sum" />
      </report.Table>
    </Stack>
  );
}
