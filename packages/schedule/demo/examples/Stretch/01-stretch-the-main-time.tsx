import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Stretch the main time";

export const lead = "With `stretch` in `intents`, either edge of a bar drags to a new start or end; the other edge stays put.";

const day = (d: number, hours = 9) => new Date(2026, 2, d, hours).getTime();

const PROJECTS: readonly Task[] = [{ id: "booking", name: "Booking app", color: "light-dark(#0d9488, #3cc7b8)" }];

const START: readonly Subtask[] = [
  { id: "w-111", task: "booking", lane: "hana", from: day(16), to: day(18, 17), name: "Push notifications" },
  { id: "w-116", task: "booking", lane: "david", from: day(16), to: day(19, 13), name: "Device test matrix" },
];

export default function StretchTheMainTime() {
  const [work, setWork] = useState(START);
  return (
    <Schedule
      ariaLabel="Two estimates to adjust"
      initialDomain={[day(16, 0), day(21, 0)]}
      height={140}
      intents={["stretch"]}
      onIntent={(intent) => setWork((current) => current.map((item) => applyIntent(item, intent)))}
    >
      <Lane id="hana" label="Hana Sato" />
      <Lane id="david" label="David Kowalski" />
      <Subtasks data={work} tasks={PROJECTS} />
    </Schedule>
  );
}
