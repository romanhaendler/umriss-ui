import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Let people choose the grouping";
export const lead = "With a `ColumnMenu` people group without any code: under Grouping, the first choice is the outer level, up to three.";

interface Incident {
  id: string;
  service: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  assignee: string;
  minutes: number;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", service: "Checkout", severity: "SEV1", assignee: "Jonas Keller", minutes: 48 },
  { id: "INC-1047", service: "Webhooks", severity: "SEV3", assignee: "Ines Duarte", minutes: 195 },
  { id: "INC-1046", service: "Image service", severity: "SEV2", assignee: "Tomasz Nowak", minutes: 155 },
  { id: "INC-1045", service: "Sign-in", severity: "SEV2", assignee: "Ada Mwangi", minutes: 45 },
  { id: "INC-1043", service: "Search", severity: "SEV1", assignee: "Leila Haddad", minutes: 85 },
  { id: "INC-1042", service: "Notifications", severity: "SEV3", assignee: "Sam Okafor", minutes: 255 },
  { id: "INC-1041", service: "Billing", severity: "SEV2", assignee: "Priya Raman", minutes: 150 },
];

export default function NothingDeclared() {
  const { Table, Column } = useTable(INCIDENTS, { rowKey: (i) => i.id });
  return (
    <Table ariaLabel="Incidents">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="id" label="Incident" rowHeader />
      <Column value="service" label="Service" />
      <Column value="severity" label="Severity" />
      <Column value="assignee" label="Assignee" />
      <Column value="minutes" label="Minutes to resolve" aggregate="sum" />
    </Table>
  );
}
