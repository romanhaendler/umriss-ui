import { Text } from "@umriss-ui/core";
import { useState } from "react";
import { Tooltip, useChart, type ChartRange } from "../../../src";

export const title = "Mark a range of bars";
export const lead = "A category axis does not zoom, so a plain drag marks a range: `from` and `to` are the category names the rows hold, the earlier one first.";

// February's spend per cost centre, as the ledger sends it.
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

export default function MarkARangeOfBars() {
  const [range, setRange] = useState<ChartRange<string> | null>(null);
  const { Chart, XAxis, YAxis, Bar } = useChart(SPEND, { onRange: setRange });
  return (
    <>
      <Chart height={260} aria-label="Actual spend per cost centre in February">
        <XAxis value="costCentre" />
        <YAxis label="€" />
        <Bar value="actual" name="Actual" />
        <Tooltip mode="x" />
      </Chart>
      <Text as="p">{range === null ? "Drag across the bars to mark a range." : `Marked: ${range.from} to ${range.to}`}</Text>
    </>
  );
}
