import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "Mark a flood";

export const lead = "Give `alarmModel` a `flood` and a `chatter` rule: nine alerts in fifteen minutes are marked as a flood, and every one of them stays.";

const NOW = new Date(2026, 2, 17, 10, 30).getTime();
const MIN = 60_000;

const TYPES: AlarmType[] = [
  { id: "notifications-retry", label: "Notifications · sends retrying", priority: "low" },
  { id: "webhooks-timeout", label: "Webhooks · endpoint timeouts", priority: "medium" },
];

const ALERTS: readonly Alarm[] = [
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `n-${i}`,
    type: "notifications-retry",
    lifecycle: "active-unacknowledged" as const,
    raised: NOW - (4 + i) * MIN,
  })),
  { id: "w-1", type: "webhooks-timeout", lifecycle: "resolved-unacknowledged", raised: NOW - 320 * MIN, resolved: NOW - 300 * MIN },
];

const view = alarmModel({
  alarms: ALERTS,
  types: TYPES,
  asOf: NOW,
  // The chatter window covers the period shown, or the frequency column reads zero.
  chatter: { windowMs: 12 * 60 * MIN, atLeast: 5 },
  flood: { windowMs: 15 * MIN, atLeast: 8 },
});

export default function MarkAFlood() {
  return <AlarmList view={view} density="compact" />;
}
