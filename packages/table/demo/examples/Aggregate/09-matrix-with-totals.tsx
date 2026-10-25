import { useTable } from "../../../src";

export const title = "A matrix with row and column totals";
export const lead =
  "Pivot the facts into rows, then map one computed column per year from the data, `key` by the year. An accessor closes only over what is constant for its column, so the row total is a field of the row, not a function over the years: it stays right when a year arrives.";

interface Fact {
  plant: string;
  year: number;
  tonnes: number;
}

interface Row {
  plant: string;
  byYear: Record<number, number>;
  total: number;
}

const FACTS: Fact[] = [
  { plant: "Ulm", year: 2024, tonnes: 410 },
  { plant: "Ulm", year: 2025, tonnes: 435 },
  { plant: "Ulm", year: 2026, tonnes: 452 },
  { plant: "Hof", year: 2024, tonnes: 220 },
  { plant: "Hof", year: 2026, tonnes: 205 },
  { plant: "Kiel", year: 2025, tonnes: 310 },
  { plant: "Kiel", year: 2026, tonnes: 342 },
];

/** One row per plant, its cells keyed by year, its total as a field. */
function pivot(facts: Fact[]) {
  const rows = new Map<string, Row>();
  for (const f of facts) {
    const row = rows.get(f.plant) ?? { plant: f.plant, byYear: {}, total: 0 };
    row.byYear[f.year] = (row.byYear[f.year] ?? 0) + f.tonnes;
    row.total += f.tonnes;
    rows.set(f.plant, row);
  }
  return { rows: [...rows.values()], years: [...new Set(facts.map((f) => f.year))].sort() };
}

export default function MatrixWithTotals() {
  const { rows, years } = pivot(FACTS);
  const { Table, Column } = useTable(rows, { rowKey: (r) => r.plant });
  return (
    <Table ariaLabel="Output by plant and year">
      <Column value="plant" label="Plant" rowHeader />
      {years.map((y) => (
        <Column key={y} id={`y${y}`} label={String(y)} value={(r: Row) => r.byYear[y]} aggregate="sum" format="count" filter="range" />
      ))}
      <Column value="total" label="Total" aggregate="sum" format="count" />
    </Table>
  );
}
