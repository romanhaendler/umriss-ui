import { Checkbox, Text } from "@umriss-ui/core";
import { Tooltip, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const MINUTE = 60_000;

const DAY = 24 * 60 * MINUTE;

/** Today, 06:00 to 14:00 local, a reading every ten minutes. */
const START = new Date(2026, 2, 17, 6).getTime();

interface Reading {
  t: number;
  temperature: number;
  pressure: number;
  flow: number;
}

function course(seed: number): Reading[] {
  const r = random(seed);
  return Array.from({ length: 49 }, (_, i) => ({
    t: START + i * 10 * MINUTE,
    temperature: Math.round((1180 + 25 * Math.sin(i / 7) + (r() - 0.5) * 8) * 10) / 10,
    pressure: Math.round((4.2 + 0.5 * Math.sin(i / 11 + 1) + (r() - 0.5) * 0.12) * 100) / 100,
    flow: Math.round(310 + 60 * Math.sin(i / 9 + 2) + (r() - 0.5) * 14),
  }));
}

const TODAY = course(11);

/** Yesterday's temperature as the historian returns it, then shifted by a day to stand on today's axis. */
const YESTERDAY = course(12).map((row) => ({ t: row.t - DAY, temperature: row.temperature }));

const YESTERDAY_ON_TODAY = YESTERDAY.map((row) => ({ ...row, t: row.t + DAY }));

const PENS = [
  { name: "Furnace temperature", key: "temperature", unit: "°C", digits: 0 },
  { name: "Steam pressure", key: "pressure", unit: "bar", digits: 2 },
  { name: "Cooling flow", key: "flow", unit: "m³/h", digits: 0 },
] as const;

const YESTERDAY_NAME = "Furnace temperature, yesterday";

export const title = "A trend with pens";
export const lead = "Three pens stand on one time axis, each on a scale of its own with its unit as the label; yesterday's course of one pen is one more dashed `Line`. The pen list is core's `Checkbox` bound to `hidden` and `toggleSeries` (an application with the table binds a `Table` the same way). A pen is a tag of the application's historian, which the chart does not know: it draws the rows it is given.";

export default function Pens() {
  const { Chart, XAxis, YAxis, Line, hidden, toggleSeries } = useChart(TODAY);
  const last = TODAY[TODAY.length - 1] as Reading;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Chart height={300} aria-label="Furnace temperature, steam pressure and cooling flow today, and yesterday's temperature">
        <XAxis value="t" time />
        <YAxis domain={[1100, 1250]} label="°C" />
        <YAxis id="bar" domain={[3, 6]} label="bar" />
        <YAxis id="flow" position="right" domain={[200, 400]} label="m³/h" />
        <Line value="temperature" name="Furnace temperature" markers="never" />
        <Line value="temperature" data={YESTERDAY_ON_TODAY} name={YESTERDAY_NAME} dash={[5, 4]} color="var(--uc-series-1)" markers="never" />
        <Line value="pressure" yAxisId="bar" name="Steam pressure" markers="never" />
        <Line value="flow" yAxisId="flow" name="Cooling flow" markers="never" />
        <Tooltip mode="x" />
      </Chart>
      <div style={{ display: "grid", gap: 4, maxWidth: 420 }}>
        {PENS.map((pen) => (
          <Checkbox
            key={pen.name}
            checked={!hidden.includes(pen.name)}
            onChange={() => {
              toggleSeries(pen.name);
              if (pen.key === "temperature") toggleSeries(YESTERDAY_NAME);
            }}
            label={
              <span style={{ display: "flex", gap: 8, minWidth: 380, justifyContent: "space-between" }}>
                <Text as="span">{pen.name}, {pen.unit}</Text>
                <Text as="span" mono>{last[pen.key].toFixed(pen.digits)}</Text>
              </span>
            }
          />
        ))}
        <Text as="p" size="sm" tone="muted" data-role="hidden">{hidden.join(", ")}</Text>
      </div>
    </div>
  );
}
