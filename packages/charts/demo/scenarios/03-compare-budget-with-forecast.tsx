import { Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import type { LimitSet } from "@umriss-ui/core";
import { Bar, Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../src";

/* Data from the controlling world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface CostCentre {
  id: string;
  name: string;
  owner: string;
  /** The budget of one month. */
  monthlyBudget: number;
}

const COST_CENTRES: readonly CostCentre[] = [
  { id: "CC-1100", name: "Sales", owner: "Helen Marsh", monthlyBudget: 142_000 },
  { id: "CC-1200", name: "Marketing", owner: "Rafael Ortiz", monthlyBudget: 68_000 },
  { id: "CC-2100", name: "Engineering", owner: "Anika Sørensen", monthlyBudget: 188_000 },
  { id: "CC-2200", name: "Design", owner: "Paul Whitaker", monthlyBudget: 54_000 },
  { id: "CC-3100", name: "Customer service", owner: "Grace Obi", monthlyBudget: 61_000 },
  { id: "CC-4100", name: "Finance", owner: "Martina Vogel", monthlyBudget: 47_000 },
  { id: "CC-4200", name: "People", owner: "Daniel Frost", monthlyBudget: 39_000 },
  { id: "CC-4300", name: "IT", owner: "Kenji Arai", monthlyBudget: 83_000 },
  { id: "CC-4400", name: "Facilities", owner: "Olga Ivanova", monthlyBudget: 72_000 },
];

/** The year's months, as `"2026-01"` … `"2026-12"`. */
const MONTHS: readonly string[] = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);

/** The months whose books are closed: they have an actual. */
const CLOSED_MONTHS = 2;

interface LedgerRow {
  costCentre: string;
  month: string;
  budget: number;
  /** `null` while the month is open. */
  actual: number | null;
  forecast: number;
}

/* Where a cost centre lands against its budget, as a factor: Marketing's
   spring campaign overspends, IT's delayed licences underspend. */
const TENDENCY: Readonly<Record<string, number>> = { "CC-1200": 1.14, "CC-4300": 0.88 };

/** Budget, actual and forecast of every cost centre in every month. */
const LEDGER: readonly LedgerRow[] = COST_CENTRES.flatMap((centre, c) => {
  const r = random(310 + c);
  const tendency = TENDENCY[centre.id] ?? 1;
  return MONTHS.map((month, m) => {
    /* December pays the bonuses, August is the quiet month. */
    const season = m === 11 ? 1.12 : m === 7 ? 0.9 : 1;
    const budget = Math.round(centre.monthlyBudget * season);
    const forecast = Math.round((budget * (tendency + (r() - 0.5) * 0.06)) / 100) * 100;
    const actual = m < CLOSED_MONTHS ? Math.round(forecast * (1 + (r() - 0.5) * 0.08)) : null;
    return { costCentre: centre.id, month, budget, actual, forecast };
  });
});

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
const outlook = (row: LedgerRow) => row.actual ?? row.forecast;
const euros = (v: number) => `${v.toLocaleString("en-GB", { maximumFractionDigits: 1 })} k€`;

interface CentreYear {
  name: string;
  budget: number;
  outlook: number;
  gap: number;
}

const YEAR: readonly CentreYear[] = COST_CENTRES.map((centre) => {
  const rows = LEDGER.filter((row) => row.costCentre === centre.id);
  const budget = rows.reduce((sum, row) => sum + row.budget, 0);
  const expected = rows.reduce((sum, row) => sum + outlook(row), 0);
  return { name: centre.name, budget, outlook: expected, gap: expected - budget };
});

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

const MARKETING = COST_CENTRES.find((one) => one.name === "Marketing")!;
const MONTHLY = LEDGER.filter((row) => row.costCentre === MARKETING.id);
const MONTH_NAMES = MONTHS.map((month) => new Date(`${month}-01T00:00`).toLocaleString("en-GB", { month: "short" }));

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
          <Chart data={YEAR} height={240} ariaLabel="Outlook minus budget for the year, per cost centre">
            <XAxis
              accessor={(_d: CentreYear, i: number) => i}
              ticks={YEAR.map((_, i) => i)}
              tickFormat={(v) => YEAR[v]?.name ?? ""}
            />
            <YAxis accessor={(d: CentreYear) => thousands(d.gap)} label="k€" tickFormat={euros} />
            {/* One series per sign, stacked on one another so that each bar stands centred on its cost centre. */}
            <Bar accessor={(d: CentreYear) => (d.gap > 0 ? thousands(d.gap) : null)} name="Over budget" tone="alarm" stack="gap" format={euros} />
            <Bar
              accessor={(d: CentreYear) => (d.gap <= 0 ? thousands(d.gap) : null)}
              name="Under budget"
              color="var(--uc-color-text)"
              stack="gap"
              format={euros}
            />
            <Legend placement="top" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
      <Card data-callout="3">
        <CardHeader eyebrow={`${MARKETING.id} · ${MARKETING.owner}`} title="Marketing, month by month" />
        <CardBody>
          <Chart data={MONTHLY} height={260} ariaLabel="Marketing's budget, actual and forecast per month">
            <XAxis
              accessor={(_d: LedgerRow, i: number) => i}
              ticks={MONTHLY.map((_, i) => i)}
              tickFormat={(v) => MONTH_NAMES[v] ?? ""}
            />
            <YAxis accessor={(d: LedgerRow) => thousands(d.budget)} label="k€" tickFormat={euros} />
            <Bar accessor={(d: LedgerRow) => thousands(d.budget)} name="Budget" color="var(--uc-color-text)" barWidth={0.7} format={euros} />
            <Bar accessor={(d: LedgerRow) => (d.actual === null ? null : thousands(d.actual))} name="Actual" barWidth={0.7} format={euros} />
            <Line accessor={(d: LedgerRow) => thousands(d.forecast)} name="Forecast" tone="warning" markers="always" format={euros} />
            <Legend placement="top" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
