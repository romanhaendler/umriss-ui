import { Stack } from "@umriss-ui/core";
import { AlarmList, alarmModel } from "../../../src";
import type { AlarmType } from "../../../src";

export const title = "Tell quiet from disconnected";

export const lead = "Pass `asOf` and `freshness`: an empty list on a live feed says there are no alerts, on a dead one that nothing is known.";

/* Taken once at load time; the screenshot suite freezes the clock, so the picture stays the same. */
const NOW = Date.now();
const MIN = 60_000;

const TYPES: AlarmType[] = [{ id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "high" }];
const EMPTY = alarmModel({ alarms: [], types: TYPES, asOf: NOW });
const FRESHNESS = { stale: 5 * MIN, lost: 30 * MIN };

export default function TellQuietFromDisconnected() {
  return (
    <Stack gap={4}>
      <AlarmList view={EMPTY} asOf={NOW - 20_000} freshness={FRESHNESS} aria-label="Alerts, live feed" />
      <AlarmList view={EMPTY} asOf={NOW - 45 * MIN} freshness={FRESHNESS} aria-label="Alerts, feed lost" />
    </Stack>
  );
}
