import { useTable } from "../../../src";

export const title = "Name your own aggregate";
export const lead =
  "A median and a standard deviation are not built in: a function is shorter than two wordings, a sign and their tests. `aggregateLabel` gives each function its word in the footer, where a screen reader reads it too.";

interface Run {
  id: string;
  cycleSeconds: number;
  scrapPercent: number;
}

const RUNS: Run[] = [
  { id: "R-1", cycleSeconds: 41, scrapPercent: 2 },
  { id: "R-2", cycleSeconds: 38, scrapPercent: 3 },
  { id: "R-3", cycleSeconds: 44, scrapPercent: 4 },
  { id: "R-4", cycleSeconds: 40, scrapPercent: 5 },
  { id: "R-5", cycleSeconds: 47, scrapPercent: 6 },
  { id: "R-6", cycleSeconds: 43, scrapPercent: 4 },
];

const median = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const deviation = (values: readonly number[]) => {
  if (values.length < 2) return undefined;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1));
};

export default function NameYourOwnAggregate() {
  const { Table, Column } = useTable(RUNS, { rowKey: (r) => r.id });
  return (
    <Table aria-label="Runs of one line">
      <Column value="id" label="Run" rowHeader />
      <Column value="cycleSeconds" label="Cycle time (s)" aggregate={median} aggregateLabel="Median" />
      <Column value="scrapPercent" label="Scrap (%)" format={{ decimals: 2 }} aggregate={deviation} aggregateLabel="Std. deviation" />
    </Table>
  );
}
