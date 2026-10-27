import { useMemo, useState } from "react";
import { AlarmList, alarmModel, snooze } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
];

const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 12) },
  { id: "a-2", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-3", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0) },
];

export const title = "Offer the plant's reasons";

export const lead = "Pass `snoozeReasons` and the shelve panel offers them as choices above a field for a reason not on the list. With `snoozeReason=\"required\"`, “Shelve” waits until one is chosen or typed, and `onSnooze` reports exactly that reason.";

const MIN = 60_000;

/* The application's own lists: the durations an operator may choose, and the reasons its plant accepts. */
const DURATIONS = [15 * MIN, 60 * MIN, 4 * 60 * MIN] as const;
const REASONS = ["Valve being replaced", "Sensor drifting", "Planned maintenance"] as const;

export default function OfferReasons() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(ALERTS);
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <AlarmList
      view={view}
      selection={selection}
      snoozeDurations={DURATIONS}
      snoozeReasons={REASONS}
      snoozeReason="required"
      onSnooze={(ids, until, reason) => {
        setAlerts((current) => current.map((a) => (ids.includes(a.id) ? snooze(a, until, "Jonas Keller", reason) : a)));
        selection.clear();
      }}
    />
  );
}
