import { useMemo } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../../../src";
import type { Alarm, AlarmType } from "../../../src";

export const title = "A flood is marked, never suppressed";

/* All forty rows stand there; the marking says that they came together.
   Deciding that a human should NOT see an alarm is a safety decision and does
   not belong in a user-interface library.

   Chatter is a statement about a TYPE over a window - and therefore cannot be
   formulated at all without the notion of an alarm type. A chattering type gets
   one row of attention, not seven.

   The lifecycle and priority values stay German: they belong to the alarm
   model. */

/* The reference is taken once at load time, so that the times are right for a
   human. The screenshot suite freezes the page's clock; `Date.now()` then
   yields the frozen moment, and the picture stays the same from run to run. */
const NOW = Date.now();
const MIN = 60_000;

const TYPES: AlarmType[] = [
  { id: "labeller", label: "Labeller · paper almost empty", priority: "low" },
  { id: "filter", label: "Extraction · filter fouled", priority: "medium" },
];

const ALARMS: readonly Alarm[] = [
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `f${i}`,
    type: "labeller",
    lifecycle: "standing-unacknowledged" as const,
    raised: NOW - (4 + i) * MIN,
  })),
  {
    id: "a5",
    type: "filter",
    lifecycle: "cleared-unacknowledged",
    raised: NOW - 320 * MIN,
    cleared: NOW - 300 * MIN,
  },
];

export default function FloodAndChatter() {
  const projection = useMemo(
    () =>
      alarmModel({
        alarms: ALARMS,
        types: TYPES,
        asOf: NOW,
        /* The window has to cover the period shown, or the frequency column
           shows a zero next to an alarm that is right there. */
        chatter: { windowMs: 12 * 60 * MIN, atLeast: 5 },
        flood: { windowMs: 15 * MIN, atLeast: 8 },
      }),
    [],
  );

  return (
    <Stack gap={3}>
      <AlarmList view={projection} density="compact" />
      <Text size="xs" tone="muted">
        Nine occurrences of one type in fifteen minutes: marked, and all nine stand there.
      </Text>
    </Stack>
  );
}
