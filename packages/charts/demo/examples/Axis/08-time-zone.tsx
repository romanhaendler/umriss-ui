import { Tooltip, useChart } from "../../../src";

/* Data from the energy world, written out here so the example runs on its own. */

interface Reading {
  t: number;
  /** Power fed into the grid, in kW. */
  kw: number;
}

/** A solar plant's feed-in every hour from 25 October 2026, 00:00 UTC to 17:00
    UTC - the day Berlin's clocks go back, so that 02:00 stands there twice. */
const FEED_IN: readonly Reading[] = Array.from({ length: 18 }, (_, hour) => ({
  t: Date.UTC(2026, 9, 25, hour),
  kw: Math.round(Math.max(0, Math.sin((Math.PI * (hour - 5)) / 11)) * 840),
}));

export const title = "Name the time zone of the instants";
export const lead = "`timeZone` draws the trend in that zone for a reader anywhere: ticks on its hours, labels, tooltip and data table in its time. On 25 October Berlin's clocks go back, and the doubled hour takes its real room on the axis.";

function Trend({ timeZone, name }: { timeZone: string; name: string }) {
  const { Chart, XAxis, YAxis, Line } = useChart(FEED_IN);
  return (
    <Chart height={220} timeZone={timeZone} aria-label={`Feed-in on 25 October 2026 in ${name}`}>
      <XAxis value="t" time tickCount={9} label={name} />
      <YAxis label="kW" />
      <Line value="kw" name="Feed-in" />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function TimeZone() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Trend timeZone="Europe/Berlin" name="Berlin" />
      <Trend timeZone="UTC" name="UTC" />
    </div>
  );
}
