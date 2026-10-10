import { Legend, Tooltip, useChart } from "../../../src";

export const title = "Group bars side by side";
export const lead = "Bar series on one x axis stand beside each other; give each the same `barWidth`, and the reference a quiet `color`.";

/* February's budget and spend per cost centre, as the ledger sends them. */
const FEBRUARY = [
  { costCentre: "Sales", budget: 142_000, actual: 134_447 },
  { costCentre: "Marketing", budget: 68_000, actual: 76_588 },
  { costCentre: "Engineering", budget: 188_000, actual: 183_157 },
  { costCentre: "Design", budget: 54_000, actual: 51_761 },
  { costCentre: "Customer service", budget: 61_000, actual: 61_160 },
  { costCentre: "Finance", budget: 47_000, actual: 46_353 },
  { costCentre: "People", budget: 39_000, actual: 37_886 },
  { costCentre: "IT", budget: 83_000, actual: 74_313 },
  { costCentre: "Facilities", budget: 72_000, actual: 71_848 },
];

export default function Grouped() {
  const { Chart, XAxis, YAxis, Bar } = useChart(FEBRUARY);
  return (
    <Chart height={280} ariaLabel="Budget and actual per cost centre in February">
      <XAxis value="costCentre" />
      <YAxis label="€" />
      {/* A token, so that it follows the colour scheme. */}
      <Bar value="budget" name="Budget" color="var(--uc-color-text)" barWidth={0.7} />
      <Bar value="actual" name="Actual" barWidth={0.7} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
