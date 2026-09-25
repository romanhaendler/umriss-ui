import { useTable } from "../../../src";

export const title = "Gather rows without a value";
export const lead = "Rows without a value form the group “No value”, which stands last in either sort direction. Click the Person header twice.";

interface WorkItem {
  id: string;
  person: string | null;
  name: string;
  estimate: number;
}

const WORK: WorkItem[] = [
  { id: "W-102", person: "Arjun Mehta", name: "Profile page", estimate: 26 },
  { id: "W-117", person: null, name: "Password reset e-mail", estimate: 8 },
  { id: "W-105", person: "Chloe Durand", name: "Change of address form", estimate: 24 },
  { id: "W-104", person: "Chloe Durand", name: "Basket keeps items across devices", estimate: 20 },
  { id: "W-118", person: null, name: "Cookie banner wording", estimate: 3 },
  { id: "W-109", person: "Eva Novak", name: "Regression run", estimate: 20 },
  { id: "W-119", person: null, name: "Accessibility audit", estimate: 16 },
];

export default function NoValue() {
  const { Table, Column } = useTable(WORK, { rowKey: (w) => w.id, defaultGrouping: "person" });
  return (
    <Table ariaLabel="Work items by person">
      <Column value="person" label="Person" />
      <Column value="id" label="Item" rowHeader />
      <Column value="name" label="Title" />
      <Column value="estimate" label="Estimate (h)" aggregate="sum" />
    </Table>
  );
}
