import { useEffect, useMemo, useState } from "react";
import { Button, Stack, Switch } from "@umriss-ui/core";
import { AlarmList, acknowledge, alarmModel } from "../../../src";
import { useTableSelection } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "../../../src";

export const title = "A flood that ticks";

export const lead = "A thousand standing alarms and an as-of time that ticks once a second, with arrivals that soon make a flood. Focus, the ticked rows and the scroll position stay where the operator left them.";

const NOW = new Date(2026, 2, 17, 10, 30, 0).getTime();

const TYPES: readonly AlarmType[] = [
  ...Array.from({ length: 100 }, (_, i) => ({ id: `std-${i}`, label: `Standing ${i} · reading out of range`, priority: "medium" as const })),
  { id: "drift", label: "Sensor drift", priority: "low" },
];

/* The standing alarms are medium and the arrivals low, so the arrivals join at
   the end of the list and what the operator is looking at does not move. */
const STANDING: readonly Alarm[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `s-${i}`,
  type: `std-${i % 100}`,
  lifecycle: "active-unacknowledged" as const,
  raised: NOW - 3_600_000 - i * 1_000,
}));

const ARRIVALS_PER_TICK = 5;

export default function AFloodThatTicks() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);
  const [acknowledged, setAcknowledged] = useState<readonly string[]>([]);
  const asOf = NOW + ticks * 1_000;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setTicks((n) => n + 1), 1_000);
    return () => clearInterval(timer);
  }, [running]);

  const alarms = useMemo(() => {
    const arrivals: Alarm[] = Array.from({ length: ticks * ARRIVALS_PER_TICK }, (_, i) => ({
      id: `d-${i}`,
      type: "drift",
      lifecycle: "active-unacknowledged",
      raised: NOW + Math.floor(i / ARRIVALS_PER_TICK) * 1_000,
    }));
    return acknowledge([...STANDING, ...arrivals], acknowledged, asOf).alarms;
  }, [ticks, acknowledged, asOf]);

  const view = useMemo(
    () => alarmModel({ alarms, types: TYPES, asOf, flood: { windowMs: 600_000, atLeast: 11 } }),
    [alarms, asOf],
  );
  const selection = useTableSelection(view.filtered.map((row) => row.id));

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={3} align="center" wrap>
        <Button size="sm" onClick={() => setTicks((n) => n + 1)}>Tick</Button>
        <Switch label="Tick every second" checked={running} onChange={(event) => setRunning(event.target.checked)} />
      </Stack>
      <AlarmList
        view={view}
        density="compact"
        maxHeight="360px"
        selection={selection}
        onAcknowledge={(ids) => {
          setAcknowledged((current) => [...current, ...ids]);
          selection.clear();
        }}
      />
    </Stack>
  );
}
