/* A plan whose size is set by a button, and the figures of what drawing and
   moving it cost. Everything is measured from outside: React's profiler, the
   clock and the frame callbacks; the pointer walk, the pan and the wheel zoom
   are dispatched on the schedule's canvas by the page itself, so a script only
   presses a button and waits for the status to read `done`. Not photographed:
   it measures the moment it runs. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Dependency, ScheduleInteraction, Subtask, Task } from "../../../src";

export const title = "Measure a plan";
export const lead = "Pick a plan size and run the scripted pointer walk, pan and wheel zoom: the times and frame counts say what drawing and moving it cost here.";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const T0 = Date.UTC(2026, 2, 16, 6);
const VIEW: readonly [number, number] = [T0, T0 + 8 * HOUR];
const HEIGHT = 440;
const LANE_HEIGHT = 44;
/* Events per scripted run, one to a frame. */
const EVENTS = 240;

const SIZES = {
  small: { lanes: 20, subtasks: 200 },
  medium: { lanes: 50, subtasks: 1_000 },
  large: { lanes: 100, subtasks: 5_000 },
} as const;
type Size = keyof typeof SIZES;

interface Plan {
  lanes: readonly string[];
  tasks: readonly Task[];
  subtasks: readonly Subtask[];
  dependencies: readonly Dependency[];
}

/** Lane 0 holds one long bar, the probe the pointer walk runs along. The other
    lanes share the remaining subtasks in 20-minute bars every half hour, each
    lane one task, and every bar after the first on a lane hangs on the bar
    before it - as many dependencies as there are such pairs. */
function plan({ lanes, subtasks }: { lanes: number; subtasks: number }): Plan {
  const laneIds = Array.from({ length: lanes }, (_, i) => `lane-${i}`);
  const tasks = laneIds.map((_, i): Task => ({ id: `task-${i}`, name: `Task ${i}`, color: `hsl(${(i * 37) % 360} 60% 50%)` }));
  const work: Subtask[] = [{ id: "probe", task: "task-0", lane: "lane-0", from: T0 + HOUR, to: T0 + 7 * HOUR, name: "Probe" }];
  const dependencies: Dependency[] = [];
  const others = lanes - 1;
  for (let j = 0; j < subtasks; j++) {
    const lane = 1 + (j % others);
    const from = T0 + Math.floor(j / others) * 30 * MINUTE;
    work.push({ id: `s-${j}`, task: `task-${lane}`, lane: `lane-${lane}`, from, to: from + 20 * MINUTE, name: `Work ${j}` });
    if (j >= others) dependencies.push({ id: `d-${j}`, from: `s-${j - others}`, to: `s-${j}`, lag: 0 });
  }
  return { lanes: laneIds, tasks, subtasks: work, dependencies };
}

type Figures = Record<string, number | undefined>;
const FIGURES = [
  ["first-render-ms", "First render, click to frame"],
  ["walk-bar-ms", "Pointer walk along one bar, ms per event"],
  ["walk-bar-renders", "Pointer walk along one bar, renders"],
  ["walk-bar-frame-ms", "Pointer walk along one bar, ms from event to end of its frame"],
  ["walk-many-ms", "Pointer walk across many bars, ms per event"],
  ["walk-many-renders", "Pointer walk across many bars, renders"],
  ["walk-many-frame-ms", "Pointer walk across many bars, ms from event to end of its frame"],
  ["pan-ms", "Pan, ms per event"],
  ["pan-frame-ms", "Pan, ms from event to end of its frame"],
  ["zoom-ms", "Wheel zoom, ms per event"],
  ["zoom-frame-ms", "Wheel zoom, ms from event to end of its frame"],
] as const;

/** What the page keeps between renders without drawing it: when the size was
    asked for, the the target last under the pointer. */
interface Meter {
  clickAt: number;
  hover: ScheduleInteraction | null;
}

