import { Button, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

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

export const title = "Fold groups into a summary";
export const lead = "Folded, a grouped table is one line per group with its totals; folds are part of the view and come back through `initialView`.";

const ROWS = LEDGER.map((row) => ({
  key: `${row.costCentre} ${row.month}`,
  centre: COST_CENTRES.find((c) => c.id === row.costCentre)!.name,
  month: row.month,
  budget: row.budget,
  forecast: row.forecast,
  actual: row.actual,
}));

/* A fold is kept by the path of its group. */
const path = (...values: string[]) => JSON.stringify(values.map((v) => `value:${v}`));

export default function Overview() {
  const t = useTable(ROWS, {
    rowKey: (r) => r.key,
    defaultGrouping: "centre",
    initialView: { folded: COST_CENTRES.filter((c) => c.name !== "Marketing").map((c) => path(c.name)) },
  });
  const { Table, Column } = t;
  return (
    <Stack gap={3}>
      <Table ariaLabel="Budget by cost centre" maxHeight="480px" stickyHeader>
        <Column value="centre" label="Cost centre" />
        <Column value="month" label="Month" rowHeader />
        <Column value="budget" label="Budget (€)" aggregate="sum" />
        <Column value="forecast" label="Forecast (€)" aggregate="sum" />
        <Column value="actual" label="Actual (€)" aggregate="sum" />
      </Table>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={t.foldAll}>
          Fold all
        </Button>
        <Button size="sm" onClick={t.unfoldAll}>
          Unfold all
        </Button>
      </Stack>
      <Text as="code" size="xs" mono>
        {JSON.stringify(t.view)}
      </Text>
    </Stack>
  );
}
