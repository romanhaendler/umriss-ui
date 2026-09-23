/* Benchmark example (R-5.1 to R-5.3).

   Three series; lines and the area downsample on their own above two points
   per pixel column (charts-long-series 03). A hover draws the overlay layer
   exclusively - the FPS display proves it. Switchable between three lines and a
   mixed set of a bar, an area and a line.

   Excluded from the screenshot comparisons (R-5.1) - it measures the moment it
   exists, so a picture of it would compare two different runs.
   Shows: the time of materialisation, the time of the last series draw and an FPS
   counter that runs while the mouse moves over the plot area.
   Live mode appends 10 points/s and shifts the data window along - the axis width
   has to stay calm through the hysteresis (R-5.3). */

import { useCallback, useEffect, useRef, useState } from "react";
import { Area, Bar, Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { ChartPerf } from "../../../src";
import { load, random, type LoadPoint } from "../../data";

export const title = "Benchmark";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const SIZES = [1_000, 100_000, 1_000_000] as const;
const WINDOW = 400;

/** Series kinds of the measuring run. A filled mark and a rectangle per point are
    different work from a stroked path - the measurements in the capability record
    must not hold for lines only. */
type Mode = "lines" | "mixed";

export default function Benchmark() {
  const [data, setData] = useState<readonly LoadPoint[]>(() => load(5, 1_000));
  const [perf, setPerf] = useState<ChartPerf>({
    materializeMs: 0,
    seriesDrawMs: 0,
    points: 0,
  });
  const [fps, setFps] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState<Mode>("lines");

  const onPerf = useCallback((p: ChartPerf) => setPerf(p), []);

  /* FPS measurement: runs only while the pointer is over the plot area. What is
     measured is the actual frame rate of the page - if it drops, the series layer
     is drawing along (which it must not do on a hover). */
  const measuring = useRef<number | null>(null);
  const startMeasuring = useCallback(() => {
    if (measuring.current !== null) return;
    let frames = 0;
    let start = performance.now();
    const step = () => {
      frames++;
      const now = performance.now();
      if (now - start >= 400) {
        setFps(Math.round((frames * 1000) / (now - start)));
        frames = 0;
        start = now;
      }
      measuring.current = requestAnimationFrame(step);
    };
    measuring.current = requestAnimationFrame(step);
  }, []);
  const stopMeasuring = useCallback(() => {
    if (measuring.current !== null) cancelAnimationFrame(measuring.current);
    measuring.current = null;
    setFps(null);
  }, []);
  useEffect(() => stopMeasuring, [stopMeasuring]);

  /* Streaming test (R-5.3): 10 points/s, a travelling window. */
  useEffect(() => {
    if (!live) return;
    const r = random(4711);
    const timer = window.setInterval(() => {
      setData((previous) => {
        const last = previous[previous.length - 1];
        if (last === undefined) return previous;
        const next: LoadPoint = {
          t: last.t + 1,
          s1: last.s1 + (r() - 0.5) * 3,
          s2: last.s2 + (r() - 0.5) * 2.4,
          s3: last.s3 + (r() - 0.5) * 3.6,
        };
        const grown = [...previous, next];
        return grown.length > WINDOW ? grown.slice(grown.length - WINDOW) : grown;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [live]);

  const loadPoints = (n: number) => {
    setLive(false);
    setData(load(5, n));
  };

  return (
    <>
      <div className="demo-actions">
        {SIZES.map((n) => (
          <button key={n} className="demo-button" onClick={() => loadPoints(n)}>
            {n.toLocaleString("en-US")} points
          </button>
        ))}
        <button className="demo-button" onClick={() => setLive((v) => !v)}>{live ? "Stop live" : "Live"}</button>
        <button
          className="demo-button"
          data-role="mode"
          onClick={() => setMode((m) => (m === "lines" ? "mixed" : "lines"))}
        >
          {mode === "lines" ? "Mixed" : "Lines only"}
        </button>
      </div>
      <dl className="metrics">
        <div>
          <dt>Points</dt>
          <dd>{perf.points.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Materialisation</dt>
          <dd>{perf.materializeMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>Series draw</dt>
          <dd>{perf.seriesDrawMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>FPS (hover)</dt>
          <dd>{fps === null ? "–" : fps}</dd>
        </div>
      </dl>
      <div onPointerEnter={startMeasuring} onPointerLeave={stopMeasuring}>
        <Chart
          data={data}
          height={320}
          ariaLabel="Benchmark with three series"
          onPerf={onPerf}
        >
          <XAxis accessor={(d: LoadPoint) => d.t} label="Index" />
          <YAxis accessor={(d: LoadPoint) => d.s1} />
          {mode === "lines" ? (
            <Line accessor={(d: LoadPoint) => d.s1} name="S1" />
          ) : (
            <Bar accessor={(d: LoadPoint) => d.s1} name="S1" />
          )}
          {mode === "lines" ? (
            <Line accessor={(d: LoadPoint) => d.s2} name="S2" />
          ) : (
            <Area accessor={(d: LoadPoint) => d.s2} name="S2" />
          )}
          <Line accessor={(d: LoadPoint) => d.s3} name="S3" />
          <Legend placement="top" />
          <Tooltip mode="x" />
        </Chart>
      </div>
    </>
  );
}
