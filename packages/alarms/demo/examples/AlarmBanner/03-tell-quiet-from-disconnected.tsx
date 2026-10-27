import { Stack } from "@umriss-ui/core";
import { AlarmBanner, alarmModel } from "../../../src";
import type { AlarmType } from "../../../src";

const TYPES: readonly AlarmType[] = [{ id: "checkout-latency", label: "Checkout · p95 latency above 300 ms", priority: "critical" }];

const NOW = Date.now();
const MIN = 60_000;
const FRESHNESS = { stale: MIN, lost: 5 * MIN };
const EMPTY = alarmModel({ alarms: [], types: TYPES, asOf: NOW });

export const title = "Tell quiet from disconnected";

export const lead = "Pass `asOf` and `freshness`: an empty banner on a live feed says there are no unacknowledged alerts, on a dead one that the connection is down.";

export default function TellQuietFromDisconnected() {
  return (
    <Stack gap={3}>
      <AlarmBanner view={EMPTY} asOf={NOW - 20_000} freshness={FRESHNESS} aria-label="Alerts, live feed" />
      <AlarmBanner view={EMPTY} asOf={NOW - 45 * MIN} freshness={FRESHNESS} aria-label="Alerts, feed lost" />
    </Stack>
  );
}
