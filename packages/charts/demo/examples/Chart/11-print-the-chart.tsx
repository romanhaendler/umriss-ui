import { Legend, useChart } from "../../../src";

export const title = "Print the chart";
export const lead = "Nothing to set: the chart redraws at the width of the sheet, and the tooltip and the \"show all\" button stay off it. The legend prints, and the second line is dashed, so no series is told apart by colour alone.";

const DAYS = Array.from({ length: 14 }, (_, i) => ({ day: i + 2, arrived: 30 + ((i * 7) % 23), dispatched: 24 + ((i * 5) % 19) }));

export default function PrintTheChart() {
  const { Chart, XAxis, YAxis, Line } = useChart(DAYS);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <button type="button" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </button>
      <Chart height={260} aria-label="North depot: pallets in and out over fourteen days">
        <XAxis value="day" label="Day of March" tickCount={7} />
        <YAxis label="Pallets" />
        <Line value="arrived" name="Arrived" strokeWidth={2} />
        <Line value="dispatched" name="Dispatched" strokeWidth={2} dash={[4, 3]} />
        <Legend placement="top" />
      </Chart>
    </div>
  );
}
