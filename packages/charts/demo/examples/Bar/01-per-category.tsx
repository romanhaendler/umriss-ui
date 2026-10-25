import { Tooltip, useChart } from "../../../src";

export const title = "One bar per category";
export const lead = "Give the x axis the field that holds the category: each one gets a place, a tick and its name, in the order of the rows (ADR-0052).";

/* February's spend per cost centre, as the ledger sends it. */
const SPEND = [
  { costCentre: "Sales", actual: 134_447 },
  { costCentre: "Marketing", actual: 76_588 },
  { costCentre: "Engineering", actual: 183_157 },
  { costCentre: "Design", actual: 51_761 },
  { costCentre: "Customer service", actual: 61_160 },
  { costCentre: "Finance", actual: 46_353 },
  { costCentre: "People", actual: 37_886 },
  { costCentre: "IT", actual: 74_313 },
  { costCentre: "Facilities", actual: 71_848 },
];

export default function PerCategory() {
  const { Chart, XAxis, YAxis, Bar } = useChart(SPEND);
  return (
    <Chart height={260} aria-label="Actual spend per cost centre in February">
      <XAxis value="costCentre" />
      <YAxis label="€" />
      <Bar value="actual" name="Actual" />
      <Tooltip mode="x" />
    </Chart>
  );
}
