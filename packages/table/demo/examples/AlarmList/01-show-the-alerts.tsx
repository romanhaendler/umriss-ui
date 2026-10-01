import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */
const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

const ALERT_TYPES: readonly AlarmType[] = [
  { id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" },
  { id: "checkout-errors", label: "Checkout · error rate above 2\u00a0%", priority: "high" },
  { id: "webhooks-queue", label: "Webhooks · queue older than 5 min", priority: "medium" },
  { id: "search-latency", label: "Search · p95 latency above 250 ms", priority: "medium" },
  { id: "images-disk", label: "Image service · disk 85 % full", priority: "low" },
  { id: "reports-job", label: "Reporting · nightly job late", priority: "low" },
];

/** The alerts as they stand at 10:30. */
const ALERTS: readonly Alarm[] = [
  { id: "a-1", type: "checkout-latency", lifecycle: "active-acknowledged", raised: at(17, 9, 41), acknowledgedAt: at(17, 9, 46) },
  { id: "a-2", type: "checkout-errors", lifecycle: "resolved-unacknowledged", raised: at(17, 9, 43), resolved: at(17, 10, 11) },
  { id: "a-3", type: "webhooks-queue", lifecycle: "active-acknowledged", raised: at(17, 7, 12), acknowledgedAt: at(17, 8, 2) },
  { id: "a-4", type: "search-latency", lifecycle: "active-unacknowledged", raised: at(17, 10, 24) },
  { id: "a-5", type: "search-latency", lifecycle: "resolved-acknowledged", raised: at(17, 8, 5), resolved: at(17, 8, 9), acknowledgedAt: at(17, 8, 6) },
  { id: "a-6", type: "images-disk", lifecycle: "active-unacknowledged", raised: at(17, 6, 0), availability: "snoozed", snooze: { until: at(17, 14), by: "Tomasz Nowak" } },
  { id: "a-7", type: "reports-job", lifecycle: "active-unacknowledged", raised: at(17, 4, 30), availability: "disabled" },
];

export const title = "Show the alerts";

export const lead = "Hand your alerts and their types to `alarmModel` and its projection to `AlarmList` as `view`; the worst stands first.";

const view = alarmModel({ alarms: ALERTS, types: ALERT_TYPES, asOf: NOW });

export default function ShowTheAlerts() {
  return <AlarmList view={view} />;
}
