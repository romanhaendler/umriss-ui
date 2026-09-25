import { useTable } from "../../../src";

export const title = "Work cell by cell";
export const lead = "`grid` makes the table one Tab stop whose cells the arrows walk; Enter reaches a cell's controls. Keep it off for tables that are only read.";

interface Service {
  id: string;
  name: string;
  team: string;
  requests: number;
  state: string;
}

const SERVICES: Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", requests: 1840, state: "Degraded" },
  { id: "billing", name: "Billing", team: "Payments", requests: 620, state: "Healthy" },
  { id: "sign-in", name: "Sign-in", team: "Identity", requests: 2210, state: "Healthy" },
  { id: "search", name: "Search", team: "Discovery", requests: 3105, state: "Healthy" },
  { id: "webhooks", name: "Webhooks", team: "Integrations", requests: 410, state: "Delayed" },
];

export default function GridMode() {
  const { Table, Column, RowActions, Action } = useTable(SERVICES, { rowKey: (s) => s.id });
  return (
    <Table grid selectable ariaLabel="Services">
      <Column value="name" label="Service" rowHeader />
      <Column value="team" label="Team" />
      <Column value="requests" label="Requests a minute" format="count" aggregate="sum" />
      <Column value="state" label="State" />
      <RowActions>
        <Action onSelect={() => undefined}>Dashboard</Action>
      </RowActions>
    </Table>
  );
}
