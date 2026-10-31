import { Button, Stack } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "Print the list";
export const lead = "Nothing to set: a printed list is its alerts. The buttons of the bar stay off the sheet; each alert keeps its state as a word.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TYPES: readonly AlarmType[] = [
  { id: "latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "disk", label: "Image service · disk 85 % full", priority: "low" },
];

const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "latency", lifecycle: "active-unacknowledged", raised: at(10, 24) },
  { id: "a-2", type: "queue", lifecycle: "active-acknowledged", raised: at(7, 12), acknowledgedAt: at(8, 2) },
  { id: "a-3", type: "disk", lifecycle: "resolved-unacknowledged", raised: at(6), resolved: at(9, 15) },
];

const view = alarmModel({ alarms: ALERTS, types: TYPES, asOf: at(10, 30) });

export default function PrintTheList() {
  return (
    <Stack gap={3}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <AlarmList view={view} />
    </Stack>
  );
}
