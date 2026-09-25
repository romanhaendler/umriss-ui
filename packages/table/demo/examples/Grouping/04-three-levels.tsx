import { useTable } from "../../../src";

export const title = "Group on three levels";
export const lead = "Tier and team become header rows, the team one step in; the service is the span beside its incidents. Three is the most there is.";

interface Incident {
  id: string;
  tier: string;
  team: string;
  service: string;
  title: string;
  minutes: number;
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", tier: "Tier 1", team: "Payments", service: "Checkout", title: "Card payments time out", minutes: 48 },
  { id: "INC-1039", tier: "Tier 1", team: "Payments", service: "Checkout", title: "Basket totals off by a cent", minutes: 95 },
  { id: "INC-1041", tier: "Tier 1", team: "Payments", service: "Billing", title: "Invoices generated twice", minutes: 150 },
  { id: "INC-1045", tier: "Tier 1", team: "Identity", service: "Sign-in", title: "Sign-in codes arrive late", minutes: 45 },
  { id: "INC-1043", tier: "Tier 1", team: "Discovery", service: "Search", title: "No results for some regions", minutes: 85 },
  { id: "INC-1046", tier: "Tier 2", team: "Discovery", service: "Image service", title: "Thumbnails missing", minutes: 155 },
  { id: "INC-1042", tier: "Tier 2", team: "Messaging", service: "Notifications", title: "Duplicate reminder e-mails", minutes: 255 },
  { id: "INC-1047", tier: "Tier 2", team: "Integrations", service: "Webhooks", title: "Deliveries delayed", minutes: 195 },
  { id: "INC-1044", tier: "Tier 3", team: "Insights", service: "Reporting", title: "Monthly export fails", minutes: 90 },
];

export default function ThreeLevels() {
  const { Table, Column } = useTable(INCIDENTS, { rowKey: (i) => i.id, defaultGrouping: ["tier", "team", "service"] });
  return (
    <Table ariaLabel="Incidents by tier, team and service">
      <Column value="service" label="Service" />
      <Column value="id" label="Incident" rowHeader />
      <Column value="tier" label="Tier" />
      <Column value="team" label="Team" />
      <Column value="title" label="Title" />
      <Column value="minutes" label="Minutes to resolve" aggregate="sum" />
    </Table>
  );
}
