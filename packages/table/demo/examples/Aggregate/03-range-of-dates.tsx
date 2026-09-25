import { useTable } from "../../../src";

export const title = "Show a range of dates";
export const lead = "`\"range\"` gives the earliest and latest date of each group, so a project's header says from when to when its work runs.";

interface WorkItem {
  id: string;
  project: string;
  person: string;
  name: string;
  starts: Date;
}

const day = (d: number) => new Date(2026, 2, d);

const WORK: WorkItem[] = [
  { id: "W-101", project: "Member portal", person: "Arjun Mehta", name: "Sign-in with e-mail code", starts: day(9) },
  { id: "W-102", project: "Member portal", person: "Arjun Mehta", name: "Profile page", starts: day(12) },
  { id: "W-105", project: "Member portal", person: "Chloe Durand", name: "Change of address form", starts: day(16) },
  { id: "W-109", project: "Member portal", person: "Eva Novak", name: "Regression run", starts: day(17) },
  { id: "W-104", project: "Online shop relaunch", person: "Chloe Durand", name: "Basket keeps items across devices", starts: day(11) },
  { id: "W-107", project: "Online shop relaunch", person: "Noah Fischer", name: "Search results layout", starts: day(16) },
  { id: "W-110", project: "Booking app", person: "Hana Sato", name: "Reminder scheduling service", starts: day(9) },
  { id: "W-115", project: "Booking app", person: "Freya Olsen", name: "Store screenshots", starts: day(18) },
];

export default function RangeOfDates() {
  const { Table, Column } = useTable(WORK, { rowKey: (w) => w.id, defaultGrouping: ["project", "person"] });
  return (
    <Table ariaLabel="Work items by project and person">
      <Column value="person" label="Person" />
      <Column value="project" label="Project" />
      <Column value="id" label="Item" rowHeader />
      <Column value="name" label="Title" />
      <Column value="starts" label="Starts" format="date" aggregate="range" />
    </Table>
  );
}
