import { Button, Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Show a finding";

export const lead = "`scrollToSubtask` brings a subtask's lane and time into view and leaves the focus; `focusSubtask` also makes it the active subtask. Pick a finding, or press Enter on it.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const STATIONS = Array.from({ length: 60 }, (_, i) => ({ id: `station-${i + 1}`, label: `Station ${String(i + 1).padStart(2, "0")}` }));

const ORDERS: readonly Task[] = [{ id: "order", name: "Order O-7731", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: readonly Subtask[] = STATIONS.map((station, i) => ({
  id: `step-${i + 1}`,
  task: "order",
  lane: station.id,
  from: at(6 + (i % 10)),
  to: at(7 + (i % 10)),
}));

const FINDINGS = [
  { subtask: "step-4", text: "Station 04 starts before its material arrives" },
  { subtask: "step-37", text: "Station 37 overlaps a shift break" },
  { subtask: "step-58", text: "Station 58 ends after the cut-off" },
];

export default function ShowAFinding() {
  const { Schedule, Lane, Subtasks, scrollToSubtask, focusSubtask } = useSchedule({ initialView: { domain: [at(5, 30), at(10)] } });
  return (
    <Stack gap={2}>
      <Stack gap={1} data-findings>
        {FINDINGS.map((finding) => (
          <Button
            key={finding.subtask}
            data-finding={finding.subtask}
            onClick={() => scrollToSubtask(finding.subtask)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              focusSubtask(finding.subtask);
            }}
          >
            {finding.text}
          </Button>
        ))}
      </Stack>
      <Schedule aria-label="Sixty stations of one order" height={240}>
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" tone="muted">
        A click shows the subtask; Enter also moves the focus to the plot.
      </Text>
    </Stack>
  );
}
