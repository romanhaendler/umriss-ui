/* Lines and the area downsample on their own above two points per pixel
   column; a hover draws the overlay layer only, which the FPS counter shows.
   Live appends 10 points a second in a moving window, and the axis width stays
   calm through its hysteresis. Not photographed: it measures the
   moment it runs. */

import { useCallback, useEffect, useRef, useState } from "react";
import { Legend, Tooltip, useChart } from "../../../src";
import type { ChartPerf } from "../../../src";

export const title = "Measure a million points";
export const lead = "Load up to a million points per series and hover: the times and the frame rate say what drawing and a hover cost here.";

/* A small LCG - the same numbers on every run. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface LoadPoint {
  t: number;
  s1: number;
  s2: number;
  s3: number;
  /** A state code 0..3 that holds for a run of about ten points. */
  st: number;
  /** Column, row and level of the same points laid out as a grid 200 rows high. */
  c: number;
  r: number;
  lvl: number;
}

const STATES = [
  { label: "A", color: "#2f6fb4" },
  { label: "B", color: "#c08a2e" },
  { label: "C", color: "#8a8f98" },
  { label: "D", color: "#6b8e5a" },
] as const;
const ROWS = 200;

/** Three random walks of any length, with a state, and a grid laid over them. */
function load(seed: number, n: number): LoadPoint[] {
  const r = random(seed);
  const points = new Array<LoadPoint>(n);
  let s1 = 100;
  let s2 = 60;
  let s3 = 140;
  let st = 0;
  const columns = Math.max(1, Math.ceil(n / ROWS));
  for (let i = 0; i < n; i++) {
    s1 += r() - 0.5;
    s2 += (r() - 0.5) * 0.8;
    s3 += (r() - 0.5) * 1.2;
    if (r() < 0.1) st = Math.floor(r() * 4);
    const c = i % columns;
    const row = Math.floor(i / columns);
    points[i] = { t: i, s1, s2, s3, st, c, r: row, lvl: 0.5 + 0.5 * Math.sin(c / 40) * Math.cos(row / 15) + (r() - 0.5) * 0.2 };
  }
  return points;
}

const SIZES = [1_000, 100_000, 1_000_000] as const;
const WINDOW = 400;

/** Series kinds of the measuring run. A filled mark and a rectangle per point are
    different work from a stroked path - the measurements in the capability record
    must not hold for lines only. */
type Mode = "lines" | "mixed" | "bars" | "scatter" | "state" | "matrix";
const MODES: readonly Mode[] = ["lines", "mixed", "bars", "scatter", "state", "matrix"];

/** How many points along x (columns for the matrix) a zoom shows. */
const ZOOMED = 400;

export default function Benchmark() {
  const [data, setData] = useState<readonly LoadPoint[]>(() => load(5, 1_000));
  const { Chart, XAxis, YAxis, Line, Bar, Area, Scatter, StateBand, Matrix, setDomain } = useChart(data);
  const [perf, setPerf] = useState<ChartPerf>({
    materializeMs: 0,
    seriesDrawMs: 0,
    points: 0,
  });
  const [fps, setFps] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState<Mode>("lines");
  /* The time the chart's handlers take for one pointer move, the mean of the
     last twenty: the hit test of the matrix is in it. */
  const [hoverMs, setHoverMs] = useState<number | null>(null);
  const moves = useRef<number[]>([]);
  const moveStart = useRef(0);
  const matrix = mode === "matrix";
  const columns = matrix ? Math.max(1, Math.ceil(data.length / ROWS)) : data.length;
  const course = mode === "lines" || mode === "mixed";

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

  /* Streaming test: 10 points/s, a travelling window. */
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
          st: r() < 0.1 ? Math.floor(r() * 4) : last.st,
          c: last.c + 1,
          r: last.r,
          lvl: last.lvl,
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
    setDomain("x", null);
    moves.current = [];
  };
  const pick = (m: Mode) => {
    setMode(m);
    setDomain("x", null);
    moves.current = [];
  };
  /* A span in the middle of the data: a small part of the volume is in view. */
  const zoom = () => {
    const from = Math.floor(columns / 2);
    setDomain("x", [from, from + ZOOMED]);
  };

  return (
    <>
      <div className="demo-actions">
        {SIZES.map((n) => (
          <button key={n} className="demo-button" data-role={`points-${n}`} onClick={() => loadPoints(n)}>
            {n.toLocaleString("en-US")} points
          </button>
        ))}
        <button className="demo-button" onClick={() => setLive((v) => !v)}>{live ? "Stop live" : "Live"}</button>
        {MODES.map((m) => (
          <button key={m} className="demo-button" data-role={`kind-${m}`} aria-pressed={mode === m} onClick={() => pick(m)}>
            {m}
          </button>
        ))}
        <button className="demo-button" data-role="zoom" onClick={zoom}>
          Zoom in
        </button>
        <button className="demo-button" data-role="unzoom" onClick={() => setDomain("x", null)}>
          Whole
        </button>
      </div>
      <dl className="metrics">
        <div>
          <dt>Points</dt>
          <dd data-role="points">{perf.points.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Materialisation</dt>
          <dd data-role="materialize-ms">{perf.materializeMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>Series draw</dt>
          <dd data-role="series-draw-ms">{perf.seriesDrawMs.toFixed(1)} ms</dd>
        </div>
        <div>
          <dt>FPS (hover)</dt>
          <dd>{fps === null ? "–" : fps}</dd>
        </div>
        <div>
          <dt>Pointer move</dt>
          <dd data-role="hover-ms">{hoverMs === null ? "–" : `${hoverMs.toFixed(2)} ms`}</dd>
        </div>
      </dl>
      <div
        data-role="plot"
        onPointerEnter={startMeasuring}
        onPointerLeave={stopMeasuring}
        onPointerMoveCapture={() => {
          moveStart.current = performance.now();
        }}
        onPointerMove={() => {
          moves.current.push(performance.now() - moveStart.current);
          if (moves.current.length > 20) moves.current.shift();
          setHoverMs(moves.current.reduce((a, b) => a + b, 0) / moves.current.length);
        }}
      >
        <Chart
          height={320}
          aria-label="Benchmark with three series"
          onPerf={onPerf}
        >
          <XAxis value={matrix ? "c" : "t"} label="Index" domain="data" zoomable />
          <YAxis domain={mode === "state" ? [0, 1] : undefined} />
          {mode === "scatter" ? <Scatter value="s1" name="S1" /> : null}
          {mode === "state" ? <StateBand value="st" states={STATES} name="State" /> : null}
          {matrix ? <Matrix value="r" level="lvl" name="Level" /> : null}
          {mode === "bars" ? <Bar value="s1" name="S1" /> : null}
          {course ? mode === "lines" ? <Line value="s1" name="S1" /> : <Bar value="s1" name="S1" /> : null}
          {course ? mode === "lines" ? <Line value="s2" name="S2" /> : <Area value="s2" name="S2" /> : null}
          {course ? <Line value="s3" name="S3" /> : null}
          <Legend placement="top" />
          <Tooltip mode="x" />
        </Chart>
      </div>
    </>
  );
}
