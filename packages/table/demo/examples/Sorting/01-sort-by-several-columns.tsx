import { useTable } from "../../../src";

export const title = "Sort by several columns";
export const lead = "A click on a header sorts, Shift and click adds a level; `defaultSort` takes the levels the table starts with.";

interface Incident {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  opened: Date;
  assignee: string;
}

const at = (day: number, hours: number, minutes: number) => new Date(2026, 2, day, hours, minutes);

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", severity: "SEV1", opened: at(17, 9, 42), assignee: "Jonas Keller" },
  { id: "INC-1047", title: "Webhook deliveries delayed", severity: "SEV3", opened: at(17, 7, 15), assignee: "Ines Duarte" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", severity: "SEV2", opened: at(16, 22, 5), assignee: "Tomasz Nowak" },
  { id: "INC-1045", title: "Sign-in codes arrive late", severity: "SEV2", opened: at(16, 14, 20), assignee: "Ada Mwangi" },
  { id: "INC-1043", title: "Search returns no results for some regions", severity: "SEV1", opened: at(14, 18, 30), assignee: "Leila Haddad" },
  { id: "INC-1042", title: "Duplicate reminder e-mails", severity: "SEV3", opened: at(13, 8, 45), assignee: "Sam Okafor" },
];

export default function SortBySeveralColumns() {
  const { Table, Column } = useTable(INCIDENTS, {
    rowKey: (i) => i.id,
    defaultSort: [
      { column: "severity", direction: "asc" },
      { column: "opened", direction: "desc" },
    ],
  });

  return (
    <Table ariaLabel="Incidents, most severe and newest first">
      <Column value="id" label="Incident" rowHeader />
      <Column value="title" label="Title" />
      <Column value="severity" label="Severity" />
      <Column value="opened" label="Opened" format="dateTime" />
      <Column value="assignee" label="Assignee" />
    </Table>
  );
}
