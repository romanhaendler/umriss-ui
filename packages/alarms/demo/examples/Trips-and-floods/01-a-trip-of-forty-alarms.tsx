import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "A trip of forty alarms";

export const lead = "Forty alarms of one trip, raised within two seconds. Give them a `group`, and the earliest is marked “First out”; the times show seconds, so the order the mark claims can be read.";

/** Tuesday, 17 March 2026, 10:30:00. */
const NOW = new Date(2026, 2, 17, 10, 30, 0).getTime();

const TYPES: readonly AlarmType[] = [
  { id: "feed-pump", label: "Boiler feed pump tripped", priority: "critical" },
  { id: "low-level", label: "Drum level low", priority: "high" },
  { id: "flame", label: "Flame failure, burner", priority: "high" },
  { id: "pressure", label: "Steam pressure low", priority: "medium" },
];

/* The application's own `sequence` settles alarms whose `raised` collide: the
   pump and the level alarm come in the same millisecond, and the pump is first. */
const TRIP: readonly Alarm[] = Array.from({ length: 40 }, (_, i) => ({
  id: `trip-${i}`,
  type: i === 0 ? "feed-pump" : i === 1 ? "low-level" : i % 3 === 0 ? "flame" : "pressure",
  lifecycle: "active-unacknowledged" as const,
  raised: NOW - 1_900 + (i < 2 ? 0 : i * 45),
  group: "boiler-2",
  sequence: i,
}));

const view = alarmModel({
  alarms: TRIP,
  types: TYPES,
  asOf: NOW,
  // ISA-18.2's reference: more than 10 alarms in 10 minutes per operating position.
  flood: { windowMs: 600_000, atLeast: 11 },
});

export default function ATripOfFortyAlarms() {
  return <AlarmList view={view} density="compact" maxHeight="360px" />;
}