/* One page, one meter: a module value, since no render may read or write it. */
const meter: Meter = { clickAt: 0, hover: null };

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const elapsed = (meter: Meter) => performance.now() - meter.clickAt;
const remember = (e: ScheduleInteraction) => {
  meter.hover = e;
};
const stamp = (meter: Meter) => {
  meter.clickAt = performance.now();
};

const pointer = (type: string, target: Element, x: number, y: number) =>
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", button: 0, buttons: type === "pointerup" ? 0 : 1, clientX: x, clientY: y }),
  );

/* The y of lane 0's row: moving down the probe's column until the schedule
   reports the probe under the pointer. */
function probeY(meter: Meter, el: Element, rect: DOMRect): number {
  for (let y = 0; y < HEIGHT; y += 3) {
    pointer("pointermove", el, rect.left + rect.width / 2, rect.top + y);
    const h = meter.hover;
    if (h?.hit.kind === "subtask" && h.hit.subtask.id === "probe") return rect.top + y;
  }
  return rect.top + LANE_HEIGHT;
}

interface Sinks {
  put: (values: Figures) => void;
  status: (s: "running" | "done") => void;
}

type Step = (el: Element, rect: DOMRect, y0: number, i: number) => void;

/* The end of the next frame: a task queued from a frame callback runs after
   that frame has been drawn, and the schedule's own draw callback, registered
   by the event before ours, has run by then. */
const frameEnd = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    requestAnimationFrame(() => channel.port2.postMessage(null));
  });

/* A scripted measurement: EVENTS events, one to a frame. It reports the time
   the dispatch itself took per event, the time from the dispatch to the end of
   the frame that drew it, and the batches of markup changes counted meanwhile.
   The synthetic pointer id is unknown to the browser, so the plot's pointer
   capture is switched off for the run. */
async function measure(name: string, root: HTMLElement | null, meter: Meter, sinks: Sinks, step: Step, drag: boolean): Promise<void> {
  const el = root?.querySelector("[data-schedule-plot] canvas");
  const plot = el?.parentElement;
  if (el === null || el === undefined || plot === null || plot === undefined) return;
  sinks.status("running");
  plot.setPointerCapture = () => undefined;
  const rect = el.getBoundingClientRect();
  const y0 = probeY(meter, el, rect);
  const middle = rect.left + rect.width / 2;
  if (drag) pointer("pointerdown", el, middle, y0);
  await frame();
  /* The production build has no profiler; a commit shows as a batch of changes
     to the schedule's markup, which is what is counted. */
  let renders = 0;
  const observer = new MutationObserver(() => renders++);
  observer.observe(root!, { subtree: true, childList: true, attributes: true, characterData: true });
  let busy = 0;
  let drawn = 0;
  for (let i = 0; i < EVENTS; i++) {
    await frame();
    const t = performance.now();
    step(el, rect, y0, i);
    busy += performance.now() - t;
    await frameEnd();
    drawn += performance.now() - t;
  }
  if (drag) pointer("pointerup", el, middle, y0);
  await frame();
  observer.disconnect();
  delete (plot as Partial<HTMLElement>).setPointerCapture;
  sinks.put({
    [`${name}-ms`]: busy / EVENTS,
    [`${name}-frame-ms`]: drawn / EVENTS,
    ...(name.startsWith("walk") ? { [`${name}-renders`]: renders } : {}),
  });
  sinks.status("done");
}

const rows = Math.max(1, Math.floor(HEIGHT / LANE_HEIGHT) - 1);
const STEPS: Record<string, { step: Step; drag: boolean }> = {
  "walk-bar": { step: (el, r, y0, i) => pointer("pointermove", el, r.left + r.width * (0.12 + (0.76 * i) / EVENTS), y0), drag: false },
  "walk-many": { step: (el, r, y0, i) => pointer("pointermove", el, r.left + r.width * ((i * 0.618) % 1), y0 + (i % rows) * LANE_HEIGHT), drag: false },
  /* The pan goes left for half the events and back again, so the view ends where it began. */
  pan: { step: (el, r, y0, i) => pointer("pointermove", el, r.left + r.width / 2 + (i < EVENTS / 2 ? -3 * i : -3 * (EVENTS - i)), y0), drag: true },
  /* Ctrl held, as a pinch arrives; in and out in turn. */
  zoom: {
    step: (el, r, y0, i) =>
      el.dispatchEvent(
        new WheelEvent("wheel", { bubbles: true, cancelable: true, ctrlKey: true, deltaY: i % 2 === 0 ? -120 : 120, clientX: r.left + r.width / 2, clientY: y0 }),
      ),
    drag: false,
  },
};
const RUNS = [
  ["walk-bar", "Walk along one bar"],
  ["walk-many", "Walk across many"],
  ["pan", "Pan"],
  ["zoom", "Wheel zoom"],
] as const;

