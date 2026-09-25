import { useTable } from "../../../src";

export const title = "Count values and distinct values";
export const lead = "`\"count\"` counts the values present, `\"distinct\"` the different ones: eight alerts, but three services and two people assigned.";

interface Alert {
  id: string;
  service: string;
  assignee: string | null;
  minutes: number;
}

const ALERTS: Alert[] = [
  { id: "A-2201", service: "Checkout", assignee: "Jonas Keller", minutes: 18 },
  { id: "A-2202", service: "Checkout", assignee: "Jonas Keller", minutes: 42 },
  { id: "A-2203", service: "Search", assignee: "Leila Haddad", minutes: 21 },
  { id: "A-2204", service: "Search", assignee: null, minutes: 7 },
  { id: "A-2205", service: "Webhooks", assignee: null, minutes: 35 },
  { id: "A-2206", service: "Checkout", assignee: "Leila Haddad", minutes: 16 },
  { id: "A-2207", service: "Webhooks", assignee: null, minutes: 25 },
  { id: "A-2208", service: "Search", assignee: "Jonas Keller", minutes: 4 },
];

export default function CountAndDistinct() {
  const { Table, Column } = useTable(ALERTS, { rowKey: (a) => a.id });
  return (
    <Table ariaLabel="Alerts this morning">
      <Column value="id" label="Alert" rowHeader aggregate="count" />
      <Column value="service" label="Service" aggregate="distinct" />
      <Column value="assignee" label="Assignee" aggregate="distinct" />
      <Column value="minutes" label="Minutes open" aggregate="sum" />
    </Table>
  );
}
