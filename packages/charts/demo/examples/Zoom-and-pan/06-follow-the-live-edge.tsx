import { Button } from "@umriss-ui/core";
import { useEffect, useMemo, useState } from "react";
import { Tooltip, useChart } from "../../../src";

/* A reading a second, derived from the clock: the value of a second never
   changes, so the rows that arrived before stay where they are. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SECOND = 1_000;
const HOUR = 60 * 60 * SECOND;
const WINDOW = 2 * HOUR;

/** The seed of a second, mixed so that neighbouring seconds draw unrelated
    numbers: the generator alone is a sawtooth from one second to the next. */
function mix(n: number): number {
  let x = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
}

/** The p95 latency of a second, in ms: a slow drift and a little noise. */
function reading(second: number): number {
  const r = random(mix(second));
  return Math.round(240 + 40 * Math.sin(second / 900) + 12 * (r() - 0.5));
}

/** Every second of the two hours that end now. */
function lastWindow(now: number): { t: number; p95: number }[] {
  const end = Math.floor(now / SECOND);
  const first = end - WINDOW / SECOND + 1;
  return Array.from({ length: WINDOW / SECOND }, (_, i) => ({ t: (first + i) * SECOND, p95: reading(first + i) }));
}

export const title = "Follow the live edge, with pause";
export const lead = "`setView` moves the span and is not reported, so the chart's own following is never heard as the reader's; `setDomain` is reported, which is why it fought a wheel zoom. A zoom or a pan stops the following through `onViewChange`, and \"Live\" puts the view back on the newest reading.";

export default function FollowTheLiveEdge() {
  const [now, setNow] = useState(() => Date.now());
  const [following, setFollowing] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), SECOND);
    return () => clearInterval(id);
  }, []);
  const rows = useMemo(() => lastWindow(now), [now]);
  const { Chart, XAxis, YAxis, Line, setView } = useChart(rows, {
    // Only the reader's changes reach this: `setView` below is never reported.
    onViewChange: () => setFollowing(false),
  });
  useEffect(() => {
    if (following) setView({ domains: { x: [now - HOUR, now] } });
  }, [now, following, setView]);
  return (
    <>
      <Chart height={260} aria-label="Latency over the last hour, following the newest reading">
        <XAxis value="t" time zoomable />
        <YAxis label="ms" />
        <Line value="p95" name="p95" />
        <Tooltip mode="x" />
      </Chart>
      <Button onClick={() => setFollowing((on) => !on)}>{following ? "Pause" : "Live"}</Button>
    </>
  );
}
