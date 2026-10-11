import { useMemo, useState } from "react";
import { AlarmList, alarmModel, snooze, useTableSelection } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 12) },
  { id: "a-2", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-3", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0) },
];

export const title = "Ask for a reason when snoozing";

export const lead = "Pass `snoozeReason` and “Snooze” opens a small panel instead of the menu: the durations, a field for the reason, and a button that reports. With `\"required\"` the button waits for text; your application stores the reason with `snooze()`.";

const MIN = 60_000;

/* The application's own rule: which durations an operator may choose. */
const DURATIONS = [15 * MIN, 60 * MIN, 4 * 60 * MIN] as const;

export default function AskForAReason() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(ALERTS);
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <AlarmList
      view={view}
      selection={selection}
      snoozeDurations={DURATIONS}
      snoozeReason="required"
      onSnooze={(ids, until, reason) => {
        setAlerts((current) => current.map((a) => (ids.includes(a.id) ? snooze(a, until, "Jonas Keller", reason) : a)));
        selection.clear();
      }}
    />
  );
}
