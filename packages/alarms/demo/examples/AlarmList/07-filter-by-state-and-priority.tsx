import { useMemo, useState } from "react";
import { Select, Stack } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType, LifecycleState, Priority } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2 %", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0) },
];

export const title = "Filter by state and priority";

export const lead = "The list does not filter, the projection does: pass `filter` to `alarmModel` with the state and priority your own controls hold.";

export default function FilterByStateAndPriority() {
  const [state, setState] = useState<LifecycleState | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const view = useMemo(
    () =>
      alarmModel(
        { alarms: ALERTS, types: ALERT_TYPES, asOf: NOW },
        { filter: (row) => (state === "" || row.lifecycle === state) && (priority === "" || row.priority === priority) },
      ),
    [state, priority],
  );

  return (
    <Stack gap={3}>
      <Select size="sm" aria-label="State" value={state} onChange={(event) => setState(event.target.value as LifecycleState | "")}>
        <option value="">Any state</option>
        <option value="active-unacknowledged">Active, unacknowledged</option>
        <option value="active-acknowledged">Active, acknowledged</option>
        <option value="resolved-unacknowledged">Resolved, unacknowledged</option>
      </Select>
      <Select size="sm" aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority | "")}>
        <option value="">Any priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </Select>
      <AlarmList view={view} />
    </Stack>
  );
}
