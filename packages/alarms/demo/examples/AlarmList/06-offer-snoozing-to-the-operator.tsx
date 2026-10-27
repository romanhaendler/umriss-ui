import { useMemo, useState } from "react";
import { AlarmList, alarmModel, snooze, unsnooze } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-3", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-4", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-5", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

export const title = "Offer snoozing to the operator";

export const lead = "Pass `onSnooze` with `snoozeDurations`, and `onUnsnooze`: the list reports which alerts and until when; your application calls `snooze()` or `unsnooze()` on its own state, or refuses.";

const MIN = 60_000;

/* The application's own rule: which durations an operator may choose. */
const DURATIONS = [15 * MIN, 60 * MIN, 4 * 60 * MIN] as const;

export default function OfferSnoozing() {
  const [alerts, setAlerts] = useState<readonly Alarm[]>(ALERTS);
  const view = useMemo(() => alarmModel({ alarms: alerts, types: ALERT_TYPES, asOf: NOW }), [alerts]);
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <AlarmList
      view={view}
      selection={selection}
      snoozeDurations={DURATIONS}
      onSnooze={(ids, until) => {
        setAlerts((current) => current.map((a) => (ids.includes(a.id) ? snooze(a, until, "Jonas Keller") : a)));
        selection.clear();
      }}
      onUnsnooze={(ids) => {
        setAlerts((current) => current.map((a) => (ids.includes(a.id) ? unsnooze(a) : a)));
        selection.clear();
      }}
    />
  );
}
