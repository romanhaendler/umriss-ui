import { Bar, Chart, Tooltip, XAxis, YAxis } from "../../../src";

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

export const title = "One bar per category";
export const lead = "Categories are positions 0, 1, 2 … on the numeric x axis: `ticks` puts a tick under every bar, `tickFormat` names it (ADR-0002).";

const FEBRUARY = LEDGER.filter((row) => row.month === "2026-02");
const place = (row: LedgerRow) => COST_CENTRES.findIndex((c) => c.id === row.costCentre);

export default function PerCategory() {
  return (
    <Chart data={FEBRUARY} height={260} ariaLabel="Actual spend per cost centre in February">
      <XAxis accessor={place} ticks={COST_CENTRES.map((_, i) => i)} tickFormat={(v) => COST_CENTRES[v]?.name ?? ""} />
      <YAxis accessor={(d: LedgerRow) => d.budget} label="€" />
      <Bar accessor={(d: LedgerRow) => d.actual} name="Actual" />
      <Tooltip mode="x" />
    </Chart>
  );
}
