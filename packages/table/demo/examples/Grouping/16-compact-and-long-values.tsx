import { useTable } from "../../../src";

export const title = "Fit long group names in a compact table";
export const lead = "A long value in a span is cut and kept in its title, so no other column has to wrap; rows without a project gather last.";

interface WorkItem {
  id: string;
  team: string;
  project: string | null;
  person: string;
  name: string;
  estimate: number;
}

const PORTAL = "Member portal for Rowan Credit Union – sign-in, profile, change of address and statements";

const WORK: WorkItem[] = [
  { id: "W-101", team: "Web", project: PORTAL, person: "Arjun Mehta", name: "Sign-in with e-mail code", estimate: 18 },
  { id: "W-102", team: "Web", project: PORTAL, person: "Arjun Mehta", name: "Profile page", estimate: 26 },
  { id: "W-106", team: "Web", project: PORTAL, person: "Noah Fischer", name: "Profile page design", estimate: 14 },
  { id: "W-104", team: "Web", project: "Online shop relaunch", person: "Chloe Durand", name: "Basket keeps items across devices", estimate: 20 },
  { id: "W-120", team: "Web", project: null, person: "Eva Novak", name: "Update the test devices", estimate: 4 },
  { id: "W-121", team: "Web", project: null, person: "Maya Lindgren", name: "Quarterly planning", estimate: 6 },
  { id: "W-110", team: "Apps", project: "Booking app", person: "Hana Sato", name: "Reminder scheduling service", estimate: 32 },
  { id: "W-112", team: "Apps", project: "Booking app", person: "Kofi Mensah", name: "Calendar sync", estimate: 18 },
  { id: "W-114", team: "Apps", project: "Booking app", person: "Kofi Mensah", name: "Reminder settings screen", estimate: 16 },
  { id: "W-113", team: "Apps", project: "Intranet", person: "Kofi Mensah", name: "News feed", estimate: 16 },
];

export default function CompactAndLong() {
  const { Table, Column } = useTable(WORK, { rowKey: (w) => w.id, defaultGrouping: ["team", "project", "person"] });
  return (
    <Table ariaLabel="Backlog, compact" density="compact" selectable>
      <Column value="person" label="Person" />
      <Column value="id" label="Item" rowHeader />
      <Column value="team" label="Team" />
      <Column value="project" label="Project" />
      <Column value="name" label="Title" />
      <Column value="estimate" label="Estimate (h)" aggregate="sum" />
    </Table>
  );
}
