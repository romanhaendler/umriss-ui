import { useTable } from "../../../src";

export const title = "Choose from the values that occur";
export const lead = "`filter=\"list\"` offers the values found in the column, an absent one included; each condition then stands in the table toolbar.";

interface Incident {
  id: string;
  service: string;
  assignee: string | null;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", service: "Checkout", assignee: "Jonas Keller" },
  { id: "INC-1047", service: "Webhooks", assignee: null },
  { id: "INC-1046", service: "Image service", assignee: "Tomasz Nowak" },
  { id: "INC-1045", service: "Sign-in", assignee: "Ada Mwangi" },
  { id: "INC-1041", service: "Checkout", assignee: null },
];

export default function ListFilter() {
  const { Table, Column } = useTable(INCIDENTS, { rowKey: (i) => i.id });

  return (
    <Table ariaLabel="Incidents">
      <Column value="id" label="Incident" rowHeader />
      <Column value="service" label="Service" filter="list" />
      <Column value="assignee" label="Assignee" filter="list" />
    </Table>
  );
}
