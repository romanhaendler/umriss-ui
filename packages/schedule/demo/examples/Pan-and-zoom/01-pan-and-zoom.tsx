import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Moving through the plan";

/* Nothing here is configured. A schedule pans and zooms because that is what a
   plan is for, and the gestures are the ones every scrolling surface has:

     drag the background     pans through time AND through the lanes
     the wheel               scrolls the lanes, and releases the page at the end
     Shift with the wheel    pans through time
     Ctrl or Cmd with it     zooms; a trackpad pinch arrives the same way
     two fingers             zoom

   The wheel releasing the page is the part worth saying out loud: a plan
   halfway down a page must not swallow the scroll that was meant for the page.
   Once the lanes are at their end, the wheel goes back to the document.

   What moves is the VIEW and only the view. No data changes, nothing is
   reported, no intent is raised: pan and zoom exchange the visible span and
   the scroll, and nothing else (ADR-0001). `zoomLimits` says how far the span
   may be taken - an hour to twenty-eight days, unless a caller says otherwise;
   this one is held between two hours and two days, so the ends are reachable
   in a few turns of the wheel. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;
const HOUR = 60 * 60_000;

const TASKS: Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
];

const STEPS: Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), setup: min(15), teardown: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(12), to: at(13, 30), setup: min(15) },
];

export default function PanAndZoom() {
  return (
    <Schedule
      ariaLabel="A plan to pan and zoom"
      initialDomain={[at(5, 30), at(18)]}
      height={196}
      zoomLimits={{ min: 2 * HOUR, max: 48 * HOUR }}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Subtasks data={STEPS} tasks={TASKS} />
    </Schedule>
  );
}
