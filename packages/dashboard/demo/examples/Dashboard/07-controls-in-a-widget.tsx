import { useState } from "react";
import { useChart } from "@umriss-ui/charts";
import { Button, ButtonGroup } from "@umriss-ui/core";
import { useDashboard } from "../../../src";

export const title = "Controls of a widget's own";
export const lead = "A widget's content can start with the application's own controls: a period switch above a chart that fills the rest of the body. The head takes no controls, because it is the grip, it takes the arrow keys and it carries the one menu. The row rests with the content in the editing mode, so arranging is never mistaken for using.";

/* The values of each period: this week's days and the last month's weeks. */
const SERIES = {
  week: [58, 52, 55, 51, 49, 53, 47],
  month: [56, 58, 52, 55, 51, 49, 53, 47, 52, 56, 60, 57],
} as const;

type Period = keyof typeof SERIES;

/** A row of the application's controls at the top, the chart in the room left: the content is a column at the body's full height. */
function Orders() {
  const [period, setPeriod] = useState<Period>("week");
  const rows = SERIES[period].map((now, i) => ({ i, now }));
  const { Chart, XAxis, YAxis, Area } = useChart(rows);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--u-space-2)", height: "100%", minWidth: 0 }}>
      <div style={{ flex: "none" }}>
        <ButtonGroup aria-label="Period" size="sm">
          <Button variant={period === "week" ? "primary" : "secondary"} onClick={() => setPeriod("week")}>This week</Button>
          <Button variant={period === "month" ? "primary" : "secondary"} onClick={() => setPeriod("month")}>Last month</Button>
        </ButtonGroup>
      </div>
      <div style={{ flex: "1 1 0", minHeight: 0 }}>
        <Chart aria-label={`Orders, ${period === "week" ? "this week" : "last month"}`} padding={4} style={{ minHeight: 0, height: "100%" }}>
          <XAxis value="i" domain="data" grid={false} tickFormat={() => ""} />
          <YAxis grid tickFormat={() => ""} />
          <Area value="now" name="Orders" color="var(--u-color-accent)" fillOpacity={0.09} strokeWidth={1.75} />
        </Chart>
      </div>
    </div>
  );
}

export default function ControlsInAWidget() {
  const { Dashboard, WidgetType } = useDashboard({
    defaultView: { widgets: [{ id: "o1", type: "orders", size: "wide", options: {} }] },
  });
  return (
    <Dashboard aria-label="Orders, by period">
      <WidgetType
        name="orders"
        label="Orders by period"
        sentence="The orders of the week or the month."
        sizes={{ wide: { columns: 6, rows: 4 }, full: { columns: 12, rows: 4 } }}
        start="wide"
        defaultOptions={{}}
      >
        {() => <Orders />}
      </WidgetType>
    </Dashboard>
  );
}
