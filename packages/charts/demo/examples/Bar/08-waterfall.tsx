import { DataTable, Tooltip, useChart } from "../../../src";

export const title = "A waterfall";
export const lead = "Keep a running sum beside the changes, give `value` where each step ends and `baseline` where it began: the start and end totals stand on zero, the steps float, and no helper series exists to leak into the tooltip.";

/* The revenue bridge of a half year in €k: the opening total, what moved it, the closing total. */
const CHANGES = [
  { step: "New customers", change: 310 },
  { step: "Upsell", change: 140 },
  { step: "Churn", change: -220 },
  { step: "Price cut", change: -90 },
  { step: "Renewals", change: 180 },
];

const START = 1200;

/** The running sum: each step begins where the one before ended. */
const BRIDGE = (() => {
  let sum = START;
  const steps = CHANGES.map(({ step, change }) => {
    const from = sum;
    sum += change;
    return { step, from, to: sum };
  });
  return [{ step: "Start", from: 0, to: START }, ...steps, { step: "End", from: 0, to: sum }];
})();

export default function Waterfall() {
  const { Chart, XAxis, YAxis, Bar } = useChart(BRIDGE);
  return (
    <Chart height={280} aria-label="Revenue from the opening to the closing total, step by step">
      <XAxis value="step" label="Step" />
      <YAxis label="€k" />
      <Bar value="to" baseline="from" name="Revenue" />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}
