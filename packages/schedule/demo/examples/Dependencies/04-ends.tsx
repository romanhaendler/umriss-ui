import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency, DependencyEnds } from "../../../src";

export const title = "Mark the ends with a dot";

export const lead = "`ends=\"dot\"` marks where each line is anchored, a help while reading; `\"none\"` keeps a plan of many short handovers quiet.";

/* Picture only, like `route` and `attach`; a single dependency may say
   otherwise for itself. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "design", task: "portal", lane: "noah", from: at(7), to: at(8), name: "Design" },
  { id: "build", task: "portal", lane: "arjun", from: at(8, 30), to: at(9, 30), name: "Build" },
  { id: "test", task: "portal", lane: "eva", from: at(10), to: at(11), name: "Test" },
];

const HANDOVERS: Dependency[] = [
  { id: "to-build", from: "design", to: "build", lag: min(15) },
  { id: "to-test", from: "build", to: "test", lag: min(15) },
];

function Variant({ ends }: { ends: DependencyEnds }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        ends=&quot;{ends}&quot;
      </Text>
      <Schedule ariaLabel={`Design, build and test, ends ${ends}`} initialDomain={[at(6, 30), at(11, 30)]} height={188} attach="nearest" ends={ends}>
        <Lane id="noah" label="Noah Fischer" />
        <Lane id="arjun" label="Arjun Mehta" />
        <Lane id="eva" label="Eva Novak" />
        <Dependencies data={HANDOVERS} />
        <Subtasks data={WORK} tasks={PROJECTS} />
      </Schedule>
    </Stack>
  );
}

export default function Ends() {
  return (
    <Stack gap={4}>
      <Variant ends="dot" />
      <Variant ends="none" />
    </Stack>
  );
}
