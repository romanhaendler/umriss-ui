import { Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { Legend, Tooltip, useChart } from "../../src";

export const title = "Compare the budget with the forecast";

export const lead =
  "A controller prepares the monthly review: where the year will land against its budget, cost centre by cost centre, and why.";

export const callouts = [
  "The year in three figures: the budget, the outlook (closed months at their actual, open months at their forecast) and the gap between them. As a whole, the company lands on its budget.",
  "The total hides two gaps that cancel out: Marketing overspends by about as much as IT underspends.",
  "Marketing month by month: the budget as quiet bars, the closed months' actuals beside them, the forecast as a line above the budget all year. Hover a month for the ledger's figures.",
];

export const builtFrom = [
  "bar",
  "line",
  "tooltip",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const thousands = (euros: number) => euros / 1000;
const euros = (v: number) => `${v.toLocaleString("en-GB", { maximumFractionDigits: 1 })} k€`;

/* The year per cost centre, in euros, as the ledger sums it: the budget, and
   the outlook - closed months at their actual, open months at their forecast. */
const YEAR = [
  { name: "Sales", budget: 1_706_840, outlook: 1_701_784 },
  { name: "Marketing", budget: 817_360, outlook: 934_111 },
  { name: "Engineering", budget: 2_259_760, outlook: 2_258_122 },
  { name: "Design", budget: 649_080, outlook: 649_484 },
  { name: "Customer service", budget: 733_220, outlook: 734_416 },
  { name: "Finance", budget: 564_940, outlook: 563_659 },
  { name: "People", budget: 468_780, outlook: 468_251 },
  { name: "IT", budget: 997_660, outlook: 881_804 },
  { name: "Facilities", budget: 865_440, outlook: 860_691 },
];
const gap = (one: { budget: number; outlook: number }) => one.outlook - one.budget;

const BUDGET = YEAR.reduce((sum, one) => sum + one.budget, 0);
const OUTLOOK = YEAR.reduce((sum, one) => sum + one.outlook, 0);

/* Past 1 % over budget is worth a word in the review, past 3 % a decision. */
const GAP_LIMITS: LimitSet = {
  target: 0,
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 3, side: "upper", severity: "alarm" },
  ],
};

const MARKETING = { id: "CC-1200", owner: "Rafael Ortiz" };

/* Marketing's ledger month by month, in euros; `actual` is `null` while the
   month's books are open. */
const MONTHLY = [
  { month: "2026-01", budget: 68_000, actual: 76_823, forecast: 76_900 },
  { month: "2026-02", budget: 68_000, actual: 76_588, forecast: 78_600 },
  { month: "2026-03", budget: 68_000, actual: null, forecast: 78_200 },
  { month: "2026-04", budget: 68_000, actual: null, forecast: 76_100 },
  { month: "2026-05", budget: 68_000, actual: null, forecast: 77_100 },
  { month: "2026-06", budget: 68_000, actual: null, forecast: 77_800 },
  { month: "2026-07", budget: 68_000, actual: null, forecast: 78_400 },
  { month: "2026-08", budget: 61_200, actual: null, forecast: 69_600 },
  { month: "2026-09", budget: 68_000, actual: null, forecast: 79_200 },
  { month: "2026-10", budget: 68_000, actual: null, forecast: 78_400 },
  { month: "2026-11", budget: 68_000, actual: null, forecast: 77_200 },
  { month: "2026-12", budget: 76_160, actual: null, forecast: 88_700 },
];
/** `"2026-03"` as the axis writes it. */
const monthName = (month: string) => new Date(`${month}-01T00:00`).toLocaleString("en-GB", { month: "short" });

function GapPerCentre() {
  const { Chart, XAxis, YAxis, Bar } = useChart(YEAR);
  return (
    <Chart height={240} aria-label="Outlook minus budget for the year, per cost centre">
      <XAxis value="name" />
      <YAxis label="k€" tickFormat={euros} />
      {/* One series per sign, stacked on one another so that each bar stands centred on its cost centre. */}
      <Bar value={(d) => (gap(d) > 0 ? thousands(gap(d)) : null)} name="Over budget" tone="alarm" stack="gap" format={euros} />
      <Bar
        value={(d) => (gap(d) <= 0 ? thousands(gap(d)) : null)}
        name="Under budget"
        color="var(--uc-color-text)"
        stack="gap"
        format={euros}
      />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}

function MarketingByMonth() {
  const { Chart, XAxis, YAxis, Bar, Line } = useChart(MONTHLY);
  return (
    <Chart height={260} aria-label="Marketing's budget, actual and forecast per month">
      <XAxis value="month" categoryLabel={monthName} />
      <YAxis label="k€" tickFormat={euros} />
      <Bar value={(d) => thousands(d.budget)} name="Budget" color="var(--uc-color-text)" barWidth={0.7} format={euros} />
      <Bar value={(d) => (d.actual === null ? null : thousands(d.actual))} name="Actual" barWidth={0.7} format={euros} />
      <Line value={(d) => thousands(d.forecast)} name="Forecast" tone="warning" markers="always" format={euros} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function BudgetAndForecast() {
  return (
    <Stack gap={4}>
      <Grid minItemWidth="12rem" gap={3} data-callout="1">
        <Stat label="Budget 2026" value={thousands(BUDGET)} unit="k€" decimals={0} />
        <Stat label="Outlook 2026" value={thousands(OUTLOOK)} unit="k€" decimals={0} />
        <Stat label="Outlook against budget" value={((OUTLOOK - BUDGET) / BUDGET) * 100} unit="%" decimals={1} limits={GAP_LIMITS} />
      </Grid>
      <Card data-callout="2">
        <CardHeader title="Over and under budget, by cost centre" />
        <CardBody>
          <GapPerCentre />
        </CardBody>
      </Card>
      <Card data-callout="3">
        <CardHeader eyebrow={`${MARKETING.id} · ${MARKETING.owner}`} title="Marketing, month by month" />
        <CardBody>
          <MarketingByMonth />
        </CardBody>
      </Card>
    </Stack>
  );
}
