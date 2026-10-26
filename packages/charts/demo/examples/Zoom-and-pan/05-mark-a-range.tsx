import { Button, Text } from "@umriss-ui/core";
import { useState } from "react";
import { Tooltip, useChart, type ChartRange } from "../../../src";

export const title = "Mark a range";
export const lead = "`onRange` hears a stretch the reader marked - Alt with a drag, or Space at one point and Space at another - once, on release, `from` before `to`. The chart keeps none: the range lives in the example's own state, and handing it back as `initialView` is the one line that zooms into it.";

const HOUR = 3_600_000;
const START = Date.UTC(2026, 2, 16);
// Hourly p95 latency of one service over three days, as an API delivers it.
const READINGS = Array.from({ length: 72 }, (_, i) => ({
  t: START + i * HOUR,
  p95: Math.round(220 + 60 * Math.sin(i / 4) + ((i * 37) % 29) + (i >= 40 && i < 46 ? 150 : 0)),
}));

const when = (ms: number) => new Date(ms).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

export default function MarkARange() {
  const [range, setRange] = useState<ChartRange | null>(null);
  // `initialView` is read once, so a zoom into the range is a new chart that starts there.
  const [zoomed, setZoomed] = useState<ChartRange | null>(null);
  return (
    <>
      <Course key={zoomed === null ? "all" : `${zoomed.from}-${zoomed.to}`} zoomed={zoomed} onRange={setRange} />
      <Text as="p">{range === null ? "No range marked yet." : `Marked: ${when(range.from)} to ${when(range.to)} (UTC)`}</Text>
      <Button disabled={range === null} onClick={() => setZoomed(range)}>
        Zoom into it
      </Button>
    </>
  );
}

function Course({ zoomed, onRange }: { zoomed: ChartRange | null; onRange: (range: ChartRange) => void }) {
  const { Chart, XAxis, YAxis, Line } = useChart(READINGS, {
    onRange,
    initialView: zoomed === null ? undefined : { domains: { [zoomed.axisId]: [zoomed.from, zoomed.to] } },
  });
  return (
    <Chart height={240} aria-label="Hourly p95 latency over three days">
      <XAxis value="t" time domain="data" zoomable />
      <YAxis label="ms" />
      <Line value="p95" name="p95" />
      <Tooltip mode="x" />
    </Chart>
  );
}
