import { useTable } from "../../../src";

export const title = "Groups of a single row";
export const lead = "A group of one row keeps its fold, count and totals; as the innermost level it is a span, so it costs no extra line.";

interface WorkItem {
  id: string;
  team: string;
  person: string;
  name: string;
  estimate: number;
}

const WORK: WorkItem[] = [
  { id: "W-101", team: "Web", person: "Arjun Mehta", name: "Sign-in with e-mail code", estimate: 18 },
  { id: "W-102", team: "Web", person: "Arjun Mehta", name: "Profile page", estimate: 26 },
  { id: "W-103", team: "Web", person: "Chloe Durand", name: "Session handling", estimate: 12 },
  { id: "W-106", team: "Web", person: "Noah Fischer", name: "Profile page design", estimate: 14 },
  { id: "W-108", team: "Web", person: "Eva Novak", name: "Test plan for sign-in", estimate: 10 },
  { id: "W-110", team: "Apps", person: "Hana Sato", name: "Reminder scheduling service", estimate: 32 },
  { id: "W-112", team: "Apps", person: "Kofi Mensah", name: "Calendar sync", estimate: 18 },
];

export default function GroupOfOne() {
  const { Table, Column } = useTable(WORK, { rowKey: (w) => w.id, defaultGrouping: ["team", "person"] });
  return (
    <Table ariaLabel="Work items by team and person">
      <Column value="person" label="Person" />
      <Column value="id" label="Item" rowHeader />
      <Column value="team" label="Team" />
      <Column value="name" label="Title" />
      <Column value="estimate" label="Estimate (h)" aggregate="sum" />
    </Table>
  );
}
