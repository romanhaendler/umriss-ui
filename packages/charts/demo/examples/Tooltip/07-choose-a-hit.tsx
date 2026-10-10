import { useState } from "react";
import { Tooltip, useChart, type TooltipHit } from "../../../src";

export const title = "Choose a hit";
export const lead = "`onSelect` hears a click on a hit, a tap, or Enter on the Active point, with the same hit a custom tooltip receives. The chart keeps no choice and draws none: it is your state, here shown beside the chart.";

/* Orders taken per hour of a shop's day, written out here so the example runs on its own. */
const ORDERS = [
  { hour: 8, web: 14, phone: 6 }, { hour: 9, web: 22, phone: 9 }, { hour: 10, web: 31, phone: 11 },
  { hour: 11, web: 38, phone: 8 }, { hour: 12, web: 52, phone: 14 }, { hour: 13, web: 47, phone: 10 },
  { hour: 14, web: 35, phone: 7 }, { hour: 15, web: 29, phone: 9 },
];

type Order = (typeof ORDERS)[number];

export default function ChooseAHit() {
  const [chosen, setChosen] = useState<TooltipHit<Order> | null>(null);
  const { Chart, XAxis, YAxis, Line } = useChart(ORDERS, { onSelect: setChosen });
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Chart height={260} ariaLabel="Orders per hour, by channel">
          <XAxis value="hour" tickFormat={(v) => `${v}:00`} />
          <YAxis label="orders" />
          <Line value="web" name="Web" />
          <Line value="phone" name="Phone" />
          <Tooltip mode="x" />
        </Chart>
      </div>
      <dl style={{ width: 180, margin: 0 }} aria-live="polite">
        {chosen === null ? (
          <dd style={{ margin: 0 }}>Click a point, or press Enter on one.</dd>
        ) : (
          <>
            <dt>Hour</dt>
            <dd style={{ margin: 0 }}>{chosen.xValue}:00</dd>
            {chosen.points.map((p) => (
              <div key={p.seriesName}>
                <dt>{p.seriesName}</dt>
                <dd style={{ margin: 0 }}>{p.yValue} orders</dd>
              </div>
            ))}
          </>
        )}
      </dl>
    </div>
  );
}
