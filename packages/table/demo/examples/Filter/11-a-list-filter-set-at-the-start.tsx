import { useTable } from "../../../src";

export const title = "Start with a list filter set";
export const lead = "`initialView` carries a condition like any other part of the view: a list filter's chosen values stand in the toolbar from the first render, and the user lifts them there.";

interface Incident {
  id: string;
  service: string;
  severity: string;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", service: "Checkout", severity: "Major" },
  { id: "INC-1047", service: "Webhooks", severity: "Minor" },
  { id: "INC-1046", service: "Image service", severity: "Major" },
  { id: "INC-1045", service: "Sign-in", severity: "Minor" },
  { id: "INC-1041", service: "Checkout", severity: "Minor" },
];

export default function ListFilterAtTheStart() {
  const { Table, Column } = useTable(INCIDENTS, {
    rowKey: (i) => i.id,
    /* A list condition is the array of the chosen values, under the column's id. */
    initialView: { conditions: { severity: ["Major"] } },
  });

  return (
    <Table aria-label="Incidents">
      <Column value="id" label="Incident" rowHeader />
      <Column value="service" label="Service" />
      <Column value="severity" label="Severity" filter="list" />
    </Table>
  );
}
