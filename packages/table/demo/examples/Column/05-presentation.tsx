import { Badge, Meter } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Draw a value with other components";
export const lead = "`children` receives the value, typed as the field, and the row; sorting still goes by the value, never by what is drawn.";

interface Service {
  name: string;
  state: "Healthy" | "Degraded" | "Down";
  budgetUsed: number;
}

const TONE = { Healthy: "success", Degraded: "warning", Down: "danger" } as const;

const SERVICES: Service[] = [
  { name: "Checkout", state: "Degraded", budgetUsed: 0.86 },
  { name: "Billing", state: "Healthy", budgetUsed: 0.34 },
  { name: "Webhooks", state: "Down", budgetUsed: 1 },
];

export default function Presentation() {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.name });

  return (
    <Table ariaLabel="Services">
      <Column value="name" label="Service" rowHeader />
      <Column value="state" label="State">
        {(state) => <Badge tone={TONE[state]}>{state}</Badge>}
      </Column>
      <Column value="budgetUsed" label="Error budget used">
        {(share, service) => (
          <Meter value={share} tone={share > 0.8 ? "warning" : "accent"} label={`Error budget used, ${service.name}`} showLabel />
        )}
      </Column>
    </Table>
  );
}