function Plot({ data, onInteraction }: { data: Plan; onInteraction: (e: ScheduleInteraction) => void }) {
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: VIEW } });
  return (
    <Schedule aria-label="Benchmark plan" height={HEIGHT} laneHeight={LANE_HEIGHT} onInteraction={onInteraction}>
        {data.lanes.map((id) => (
          <Lane key={id} id={id} />
        ))}
        <Dependencies data={data.dependencies} />
        <Subtasks data={data.subtasks} tasks={data.tasks} />
    </Schedule>
  );
}

export default function Benchmark() {
  const [size, setSize] = useState<Size>("small");
  /* Pressing a size again draws the plan anew, so the first render can be taken twice. */
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "done">("running");
  const [figures, setFigures] = useState<Figures>({});
  const data = useMemo(() => plan(SIZES[size]), [size]);
  const host = useRef<HTMLDivElement>(null);

  const sinks: Sinks = {
    put: (values) => setFigures((f) => ({ ...f, ...values })),
    status: setStatus,
  };

  /* The second frame after the commit has the canvases drawn. */
  useEffect(() => {
    let live = true;
    void frame()
      .then(frame)
      .then(() => {
        if (!live) return;
        setFigures((f) => ({ ...f, "first-render-ms": elapsed(meter) }));
        setStatus("done");
      });
    return () => {
      live = false;
    };
  }, [size, round]);

  const show = (next: Size) => {
    stamp(meter);
    setStatus("running");
    setFigures({});
    setSize(next);
    setRound((r) => r + 1);
  };

  const busy = status === "running";
  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {(Object.keys(SIZES) as Size[]).map((s) => (
          <Button key={s} size="sm" data-role={`size-${s}`} disabled={busy} onClick={() => show(s)}>
            {SIZES[s].subtasks.toLocaleString("en-US")} subtasks
          </Button>
        ))}
        {RUNS.map(([name, label]) => (
          <Button
            key={name}
            size="sm"
            data-role={`run-${name}`}
            disabled={busy}
            onClick={() => void measure(name, host.current, meter, sinks, STEPS[name]!.step, STEPS[name]!.drag)}
          >
            {label}
          </Button>
        ))}
      </div>
      <dl style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", margin: 0 }}>
        <div>
          <Text as="dt">Status</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="status">{status}</Text>
        </div>
        <div>
          <Text as="dt">Lanes</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="plan-lanes">{data.lanes.length}</Text>
        </div>
        <div>
          <Text as="dt">Subtasks</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="plan-subtasks">{data.subtasks.length}</Text>
        </div>
        <div>
          <Text as="dt">Dependencies</Text>
          <Text as="dd" mono style={{ margin: 0 }} data-role="plan-dependencies">{data.dependencies.length}</Text>
        </div>
        {FIGURES.map(([role, name]) => {
          const value = figures[role];
          return (
            <div key={role}>
              <Text as="dt">{name}</Text>
              <Text as="dd" mono style={{ margin: 0 }} data-role={role}>{value === undefined ? "-" : value.toFixed(role.endsWith("ms") ? 2 : 0)}</Text>
            </div>
          );
        })}
      </dl>
      <div ref={host}>
        <Plot
          key={`${size}-${round}`}
          data={data}
          onInteraction={remember}
        />
      </div>
    </>
  );
}
