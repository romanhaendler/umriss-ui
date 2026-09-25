import { EmptyState, Stack } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, findings } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Say when there is nothing to fix";

export const lead = "When all three lists `findings` returns are empty, say so plainly instead of showing an empty list.";

const day = (d: number, hours = 9) => new Date(2026, 2, d, hours).getTime();

const PROJECTS: readonly Task[] = [{ id: "booking", name: "Booking app", color: "light-dark(#0d9488, #3cc7b8)" }];

const WORK: readonly Subtask[] = [
  { id: "w-111", task: "booking", lane: "hana", from: day(16), to: day(18, 17), name: "Push notifications" },
  { id: "w-113", task: "booking", lane: "kofi", from: day(16), to: day(18, 17), name: "Calendar sync" },
];

export default function NothingToFix() {
  const found = findings(WORK, []);
  const count = found.overlaps.length + found.violatedDependencies.length + found.inBlockedTime.length;

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Two developers' week, without findings" initialDomain={[day(16, 0), day(21, 0)]} height={140}>
        <Lane id="hana" label="Hana Sato" />
        <Lane id="kofi" label="Kofi Mensah" />
        <Subtasks data={WORK} tasks={PROJECTS} />
      </Schedule>
      {count === 0 && <EmptyState title="Nothing to fix" description="Nobody is double-booked, every hand-over fits, and no work falls into leave." />}
    </Stack>
  );
}
