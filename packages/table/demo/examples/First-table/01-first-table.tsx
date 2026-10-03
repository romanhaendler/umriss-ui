import { useTable } from "../../../src";

export const title = "Show a list of services";
export const lead = "Pass the rows to `useTable` and declare a `Column` per field; `rowHeader` names the row, and numbers align right and sort by value.";

interface Service {
  id: string;
  name: string;
  team: string;
  tier: number;
  latencySlo: number;
}

const SERVICES: Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800 },
];

export default function FirstTable() {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Services">
      <Column value="name" label="Service" rowHeader />
      <Column value="team" label="Team" />
      <Column value="tier" label="Tier" />
      <Column value="latencySlo" label="Latency objective (ms)" />
    </Table>
  );
}
