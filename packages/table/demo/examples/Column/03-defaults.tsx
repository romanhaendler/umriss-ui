import { useTable } from "../../../src";

export const title = "Let the value type decide";
export const lead = "Without `children` the value decides: text left, numbers right with tabular figures, dates as date and time, booleans as a word.";

interface Service {
  name: string;
  requests: number;
  deployed: Date;
  pages: boolean;
  openIncidents: number | null;
}

const SERVICES: Service[] = [
  { name: "Checkout", requests: 1840.5, deployed: new Date(2026, 2, 17, 9, 5), pages: true, openIncidents: 1 },
  { name: "Reporting", requests: 18, deployed: new Date(2026, 2, 16, 14, 30), pages: false, openIncidents: null },
];

export default function Defaults() {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.name });

  return (
    <Table ariaLabel="Defaults per value type">
      <Column value="name" label="Text" rowHeader />
      <Column value="requests" label="Number" />
      <Column value="deployed" label="Point in time" />
      <Column value="pages" label="Truth value" />
      <Column value="openIncidents" label="Absent" />
    </Table>
  );
}
