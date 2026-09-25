import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "A person booked twice";

export const lead = "Both bars stay where their times put them: the later one is offset and edged, and the shared time is marked across the lane.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const PROJECTS: Task[] = [
  { id: "booking", name: "Booking app", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "intranet", name: "Intranet", color: "light-dark(#be185d, #f06aa6)" },
];

const WORK: Subtask[] = [
  { id: "calendar-sync", task: "booking", lane: "kofi", from: at(9), to: at(12, 30) },
  { id: "news-feed", task: "intranet", lane: "kofi", from: at(11), to: at(15) },
  { id: "reminders", task: "booking", lane: "hana", from: at(9), to: at(13) },
];

export default function DoubleBooking() {
  return (
    <Schedule ariaLabel="Kofi booked on two projects at once" initialDomain={[at(8), at(16)]} height={150}>
      <Lane id="kofi" label="Kofi Mensah" />
      <Lane id="hana" label="Hana Sato" />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
