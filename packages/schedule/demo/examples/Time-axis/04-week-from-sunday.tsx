import { LanguageProvider, formatsFor } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Open each week on Sunday";

export const lead = "The week's first day comes from the language's formats: under `en-US` the dates of a zoomed-out axis stand on Sundays.";

const at = (day: number, hours = 9) => new Date(2026, 2, day, hours).getTime();

const TASKS: Task[] = [{ id: "release", name: "Release", color: "light-dark(#2563eb, #6b9bff)" }];

const TRAINS: Subtask[] = [
  { id: "r1", task: "release", lane: "web", from: at(2), to: at(30) },
  { id: "r2", task: "release", lane: "web", from: at(37), to: at(72) },
  { id: "r3", task: "release", lane: "mobile", from: at(9), to: at(51) },
  { id: "r4", task: "release", lane: "mobile", from: at(58), to: at(93) },
  { id: "r5", task: "release", lane: "desktop", from: at(23), to: at(79) },
];

const SIXTEEN_WEEKS: readonly [number, number] = [at(2, 0), at(114, 0)];

export default function WeekFromSunday() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: SIXTEEN_WEEKS } });
  return (
    <LanguageProvider formats={formatsFor("en-US")}>
      <Schedule aria-label="Release trains, March to June" height={220}>
        <Lane id="web" label="Web" />
        <Lane id="mobile" label="Mobile" />
        <Lane id="desktop" label="Desktop" />
        <Subtasks data={TRAINS} tasks={TASKS} />
      </Schedule>
    </LanguageProvider>
  );
}
