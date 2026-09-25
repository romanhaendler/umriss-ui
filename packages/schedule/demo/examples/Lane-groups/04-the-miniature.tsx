import { useState } from "react";
import { Lane, LaneGroup, Schedule, Subtasks, Dependencies, applyIntent, findings } from "../../../src";
import { Stack, Text } from "@umriss-ui/core";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Read a folded group";

export const lead = "Folded, the depot shows each van as a thin strip: handovers still arrive, the double booking stays marked, and a held drag opens it.";

/* A drag held over the folded depot opens it for the gesture and shuts it
   again when the drag ends; the application's own list is never written to.
   `findings()` is computed from the data, so the count below is the same
   folded or not. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: Subtask[] = [
  { id: "t-01-1", task: "t-01", lane: "truck", from: at(6, 30), to: at(8), leadOut: min(15) },
  { id: "t-01-2", task: "t-01", lane: "van-2", from: at(9), to: at(11, 30), leadIn: min(30) },
  { id: "t-03-1", task: "t-03", lane: "van-1", from: at(7), to: at(9) },
  /* Claims the e-van while the Harbour tour still has it: an overlap. */
  { id: "t-03-2", task: "t-03", lane: "van-2", from: at(11), to: at(13), leadIn: min(15) },
  { id: "t-03-3", task: "t-03", lane: "van-3", from: at(13, 30), to: at(15) },
];

const HANDOVERS: Dependency[] = [
  /* Out of the truck, outside the depot group, into a van inside it. */
  { id: "h-1", from: "t-01-1", to: "t-01-2", lag: min(20) },
  { id: "h-2", from: "t-03-1", to: "t-03-2", lag: min(30) },
  { id: "h-3", from: "t-03-2", to: "t-03-3", lag: min(20) },
];

const FOUND = findings(LEGS, HANDOVERS);

export default function TheMiniature() {
  const [folded, setFolded] = useState<readonly string[]>(["north"]);
  const [legs, setLegs] = useState<readonly Subtask[]>(LEGS);
  const [last, setLast] = useState("Hold a bar over the folded depot");

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="A depot that folds into one row"
        initialDomain={[at(6), at(16)]}
        height={240}
        collapsedGroups={folded}
        onCollapsedGroupsChange={setFolded}
        intents={["move", "lane"]}
        onIntent={(intent) => {
          if (intent.kind === "place") return;
          setLegs((current) => current.map((leg) => applyIntent(leg, intent)));
          setLast(`${intent.subtask}: ${intent.kind}`);
        }}
      >
        <Lane id="truck" label="Truck FP 118 R" />
        <LaneGroup id="north" label="North depot">
          <Lane id="van-1" label="Van FP 214 K" />
          <Lane id="van-2" label="E-van FP 377 K" />
        </LaneGroup>
        <Lane id="van-3" label="Van FP 402 R" />
        <Dependencies data={HANDOVERS} />
        <Subtasks data={legs} tasks={TOURS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
      <Text size="sm" mono tone="secondary" data-findings-count>
        {FOUND.overlaps.length} overlap and {FOUND.violatedDependencies.length} violated dependency - folded or not
      </Text>
    </Stack>
  );
}
