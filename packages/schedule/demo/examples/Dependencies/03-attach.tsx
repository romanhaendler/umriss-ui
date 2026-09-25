import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency, DependencyAttachment } from "../../../src";

export const title = "Choose where a line touches its bars";

export const lead = "`attach=\"nearest\"` meets the facing edges, so a short step between neighbouring lanes stays short; `\"centre\"` joins the middles.";

/* Picture only: `attach` changes no finding. Within one lane there is no
   nearer edge, and both mean the middle. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "release", name: "Release 4.12", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "build", task: "release", lane: "priya", from: at(7), to: at(8, 30), name: "Build" },
  { id: "review", task: "release", lane: "ada", from: at(9), to: at(10, 30), name: "Security review" },
  { id: "deploy", task: "release", lane: "sam", from: at(11), to: at(12), name: "Deploy" },
  /* Back up to Priya's lane: the step whose edges `attach` decides. */
  { id: "verify", task: "release", lane: "priya", from: at(12, 30), to: at(13), name: "Verify" },
];

const HANDOVERS: Dependency[] = [
  { id: "to-review", from: "build", to: "review", lag: min(20) },
  { id: "to-deploy", from: "review", to: "deploy", lag: min(20) },
  { id: "to-verify", from: "deploy", to: "verify", lag: min(20) },
];

function Variant({ attach }: { attach: DependencyAttachment }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        attach=&quot;{attach}&quot;
      </Text>
      <Schedule ariaLabel={`A release through three engineers, lines from the ${attach}`} initialDomain={[at(6, 30), at(13, 30)]} height={188} attach={attach}>
        <Lane id="priya" label="Priya Raman" />
        <Lane id="ada" label="Ada Mwangi" />
        <Lane id="sam" label="Sam Okafor" />
        <Dependencies data={HANDOVERS} />
        <Subtasks data={STEPS} tasks={TASKS} />
      </Schedule>
    </Stack>
  );
}

export default function Attach() {
  return (
    <Stack gap={4}>
      <Variant attach="centre" />
      <Variant attach="nearest" />
    </Stack>
  );
}
