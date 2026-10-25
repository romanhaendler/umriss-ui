import { useState } from "react";
import { Tooltip, useChart } from "../../../src";

export const title = "Drill down from a year to its days";
export const lead = "`onSelect` on a bar drills in: a year opens its months, a month its days. The chart keeps no level and draws none - the stack of levels is this example's state, and the rows and the categories follow it (ADR-0056).";

/* Orders per day for 2024 and 2025, written out here so the example runs on its own: each day's
   count follows from its date, and a month and a year are the sums of the days in them. */
const YEARS = [2024, 2025];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = YEARS.flatMap((year) =>
  MONTHS.flatMap((_, month) => {
    const length = new Date(year, month + 1, 0).getDate();
    return Array.from({ length }, (_, index) => {
      const day = index + 1;
      const weekend = [0, 6].includes(new Date(year, month, day).getDay());
      return { year, month, day, orders: ((year * 31 + month * 7 + day * 13) % 40) + (weekend ? 30 : 70) };
    });
  }),
);

interface Level {
  year: number;
  month?: number;
}

interface Row {
  level: "year" | "month" | "day";
  year: number;
  month: number;
  label: string;
  orders: number;
}

function sum(days: readonly { orders: number }[]): number {
  return days.reduce((total, one) => total + one.orders, 0);
}

/* The rows of the level the stack stands on: the years, the months of one year, or the days of one month. */
function rowsAt(stack: readonly Level[]): Row[] {
  const top = stack.at(-1);
  if (top === undefined) {
    return YEARS.map((year) => ({
      level: "year",
      year,
      month: 0,
      label: String(year),
      orders: sum(DAYS.filter((d) => d.year === year)),
    }));
  }
  if (top.month === undefined) {
    return MONTHS.map((name, month) => ({
      level: "month",
      year: top.year,
      month,
      label: name,
      orders: sum(DAYS.filter((d) => d.year === top.year && d.month === month)),
    }));
  }
  return DAYS.filter((d) => d.year === top.year && d.month === top.month).map((d) => ({
    level: "day",
    year: d.year,
    month: d.month,
    label: String(d.day),
    orders: d.orders,
  }));
}

export default function DrillDown() {
  const [stack, setStack] = useState<Level[]>([]);
  const rows = rowsAt(stack);
  const top = stack.at(-1);
  const where = top === undefined ? "all years" : top.month === undefined ? String(top.year) : `${MONTHS[top.month]} ${top.year}`;
  /* The level the back button returns to: the months of a year are named by the year, the years by "all years". */
  const above = stack.length <= 1 ? "all years" : String(stack[0]!.year);
  const { Chart, XAxis, YAxis, Bar } = useChart(rows, {
    onSelect: (hit) => {
      const row = hit.points[0]?.datum;
      if (row === undefined || row.level === "day") return;
      setStack((current) => [...current, row.level === "year" ? { year: row.year } : { year: row.year, month: row.month }]);
    },
  });
  return (
    <>
      <dl className="metrics">
        <div>
          <dt>Showing</dt>
          <dd>{where}</dd>
        </div>
      </dl>
      {top !== undefined && (
        <button type="button" onClick={() => setStack((current) => current.slice(0, -1))}>
          Back to {above}
        </button>
      )}
      <Chart height={260} aria-label={`Orders, ${where}`}>
        <XAxis value="label" />
        <YAxis label="orders" />
        <Bar value="orders" name="Orders" />
        <Tooltip mode="x" />
      </Chart>
    </>
  );
}
