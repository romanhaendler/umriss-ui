import { useTable } from "../../../src";

export const title = "Pick a standard format";
export const lead = "`format` names a presentation from the provider's formats; it is typed against the value and keeps sorting, export and totals. The object form is Intl's options: `{ decimals }` for places, `useGrouping: false` for a year, `style: \"currency\"` for money.";

interface Service {
  name: string;
  availability: number;
  requests: number;
  p95: number;
  since: number;
  monthly: number;
  deployed: Date;
}

const SERVICES: Service[] = [
  { name: "Checkout", availability: 0.99921, requests: 1_284_310, p95: 412.37, since: 2019, monthly: 18400.5, deployed: new Date(2026, 2, 17, 9, 5) },
  { name: "Billing", availability: 0.99958, requests: 402_118, p95: 238.9, since: 2021, monthly: 9250, deployed: new Date(2026, 2, 16, 16, 40) },
  { name: "Search", availability: 0.99803, requests: 2_910_455, p95: 186.02, since: 2024, monthly: 31200.75, deployed: new Date(2026, 2, 12, 11, 15) },
];

export default function Format() {
  const { Table, Column } = useTable(SERVICES, { rowKey: (s) => s.name });

  return (
    <Table ariaLabel="Services this month">
      <Column value="name" label="Service" rowHeader />
      <Column value="availability" label="Availability" format="percent" />
      <Column value="requests" label="Requests" format="count" />
      <Column value="p95" label="p95 (ms)" format={{ decimals: 1 }} />
      <Column value="since" label="Since" format={{ useGrouping: false }} />
      <Column value="monthly" label="Cost" format={{ style: "currency", currency: "EUR" }} />
      <Column value="deployed" label="Deployed" format="date" />
      {/* A second column over the same field names its own id. */}
      <Column id="deployedAt" value="deployed" label="At" format="time" />
    </Table>
  );
}
