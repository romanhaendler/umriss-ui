import { useState } from "react";
import { Chart, DataTable, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";

/* Data from the planning world, written out here so the example runs on its own. */
const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** A work item, shaped as `@umriss-ui/schedule`'s `Subtask`. */
interface WorkItem {
  id: string;
  /** The project. */
  task: string;
  /** The person. */
  lane: string;
  from: number;
  to: number;
  name: string;
  sprint: string;
  /** Hours, as estimated at planning. */
  estimate: number;
  status: "to do" | "in progress" | "in review" | "done";
}

const item = (id: string, task: string, lane: string, from: number, to: number, name: string, estimate: number, status: WorkItem["status"]): WorkItem =>
  ({ id, task, lane, from, to, name, sprint: "sprint-14", estimate, status });

const WORK: readonly WorkItem[] = [
  item("w-101", "portal", "arjun", at(9), at(11, 17), "Sign-in with e-mail code", 18, "done"),
  item("w-102", "portal", "arjun", at(12), at(17, 17), "Profile page", 26, "in progress"),
  item("w-103", "portal", "chloe", at(9), at(10, 17), "Session handling", 12, "done"),
  item("w-104", "shop", "chloe", at(11), at(13, 17), "Basket keeps items across devices", 20, "in review"),
  item("w-105", "portal", "chloe", at(16), at(19, 17), "Change of address form", 24, "in progress"),
  item("w-106", "portal", "noah", at(9), at(12, 13), "Profile page design", 14, "done"),
  item("w-107", "shop", "noah", at(16), at(18, 17), "Search results layout", 12, "to do"),
  item("w-108", "portal", "eva", at(12), at(13, 17), "Test plan for sign-in", 10, "done"),
  item("w-109", "portal", "eva", at(17), at(20, 17), "Regression run", 20, "to do"),
  item("w-110", "booking", "hana", at(9), at(13, 17), "Reminder scheduling service", 32, "done"),
  item("w-111", "booking", "hana", at(16), at(20, 17), "Push notifications", 30, "in progress"),
  item("w-112", "booking", "kofi", at(10), at(12, 17), "Calendar sync", 18, "done"),
  item("w-113", "intranet", "kofi", at(16), at(18, 17), "News feed", 16, "in progress"),
  item("w-114", "booking", "freya", at(9), at(11, 17), "Reminder settings screen", 16, "done"),
  item("w-115", "booking", "freya", at(18), at(20, 17), "Store screenshots", 12, "to do"),
  item("w-116", "booking", "david", at(16), at(19, 13), "Device test matrix", 14, "to do"),
];

interface BurndownPoint {
  /** The working day, at 17:00. */
  t: number;
  /** Where the line would be, burning evenly. */
  ideal: number;
  /** Hours left, `null` for the days still to come. */
  remaining: number | null;
}

/** Sprint 14's ten working days. The team fell behind in the first week, when
    two were away, and is catching up. */
const BURNDOWN: readonly BurndownPoint[] = (() => {
  const total = WORK.reduce((sum, one) => sum + one.estimate, 0);
  const days = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20];
  const burnt = [0, 22, 38, 60, 71, 98];
  return days.map((day, i) => ({
    t: at(day, 17),
    ideal: Math.round(total * (1 - i / (days.length - 1))),
    remaining: burnt[i] === undefined ? null : total - burnt[i]!,
  }));
})();


export const title = "Show the values as a table";
export const lead = "`DataTable` adds a key to the legend that lays a table of what the chart shows over the plot, and takes it back.";

const day = (v: number) => new Date(v).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
const hours = (v: number) => `${v.toFixed(0)} h`;

export default function ValuesAsTable() {
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const toggle = (name: string) => setHidden((h) => (h.includes(name) ? h.filter((n) => n !== name) : [...h, name]));
  return (
    <Chart data={BURNDOWN} height={260} ariaLabel="Sprint 14: hours left against the ideal">
      <XAxis accessor={(d: BurndownPoint) => d.t} ticks={BURNDOWN.map((d) => d.t)} tickFormat={day} />
      <YAxis accessor={(d: BurndownPoint) => d.ideal} label="Hours left" />
      <Line accessor={(d: BurndownPoint) => d.ideal} name="Ideal" format={hours} hidden={hidden.includes("Ideal")} />
      <Line accessor={(d: BurndownPoint) => d.remaining} name="Remaining" format={hours} hidden={hidden.includes("Remaining")} />
      <Legend onToggle={toggle} />
      <Tooltip mode="x" />
      {/* The table lists what the chart shows: hide a series and it follows. */}
      <DataTable />
    </Chart>
  );
}
