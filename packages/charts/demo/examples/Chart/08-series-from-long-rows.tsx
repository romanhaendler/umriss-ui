import { Legend, Tooltip, useChart } from "../../../src";

export const title = "Draw a series per group of long rows";
export const lead = "A chart draws one series per element. Rows that come one per service and hour are grouped before it - a `Set` names the groups, a `filter` picks each one's rows - and each group is a series with its own `data`. Which rows belong together is yours to say.";

/* Failed requests in per cent, per service and hour - long rows, as a query
   returns them. */
const ERRORS = [
  { t: "2026-03-17T06:00", service: "Checkout", errors: 0.12 },
  { t: "2026-03-17T06:00", service: "Billing", errors: 0.21 },
  { t: "2026-03-17T06:00", service: "Search", errors: 0.08 },
  { t: "2026-03-17T07:00", service: "Checkout", errors: 0.15 },
  { t: "2026-03-17T07:00", service: "Billing", errors: 0.19 },
  { t: "2026-03-17T07:00", service: "Search", errors: 0.09 },
  { t: "2026-03-17T08:00", service: "Checkout", errors: 0.14 },
  { t: "2026-03-17T08:00", service: "Billing", errors: 0.24 },
  { t: "2026-03-17T08:00", service: "Search", errors: 0.11 },
  { t: "2026-03-17T09:00", service: "Checkout", errors: 1.86 },
  { t: "2026-03-17T09:00", service: "Billing", errors: 0.92 },
  { t: "2026-03-17T09:00", service: "Search", errors: 0.1 },
  { t: "2026-03-17T10:00", service: "Checkout", errors: 2.41 },
  { t: "2026-03-17T10:00", service: "Billing", errors: 1.13 },
  { t: "2026-03-17T10:00", service: "Search", errors: 0.12 },
  { t: "2026-03-17T11:00", service: "Checkout", errors: 0.18 },
  { t: "2026-03-17T11:00", service: "Billing", errors: 0.22 },
  { t: "2026-03-17T11:00", service: "Search", errors: 0.09 },
];

/* Once, outside the component: a series' `data` is compared by reference. */
const BY_SERVICE = [...new Set(ERRORS.map((row) => row.service))].map((service) => ({
  service,
  rows: ERRORS.filter((row) => row.service === service),
}));

export default function SeriesFromLongRows() {
  const { Chart, XAxis, YAxis, Line } = useChart(ERRORS);
  return (
    <Chart height={260} aria-label="Failed requests per service and hour this morning">
      <XAxis value="t" time />
      <YAxis label="Errors %" />
      {BY_SERVICE.map(({ service, rows }) => (
        <Line key={service} data={rows} value="errors" name={service} markers="always" />
      ))}
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
