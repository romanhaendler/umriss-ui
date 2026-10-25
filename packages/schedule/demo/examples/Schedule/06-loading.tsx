import { useEffect, useRef, useState } from "react";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Show that a plan is on its way";

export const lead = "`loading`, as the chart and the table have it: over a plan the plan stays, dims after a moment and starts no drag, tooltip or key intent until the answer is in; before the first lanes, placeholder lines stand in the lane column.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const DAY: readonly [number, number] = [at(6), at(16)];

const TOURS: readonly Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" },
];

/** Each answer shifts the second tour by a quarter of an hour. */
function legs(answer: number): readonly Subtask[] {
  const shift = (answer % 4) * 15;
  return [
    { id: "t-01-1", task: "t-01", lane: "van-1", from: at(7), to: at(9) },
    { id: "t-03-1", task: "t-03", lane: "van-2", from: at(8, shift), to: at(10, shift) },
    { id: "t-01-2", task: "t-01", lane: "e-van", from: at(11), to: at(13) },
  ];
}

const LANES = [
  { id: "van-1", label: "Van FP 214 K" },
  { id: "van-2", label: "Van FP 402 R" },
  { id: "e-van", label: "E-van FP 377 K" },
];

function Plan({ answer, loading }: { answer: number; loading: boolean }) {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: DAY } });
  return (
    <Schedule aria-label="Tours of the day" height={220} loading={loading} intents={["move", "lane"]}>
      {LANES.map((lane) => (
        <Lane key={lane.id} id={lane.id} label={lane.label} />
      ))}
      <Subtasks data={legs(answer)} tasks={TOURS} />
    </Schedule>
  );
}

function Waiting() {
  const { Schedule } = useSchedule({ initialView: { domain: DAY } });
  return <Schedule aria-label="Tours of the day, loading" height={220} loading />;
}

export default function Loading() {
  const [answer, setAnswer] = useState(0);
  const [loading, setLoading] = useState(false);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(pending.current), []);

  const reload = () => {
    setLoading(true);
    clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      setAnswer((n) => n + 1);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="pair">
      <div>
        <p className="pair-caption">loading over a plan - the answer takes 1.5 s</p>
        <Plan answer={answer} loading={loading} />
        <div className="demo-actions">
          <button className="demo-button" onClick={reload} disabled={loading}>
            Reload
          </button>
        </div>
      </div>
      <div>
        <p className="pair-caption">loading, before the first lanes</p>
        <Waiting />
      </div>
    </div>
  );
}
