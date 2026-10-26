import { useState } from "react";
import { Stack, Switch } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Mark the critical path";

export const lead = "The planning system works out the critical path and hands over its subtask ids; `muted` takes the rest back so the path reads first. The schedule computes nothing (ADR-0032), so the switch only changes what the application marks.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "design", task: "portal", lane: "noah", from: at(7), to: at(8), name: "Design" },
  { id: "copy", task: "portal", lane: "mira", from: at(7), to: at(8, 30), name: "Copy" },
  { id: "build", task: "portal", lane: "arjun", from: at(8, 30), to: at(9, 30), name: "Build" },
  { id: "test", task: "portal", lane: "eva", from: at(10), to: at(11), name: "Test" },
  { id: "docs", task: "portal", lane: "mira", from: at(9), to: at(10), name: "Docs" },
];

const HANDOVERS: Dependency[] = [
  { id: "design-build", from: "design", to: "build", lag: min(15) },
  { id: "copy-docs", from: "copy", to: "docs", lag: min(15) },
  { id: "build-test", from: "build", to: "test", lag: min(15) },
];

/* As the planning system hands it over. */
const CRITICAL_PATH = ["design", "build", "test"];

export default function CriticalPath() {
  const [marked, setMarked] = useState(true);
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [at(6, 30), at(11, 30)] } });

  const plan: Subtask[] = WORK.map((subtask): Subtask =>
    marked && !CRITICAL_PATH.includes(subtask.id) ? { ...subtask, appearance: ["muted"] } : subtask,
  );

  return (
    <Stack gap={3}>
      <Switch label="Mark the critical path" checked={marked} onChange={(event) => setMarked(event.target.checked)} />
      <Schedule aria-label="Portal work, the critical path marked" height={188} attach="nearest">
        <Lane id="noah" label="Noah Fischer" />
        <Lane id="mira" label="Mira Stone" />
        <Lane id="arjun" label="Arjun Mehta" />
        <Lane id="eva" label="Eva Novak" />
        <Dependencies data={HANDOVERS} />
        <Subtasks data={plan} tasks={PROJECTS} />
      </Schedule>
    </Stack>
  );
}
