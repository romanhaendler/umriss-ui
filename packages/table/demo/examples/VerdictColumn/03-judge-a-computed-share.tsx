import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Judge a computed share";

export const lead = "Compute the value in `value` and give the column an `id`; `format` writes value and excess alike, here as a percentage.";

interface CostCentre {
  name: string;
  budget: number;
  actual: number;
}

/* Spent against the month's budget. */
const SPEND: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 1.1, side: "upper", severity: "alarm" },
  ],
};

const CENTRES: CostCentre[] = [
  { name: "Sales", budget: 142_000, actual: 138_400 },
  { name: "Marketing", budget: 68_000, actual: 79_300 },
  { name: "IT", budget: 83_000, actual: 84_100 },
];

export default function JudgeAComputedShare() {
  const { Table, Column, VerdictColumn } = useTable(CENTRES, { rowKey: (c) => c.name });

  return (
    <Table ariaLabel="Budget use in March">
      <Column value="name" label="Cost centre" rowHeader />
      <Column value="actual" label="Actual (€)" format="count" />
      <VerdictColumn id="used" label="Budget used" value={(c) => c.actual / c.budget} limits={SPEND} format="percent" />
    </Table>
  );
}
