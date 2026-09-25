import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Group by a value that is no column";
export const lead = "`GroupBy` declares a group key computed from the row, here the day an incident opened; it has no cell and no export.";

interface Incident {
  id: string;
  service: string;
  opened: Date;
  minutes: number;
}

const at = (day: number, hours: number, minutes: number) => new Date(2026, 2, day, hours, minutes);

const INCIDENTS: Incident[] = [
  { id: "INC-1048", service: "Checkout", opened: at(17, 9, 42), minutes: 48 },
  { id: "INC-1047", service: "Webhooks", opened: at(17, 7, 15), minutes: 195 },
  { id: "INC-1046", service: "Image service", opened: at(16, 22, 5), minutes: 155 },
  { id: "INC-1045", service: "Sign-in", opened: at(16, 14, 20), minutes: 45 },
  { id: "INC-1044", service: "Reporting", opened: at(15, 10, 0), minutes: 90 },
  { id: "INC-1043", service: "Search", opened: at(14, 18, 30), minutes: 85 },
  { id: "INC-1042", service: "Notifications", opened: at(13, 8, 45), minutes: 255 },
];

/* Day first, so that the groups sort by date. */
const dayOf = (d: Date) => `${d.getDate()} March, ${d.toLocaleDateString("en-GB", { weekday: "long" })}`;

export default function KeyThatIsNoColumn() {
  const { Table, Column, GroupBy } = useTable(INCIDENTS, { rowKey: (i) => i.id, defaultGrouping: "day" });
  return (
    <Table ariaLabel="Incidents by day">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <GroupBy id="day" value={(i) => dayOf(i.opened)} label="Day" />
      <Column value="id" label="Incident" rowHeader />
      <Column value="service" label="Service" />
      <Column value="opened" label="Opened" format="dateTime" />
      <Column value="minutes" label="Minutes to resolve" aggregate="avg" />
    </Table>
  );
}
