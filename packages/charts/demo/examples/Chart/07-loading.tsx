import { useEffect, useMemo, useRef, useState } from "react";
import { useChart } from "../../../src";

export const title = "Show that rows are on their way";
export const lead = "`loading`, as the table has it: before the first rows the frame stands and a silhouette of the chart to come shimmers in it, shaped by the first series; over a course already drawn the course stays, dims after a moment and takes no pointer until the answer is in.";

interface Reading {
  t: number;
  p95: number;
}

const HOUR = 3_600_000;
const START = Date.UTC(2026, 9, 5, 6);

/** A morning of latency readings; each `answer` a little different. */
function readings(answer: number): Reading[] {
  return Array.from({ length: 48 }, (_, i) => ({
    t: START + i * (HOUR / 8),
    p95: Math.round(180 + 40 * Math.sin((i + answer * 7) / 6) + ((i * 37 + answer * 11) % 23)),
  }));
}

const NOTHING: Reading[] = [];

function Latency({ rows, loading, label }: { rows: Reading[]; loading: boolean; label: string }) {
  const { Chart, XAxis, YAxis, Line } = useChart(rows);
  return (
    <Chart height={220} ariaLabel={label} loading={loading}>
      <XAxis value="t" time />
      <YAxis label="ms" />
      <Line value="p95" name="Refunds" />
    </Chart>
  );
}

export default function Loading() {
  const [answers, setAnswers] = useState(0);
  const [loading, setLoading] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);
  const rows = useMemo(() => readings(answers), [answers]);

  const reload = () => {
    setLoading(true);
    clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      setAnswers((n) => n + 1);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="pair">
      <div>
        <p className="pair-caption">loading, before the first rows</p>
        <Latency rows={NOTHING} loading label="Latency of Refunds, loading" />
      </div>
      <div>
        <p className="pair-caption">loading over a course - the answer takes 1.5 s</p>
        <Latency rows={rows} loading={loading} label="Latency of Refunds" />
        <div className="demo-actions">
          <button className="demo-button" onClick={reload} disabled={loading}>
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
